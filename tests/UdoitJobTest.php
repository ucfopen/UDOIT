<?php
/**
*   Copyright (C) 2014 University of Central Florida, created by Jacob Bates, Eric Colon, Fenel Joseph, and Emily Sachs.
*
*   This program is free software: you can redistribute it and/or modify
*   it under the terms of the GNU General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.
*
*   This program is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU General Public License for more details.
*
*   You should have received a copy of the GNU General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
*   Primary Author Contact:  Jacob Bates <jacob.bates@ucf.edu>
*/

class UdoitJobTest extends BaseTest
{
    public function setUp(): void
    {
        Mockery::close();
        global $db_type, $dsn, $db_user, $db_password;
        UdoitDB::setup($db_type, $dsn, $db_user, $db_password);
        UdoitDB::query("DROP TABLE IF EXISTS users");
        UdoitDB::query("DROP TABLE IF EXISTS reports");
        UdoitDB::query("DROP TABLE IF EXISTS job_queue");
        include(__DIR__.'/../bin/run_database_migrations.php');
    }

    public function tearDown(): void
    {
        self::setPrivateStaticPropertyValue('UdoitUtils', 'instance', null);
        UdoitDB::disconnect();
        Mockery::close();
    }

    public function mockGetValidRefreshKey()
    {
        $mock = new MockObj();
        $mock->getValidRefreshedApiKey = function () {
            return 'test_api_key';
        };
        self::setPrivateStaticPropertyValue('UdoitUtils', 'instance', $mock);
    }

    public function testExpireOldJobs()
    {
        global $background_job_expire_time;
        UdoitJob::$background_worker_enabled = true;
        UdoitJob::addJobToQueue('type', 55, 'expire_job_test', static::mockJobData());
        UdoitJob::addJobToQueue('type', 55, 'expire_job_test', static::mockJobData());
        UdoitJob::addJobToQueue('type', 55, 'expire_job_test', static::mockJobData());
        self::assertEquals(3, UdoitJob::countJobsRemaining());

        // expiring old jobs shouldn't do anything
        UdoitJob::expireOldJobs();
        self::assertEquals(3, UdoitJob::countJobsRemaining());

        // Let's change the date on a job
        $time = $background_job_expire_time + 1;

        switch (UdoitDB::$type) {
            case 'pgsql':
            case 'mysql':
                $sql = "UPDATE job_queue SET date_created = (now() - INTERVAL '{$time}' MINUTE)  where id = '1'";
                break;

            case 'test':
                $sql = "UPDATE job_queue SET date_created = datetime('now', '-{$time} minutes')  where id = '1'";
                break;
        }

        UdoitDB::query($sql);


        // expiring old jobs should remove one of the jobs
        UdoitJob::expireOldJobs();
        self::assertEquals(2, UdoitJob::countJobsRemaining());
    }

    public function testCreateJobGroupID()
    {
        self::assertStringStartsWith('job_', UdoitJob::createJobGroupId());
    }

    public function testAddJobToQueue()
    {
        UdoitJob::$background_worker_enabled = true;
        UdoitJob::addJobToQueue('type', 55, 'job_4', static::mockJobData());

        $res = UdoitDB::query("SELECT * FROM job_queue")->fetch();
        self::assertEquals(55, $res['user_id']);
        self::assertEquals('type', $res['job_type']);
        self::assertEquals(json_encode(static::mockJobData(), true), $res['data']);
        self::assertEquals('job_4', $res['job_group']);
        self::assertEquals('new', $res['status']);
        self::assertTrue(empty($res['results']));
    }

    public function testCountJobsRemaining()
    {
        UdoitJob::$background_worker_enabled = true;

        self::assertEquals(0, UdoitJob::countJobsRemaining());

        UdoitJob::addJobToQueue('type', 55, 'job_count_jobs_remain', static::mockJobData());
        self::assertEquals(1, UdoitJob::countJobsRemaining());

        UdoitJob::addJobToQueue('type', 55, 'job_count_jobs_remain', static::mockJobData());
        self::assertEquals(2, UdoitJob::countJobsRemaining());

        UdoitJob::addJobToQueue('type', 55, 'job_count_jobs_remain', static::mockJobData());
        self::assertEquals(3, UdoitJob::countJobsRemaining());

        // change status to running
        $sql = "UPDATE job_queue SET status = 'running' where id = '1'";
        UdoitDB::query($sql)->execute();

        self::assertEquals(2, UdoitJob::countJobsRemaining());

        // change status to finished
        $sql = "UPDATE job_queue SET status = 'finished' where id = '1'";
        UdoitDB::query($sql)->execute();

        self::assertEquals(2, UdoitJob::countJobsRemaining());

        // change status to finished
        $sql = "UPDATE job_queue SET status = 'finished'";
        UdoitDB::query($sql)->execute();

        self::assertEquals(0, UdoitJob::countJobsRemaining());
    }

