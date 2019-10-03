<?php

class UdoitJob
{

    public static $background_worker_enabled = false;

    public static function createJobGroupId()
    {
        return uniqid('job_', true); // uniqid used to represent a group of jobs (they share this id)
    }

    public static function addJobToQueue($type, $user_id, $group_id, array $data)
    {

        global $db_job_queue_table;
        // create insert query
        $sth = UdoitDB::prepare("
            INSERT INTO {$db_job_queue_table}
                (user_id, job_group, job_type, data, status)
            VALUES
                (:user_id, :job_group, :job_type, :data, 'new')");

        $sth->bindValue(':user_id', $user_id);
        $sth->bindValue(':job_group', $group_id);
        $sth->bindValue(':data', json_encode($data));
        $sth->bindValue(':job_type', $type);
        $sth->execute();
    }

    public static function countJobsRemaining()
    {
        global $db_job_queue_table;
        $sql = "SELECT COUNT(*) FROM {$db_job_queue_table} WHERE status = 'new'";
        $query = UdoitDB::query($sql);

        return $query ? (int) $query->fetchColumn() : 0;
    }

    public static function runNextJob()
    {
        $job_failed = false;

        try {
            if ($job = static::getNextJob()) {
                $api_key = UdoitUtils::instance()->getValidRefreshedApiKey($job->user_id);
                if (empty($api_key)) {
                    throw new Exception("No valid api key for job"); // @TODO: mark job as unrunnable
                }
                $job_data = json_decode($job->data, true);
                $canvas_api_url = $job_data['base_uri'];
                $result = Udoit::retrieveAndScan($api_key, $canvas_api_url, $job_data['course_id'], $job_data['scan_item']);

                static::finishJobWithResults($job->id, $result);

                if (static::isJobGroupReadyToFinalize($job->job_group)) {
                    static::finalizeReport($job->job_group, $job_data);
                }
            }
        } catch (Exception $e) {
            $job_failed = true;
            global $logger;
            $logger->addError($e->getMessage());
            $logger->addError(print_r($job, true));
            if ($job) {
                self::updateJobStatus($job_record, 'error');
            }
        }

        return $job_failed;
    }

    public static function expireOldJobs()
    {
        global $background_job_expire_time;
        global $db_job_queue_table;
        $time = 20;
        switch (UdoitDB::$type) {
            case 'pgsql':
            case 'mysql':
                $sql = "UPDATE {$db_job_queue_table} SET status = 'expired' WHERE date_created < (now() - INTERVAL {$background_job_expire_time} MINUTE)";
                break;

            case 'test':
                $sql = "UPDATE {$db_job_queue_table} SET status = 'expired' WHERE date_created < datetime('now', '-{$background_job_expire_time} minutes')";
                break;
        }

        UdoitDB::query($sql);
    }

    public static function isJobGroupReadyToFinalize($groupId)
    {
        global $db_job_queue_table;
        global $logger;
        $sql = "
        SELECT count(*)
        FROM {$db_job_queue_table}
        WHERE
            status NOT IN ('finished', 'error')
            and job_group = :group_id";

        $sth = UdoitDB::prepare($sql);
        $sth->bindValue(':group_id', $groupId);

        if (!$sth->execute()) {
            $logger->addError(print_r($sth->errorInfo(), true));

            return false;
        }

        return $sth->fetchColumn() == 0;
    }

    protected static function finalizeReport($job_group, $job_data)
    {
        global $logger;
        global $db_reports_table;
        global $db_job_queue_table;
        $logger->addInfo("Finalizing Report job_group: {$job_group}");
        $report = static::combineJobResults($job_group);

        // add some jobdata info
        $report['course']    = $job_data['course_title'];
        $report['course_id'] = $job_data['course_id'];

        // create a record of the report
        $sql = "
            INSERT INTO {$db_reports_table}
                (user_id, course_id, report_json, errors, suggestions)
            VALUES
                (:user_id, :course_id, :report_json, :errors, :suggestions)";

        // if using postgres, ask to get the id back since lastInsertId won't work
        if ('pgsql' === UdoitDB::$type) {
            $sql .= ' RETURNING id';
        }

        $sth = UdoitDB::prepare($sql);
        $sth->bindValue(':user_id', $report['user_id'], PDO::PARAM_INT);
        $sth->bindValue(':course_id', $report['course_id'], PDO::PARAM_INT);
        $sth->bindValue(':report_json', json_encode($report), PDO::PARAM_STR);
        $sth->bindValue(':errors', $report['total_results']['errors'], PDO::PARAM_STR);
        $sth->bindValue(':suggestions', $report['total_results']['suggestions'], PDO::PARAM_STR);

        if (!$sth->execute()) {
            $logger->addError(print_r($sth->errorInfo(), true));
            throw new Exception('Error inserting report into database');
        }

        if ('pgsql' === UdoitDB::$type) {
            $res = $sth->fetch(PDO::FETCH_ASSOC);
            $report_id = $res['id'];
        } else {
            $report_id = UdoitDB::lastInsertId();
        }

        // set the report_id column for all the jobs in the group
        $sql = "UPDATE {$db_job_queue_table} SET report_id = :report_id WHERE job_group = :job_group";
        $sth = UdoitDB::prepare($sql);
        $sth->bindValue(':report_id', $report_id);
        $sth->bindValue(':job_group', $job_group);
        $sth->execute();

        if (!$sth->execute()) {
            $logger->addError(print_r($sth->errorInfo(), true));
            throw new Exception('Error setting report id');
        }

        return ['report_id' => $report_id ];
    }

    protected static function combineJobResults($job_group)
    {
        global $logger;
        global $db_job_queue_table;
        $totals = ['errors' => 0, 'warnings' => 0, 'suggestions' => 0];
        $unscannables_items = [];
        $content = [];
        $error_summary = [];
        $suggestion_summary = [];

        // combine the data from each job's results
        $sql = "SELECT * FROM {$db_job_queue_table} WHERE job_group = '{$job_group}'";
        $jobs = UdoitDB::query($sql)->fetchAll();
        foreach ($jobs as $job) {
            $results = json_decode($job['results'], true);

            // collect all the error counts
            $totals['errors']      += $results['total_results']['errors'];
            $totals['suggestions'] += $results['total_results']['suggestions'];

            // if the scan results array is empty for some reason,
            // make sure it's an empty array and continue.
            if (empty($results['scan_results'])) {
                $results['scan_results'] = [];
            }

            // if unscannables are found, collect them
            if (!empty($results['scan_results']['unscannable'])) {
                $unscannables_items = array_merge($unscannables_items, $results['scan_results']['unscannable']);
                unset($results['scan_results']['unscannable']);
            }

            // collect errors
            if (is_array($results['scan_results']['error_summary']) || is_object($results['scan_results']['error_summary'])) {
                foreach ($results['scan_results']['error_summary'] as $item => $data) {
                    if (!isset($error_summary[$item])) {
                        $error_summary[$item] = $data;
                    } else {
                        $error_summary[$item]['count'] += $data['count'];
                    }
                }
            }

            // collect suggestions
            if (is_array($results['scan_results']['suggestion_summary']) || is_object($results['scan_results']['suggestion_summary'])) {
                foreach ($results['scan_results']['suggestion_summary'] as $item => $data) {
                    if (!isset($suggestion_summary[$item])) {
                        $suggestion_summary[$item] = $data;
                    } else {
                        $suggestion_summary[$item]['count'] += $data['count'];
                    }
                }
            }

            // merge the scan results
            $content = array_merge($content, $results['scan_results']);
        }

        if (!empty($unscannables_items)) {
            $content['unscannable'] = [
                'title' => 'unscannable',
                'items' => $unscannables_items,
                'amount' => count($unscannables_items),
            ];
        } else {
            $content['unscannable'] = ['amount' => 0];
        }

        return [
            'course'             => null,
            'course_id'          => null,
            'user_id'            => $job['user_id'],
            'job_group'          => $job_group,
            'total_results'      => $totals,
            'error_summary'      => $error_summary,
            'suggestion_summary' => $suggestion_summary,
            'content'            => $content,
        ];
    }

    protected static function getNextJob()
    {
        // it's important that this claims the next job, not allowing other processes to grab it.
        // we LOCK this row using 'FOR UPDATE' then update it's status so other queries don't find it
        global $logger;
        global $db_job_queue_table;

        UdoitDB::beginTransaction();
        $sql = "SELECT * FROM {$db_job_queue_table} WHERE status = 'new' ORDER BY id";

        // MySQL and Postgres are strict about the order, but are opposite of each other
        switch (UdoitDB::$type) {
            case 'mysql':
                $sql .= ' LIMIT 1 FOR UPDATE';
                break;
            case 'pgsql':
                $sql .= ' FOR UPDATE LIMIT 1';
                break;
            default:
                // We don't know if other db types will support row locking
                $sql .= ' LIMIT 1';
        }

        if (!($query = UdoitDB::query($sql))) {
            $logger->addError('Error locking job, rolling back db.  Error contents:\r\n'.print_r(UdoitDB::errorInfo(), true));
            UdoitDB::rollBack();

            return false; // return false if theres nothing
        }

        $job = $query->fetchObject();
        $sql = "UPDATE {$db_job_queue_table} SET status = 'running' WHERE id = '{$job->id}' AND status = 'new'";
        UdoitDB::query($sql);
        UdoitDB::commit();

        return $job;
    }

    protected static function finishJobWithResults($job_id, $result)
    {
        global $db_job_queue_table;
        $sql = "UPDATE {$db_job_queue_table} SET status = :status, results = :results, date_completed = CURRENT_TIMESTAMP WHERE id = :job_id";
        $sth = UdoitDB::prepare($sql);
        $sth->bindValue(':job_id', $job_id);
        $sth->bindValue(':status', 'finished');
        $sth->bindValue(':results', json_encode($result));
        $sth->execute();
    }

    protected static function updateJobStatus($job, $status)
    {
        global $db_job_queue_table;
        $sql = "UPDATE {$db_job_queue_table} SET status = '{$status}' WHERE id = {$job->id}";
        UdoitDB::query($sql);
    }
}
