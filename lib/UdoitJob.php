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

        // create insert query
        $sth = UdoitDB::prepare("
            INSERT INTO job_queue
                (user_id, job_group, job_type, data, status)
            VALUES
                (:user_id, :job_group, :job_type, :data, 'new')"
        );

        $sth->bindValue(':user_id', $user_id);
        $sth->bindValue(':job_group', $group_id);
        $sth->bindValue(':data', json_encode($data));
        $sth->bindValue(':job_type', $type);
        $sth->execute();
    }

    public static function countJobsRemaining()
    {
        $sql = "SELECT COUNT(*) FROM job_queue WHERE status = 'new'";
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
                    static::finalizeReport($job->job_group);
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

    protected static function isJobGroupReadyToFinalize($groupId)
    {
        $sql = "
        SELECT count(*)
        FROM job_queue
        WHERE
            status NOT IN ('finished', 'error')
            and job_group = :group_id";

        $sth = UdoitDB::prepare($sql);
        $sth->bindValue(':group_id', $groupId);

        if (!$sth->execute()) {
            error_log(print_r($sth->errorInfo(), true));

            return false;
        }

        return $sth->fetchColumn() == 0;
    }

    protected static function finalizeReport($job_group)
    {
        global $logger;
        $logger->addInfo("Finalizing Report job_group: {$job_group}");
        $report = static::combineJobResults($job_group);
        $report['job_group'] = $job_group;
        $report['course'] = $job_data['course_title'];
        // @TODO: deal with course_id inside combineResults
        $job_data = json_decode($job->data, true);

        // create a record of the report
        global $db_reports_table;
        $sql = "
            INSERT INTO {$db_reports_table}
                (user_id, course_id, report_json, errors, suggestions)
            VALUES
                (:userid, :courseid, :report_json, :errors, :suggestions)";

        // if using postgres, ask to get the id back since lastInsertId won't work
        if ('pgsql' === UdoitDB::$type) {
            $sql .= ' RETURNING id';
        }

        $sth = UdoitDB::prepare($sql);
        $sth->bindValue(':userid', $job->user_id, PDO::PARAM_INT);
        $sth->bindValue(':courseid', $job_data['course_id'], PDO::PARAM_INT);
        $sth->bindValue(':report_json', json_encode($report), PDO::PARAM_STR);
        $sth->bindValue(':errors', $report['total_results']['errors'], PDO::PARAM_STR);
        $sth->bindValue(':suggestions', $report['total_results']['suggestions'], PDO::PARAM_STR);

        if (!$sth->execute()) {
            error_log(print_r($sth->errorInfo(), true));
            throw new Exception('Error inserting report into database');
        }

        if ('pgsql' === UdoitDB::$type) {
            $res = $sth->fetch(PDO::FETCH_ASSOC);
            $report_id = $res['id'];
        } else {
            $report_id = UdoitDB::lastInsertId();
        }

        // set the report_id column for all the jobs in the group
        $sql = "UPDATE job_queue SET report_id = :report_id WHERE job_group = :job_group";
        $sth = UdoitDB::prepare($sql);
        $sth->bindValue(':report_id', $report_id);
        $sth->bindValue(':job_group', $job_group);
        $sth->execute();

        if (!$sth->execute()) {
            error_log(print_r($sth->errorInfo(), true));
            throw new Exception('Error setting report id');
        }

        return ['report_id' => $report_id ];
    }

    protected static function combineJobResults($job_group)
    {
        $totals = ['errors' => 0, 'warnings' => 0, 'suggestions' => 0];
        $unscannables_items = [];
        $content = [];

        // combine the data from each job's results
        $sql = "SELECT * FROM job_queue WHERE job_group = '{$job_group}'";
        $rows = UdoitDB::query($sql)->fetchAll();
        foreach ($rows as $row) {
            $results = json_decode($row['results'], true);

            // collect all the error counts
            $totals['errors']      += $results['total_results']['errors'];
            $totals['warnings']    += $results['total_results']['warnings'];
            $totals['suggestions'] += $results['total_results']['suggestions'];

            // if unscannables are found, collect them
            if (!empty($results['scan_results']['unscannable'])) {
                $unscannables_items = array_merge($unscannables_items, $results['scan_results']['unscannable']);
                unset($results['scan_results']['unscannable']);
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
        }

        return [
            'total_results' => $totals,
            'content'       => $content,
        ];
    }

    protected static function getNextJob()
    {
        // it's important that this claims the next job, not allowing other processes to grab it.
        // we LOCK this row using 'FOR UPDATE' then update it's status so other queries don't find it
        UdoitDB::beginTransaction();
        $sql = "SELECT * FROM job_queue WHERE status = 'new' ORDER BY id";
        if ('test' !== UdoitDB::$type) {
            $sql .= " FOR UPDATE"; // SQLITE doesn't support SELECT... FOR UPDATE
        }
        $sql .= " LIMIT 1";
        if (!($query = UdoitDB::query($sql))) {
            return false; // return false if theres nothing
        }

        $job = $query->fetchObject();
        $sql = "UPDATE job_queue SET status = 'running' WHERE id = '{$job->id}' AND status = 'new'";
        UdoitDB::query($sql);
        UdoitDB::commit();

        return $job;
    }

    protected static function finishJobWithResults($job_id, $result)
    {
        $sql = "UPDATE job_queue SET status = :status, results = :results, date_completed = CURRENT_TIMESTAMP WHERE id = :job_id";
        $sth = UdoitDB::prepare($sql);
        $sth->bindValue(':job_id', $job_id);
        $sth->bindValue(':status', 'finished');
        $sth->bindValue(':results', json_encode($result));
        $sth->execute();
    }

    protected static function updateJobStatus($job, $status)
    {
        $sql = "UPDATE job_queue SET status = '{$status}' WHERE id = {$job->id}";
        UdoitDB::query($sql);
    }
}