    public function testIsJobGroupReadyToFinalize()
    {
        UdoitJob::$background_worker_enabled = true;
        UdoitJob::addJobToQueue('scan', 1, 'job_ready_to_finalize', static::mockJobData());
        UdoitJob::addJobToQueue('scan', 1, 'job_ready_to_finalize', static::mockJobData());
        self::assertEquals(2, UdoitJob::countJobsRemaining());

        $ready = self::callProtectedStaticMethod('UdoitJob', 'isJobGroupReadyToFinalize', 'job_ready_to_finalize');
        self::assertFalse($ready);

        // change status to finished
        $sql = "UPDATE job_queue SET status = 'finished' where id = '1'";
        UdoitDB::query($sql)->execute();
        self::assertEquals(1, UdoitJob::countJobsRemaining());

        $ready = self::callProtectedStaticMethod('UdoitJob', 'isJobGroupReadyToFinalize', 'job_ready_to_finalize');
        self::assertFalse($ready);

        // change status to finished
        $sql = "UPDATE job_queue SET status = 'finished' where id = '2'";
        UdoitDB::query($sql)->execute();
        self::assertEquals(0, UdoitJob::countJobsRemaining());

        $ready = self::callProtectedStaticMethod('UdoitJob', 'isJobGroupReadyToFinalize', 'job_ready_to_finalize');
        self::assertTrue($ready);

        // change status to error
        $sql = "UPDATE job_queue SET status = 'error' where id = '2'";
        UdoitDB::query($sql)->execute();
        self::assertEquals(0, UdoitJob::countJobsRemaining());

        $ready = self::callProtectedStaticMethod('UdoitJob', 'isJobGroupReadyToFinalize', 'job_ready_to_finalize');
        self::assertTrue($ready);
    }

    public function testGetNextJobChangesStatusToRunning()
    {
        UdoitJob::$background_worker_enabled = true;
        UdoitJob::addJobToQueue('type', 11, 'job_4', static::mockJobData());
        UdoitJob::addJobToQueue('type', 22, 'job_5', static::mockJobData());
        $job = self::callProtectedStaticMethod('UdoitJob', 'getNextJob');

        // make sure it gets the first of the 2 jobs
        self::assertEquals(11, $job->user_id);

        // make sure it gets the next job because the first is now running
        $job = self::callProtectedStaticMethod('UdoitJob', 'getNextJob');
        self::assertEquals(22, $job->user_id);
    }

    public function testGetNextJobHandlesNoJobsGracefully()
    {
        UdoitJob::$background_worker_enabled = true;
        $job = self::callProtectedStaticMethod('UdoitJob', 'getNextJob');

        self::assertFalse($job);
    }

    public function testGetNextJobHandlesJobsOutOfOrder()
    {
        UdoitJob::$background_worker_enabled = true;
        UdoitJob::addJobToQueue('type', 11, 'job_5', static::mockJobData());
        UdoitJob::addJobToQueue('type', 22, 'job_5', static::mockJobData());
        UdoitJob::addJobToQueue('type', 33, 'job_5', static::mockJobData());

        // change status to finished for middle job
        $sql = "UPDATE job_queue SET status = 'finished' where id = '2'";
        UdoitDB::query($sql)->execute();

        // should get first job
        $job = self::callProtectedStaticMethod('UdoitJob', 'getNextJob');
        self::assertEquals(11, $job->user_id);

        // should get last job
        $job = self::callProtectedStaticMethod('UdoitJob', 'getNextJob');
        self::assertEquals(33, $job->user_id);
    }


    public function testFinalizeReportProcessesJobsAndWritesReportToDB()
    {
        self::mockGetValidRefreshKey();
        // create a user (id will be 1)
        UdoitDB::query("INSERT into users (api_key, refresh_token) VALUES ('sample_api_key', 'refresh_token')");

        // no need to mock http - scan_item 'test' won't try to call the api
        UdoitJob::$background_worker_enabled = false;
        UdoitJob::addJobToQueue('scan', 1, 'job_4', static::mockJobData());
        UdoitJob::addJobToQueue('scan', 1, 'job_4', static::mockJobData());
        UdoitJob::addJobToQueue('scan', 1, 'job_4', static::mockJobData());

        UdoitJob::runNextJob();
        UdoitJob::runNextJob();
        UdoitJob::runNextJob();

        $jobs = UdoitDB::query("SELECT * FROM job_queue WHERE job_group = 'job_4'")->fetchAll();
        self::assertCount(3, $jobs);
        self::assertEquals('finished', $jobs[0]['status']);
        self::assertEquals('finished', $jobs[1]['status']);
        self::assertEquals('finished', $jobs[2]['status']);

        // check the report contents
        $reports = UdoitDB::query("SELECT * FROM reports")->fetchAll();
        self::assertCount(1, $reports);
        $report = json_decode($reports[0]['report_json'], true);

        self::assertArrayHasKey('total_results', $report);
        self::assertArrayHasKey('course', $report);
        self::assertArrayHasKey('content', $report);
        self::assertArrayHasKey('job_group', $report);
        self::assertEquals('job_4', $report['job_group']);
    }


    public function testUpdateJobStatus()
    {
        self::mockGetValidRefreshKey();
        UdoitDB::query("INSERT into users (api_key, refresh_token) VALUES ('sample_api_key', 'refresh_token')");
        UdoitJob::$background_worker_enabled = false;
        UdoitJob::addJobToQueue('scan', 1, 'job_3', static::mockJobData());
        $job = (object) ['id' => 1, 'user_id' => 1];

        self::callProtectedStaticMethod('UdoitJob', 'updateJobStatus', $job, 'broken');

        $jobs = UdoitDB::query("SELECT * FROM job_queue WHERE job_group = 'job_3'")->fetchAll();

        self::assertEquals('broken', $jobs[0]['status']);
    }

    public function testFinalizeProperlyCombinesJobResults()
    {
        // set up the api refresh key so job queue will be ok
        self::mockGetValidRefreshKey();
        UdoitDB::query("INSERT into users (api_key, refresh_token) VALUES ('sample_api_key', 'refresh_token')");
        UdoitJob::$background_worker_enabled = false;

        // add 2 scanns for fake test data
        // setting scan_item to test will bypass all the api fetching that normally happens
        UdoitJob::addJobToQueue('scan', 1, 'job_4', static::mockJobData());
        UdoitJob::addJobToQueue('scan', 1, 'job_4', static::mockJobData());
        UdoitJob::addJobToQueue('scan', 1, 'job_4', static::mockJobData());

        // replace the results of the first 2 jobs with our own mock data
        $sth = UdoitDB::prepare("UPDATE job_queue set results = :results, status = 'finished' WHERE id = :id");
        $sth->bindValue(':results', file_get_contents(__DIR__.'/retriveAndScanResults1.json'));
        $sth->bindValue(":id", 1);
        $sth->execute();
        $sth->bindValue(':results', file_get_contents(__DIR__.'/retriveAndScanResults2.json'));
        $sth->bindValue(":id", 2);
        $sth->execute();

        UdoitJob::runNextJob();

        // get all the jobs that were queued
        // index 0,1 should be the scans while index 2 should be the finalize_report
        $jobs = UdoitDB::query("SELECT * FROM job_queue WHERE job_group = 'job_4'")->fetchAll();
        self::assertCount(3, $jobs);
        self::assertEquals('scan', $jobs[0]['job_type']);
        self::assertEquals('scan', $jobs[1]['job_type']);
        self::assertEquals('scan', $jobs[2]['job_type']);

        // get the matching report from the report table
        $report_row = UdoitDB::query("SELECT * from reports")->fetch();
        $report = json_decode($report_row['report_json'], true);

        self::assertArrayHasKey('course', $report);
        self::assertArrayHasKey('course_id', $report);
        self::assertArrayHasKey('user_id', $report);
        self::assertArrayHasKey('job_group', $report);

        self::assertEquals('course title', $report['course']);
        self::assertEquals(5555, $report['course_id']);
        self::assertEquals(1, $report['user_id']);
        self::assertEquals('job_4', $report['job_group']);

        self::assertArrayHasKey('total_results', $report);
        self::assertArrayHasKey('content', $report);

        self::assertArrayHasKey('errors', $report['total_results']);
        self::assertEquals(0, $report['total_results']['errors']);

        self::assertArrayHasKey('warnings', $report['total_results']);
        self::assertEquals(0, $report['total_results']['warnings']);

        self::assertArrayHasKey('suggestions', $report['total_results']);
        self::assertEquals(3, $report['total_results']['suggestions']);

        // theres 1 unscannable in scan results 1
        self::assertArrayHasKey('unscannable', $report['content']);
        self::assertArrayHasKey('title', $report['content']['unscannable']);
        self::assertArrayHasKey('items', $report['content']['unscannable']);
        self::assertArrayHasKey('amount', $report['content']['unscannable']);
        self::assertCount(1, $report['content']['unscannable']['items']);

        // theres 1 file in scan results 1
        self::assertArrayHasKey('files', $report['content']);
        self::assertArrayHasKey('title', $report['content']['files']);
        self::assertArrayHasKey('items', $report['content']['files']);
        self::assertArrayHasKey('amount', $report['content']['files']);
        self::assertCount(1, $report['content']['files']['items']);

        // theres 2 module_urls in scan results 2
        self::assertArrayHasKey('module_urls', $report['content']);
        self::assertArrayHasKey('title', $report['content']['module_urls']);
        self::assertArrayHasKey('items', $report['content']['module_urls']);
        self::assertCount(2, $report['content']['module_urls']['items']);
    }

    protected function mockJobData()
    {
       // common data object
        return [
            'course_title' => 'course title',
            'base_uri'     => 'http://baseurl.com',
            'title'        => 'context title',
            'course_id'    => '5555',
            'scan_item'    => 'test',
            'course_locale'=> 'en',
            'report_type'  => "all",
            'flag'         => '1'
        ];
    }
}
