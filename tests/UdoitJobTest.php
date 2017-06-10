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
use org\bovigo\vfs\vfsStream;
use org\bovigo\vfs\vfsStreamDirectory;

class UdoitJobTest extends BaseTest{

    protected function setUp() {
        $this->exampleDir = vfsStream::setup('exampleDir'); // this resets after every test
        UdoitJob::$reports_dir = vfsStream::url('exampleDir'); // this resets after every test
        UdoitDB::setup('test', 'b', 'c', 'd');
        include(__DIR__.'/../lib/db_create_tables.php');
    }

    protected function tearDown(){
        UdoitDB::disconnect();
    }

    public function testCreateJobGroupID(){
        self::assertStringStartsWith('job_', UdoitJob::createJobGroupId());
    }

    public function testAddJobToQueue(){
        UdoitJob::$background_worker_enabled = true;
        UdoitJob::addJobToQueue('type', 55, 'job_4', ['data' => 'data_value']);

        $res = UdoitDB::query("SELECT * FROM job_queue")->fetch();
        self::assertEquals(55, $res['user_id']);
        self::assertEquals('type', $res['job_type']);
        self::assertEquals('{"data":"data_value"}', $res['data']);
        self::assertEquals('job_4', $res['job_group']);
        self::assertEquals('new', $res['status']);
        self::assertTrue(empty($res['results']));
    }

    public function testAddJobToQueueRunsNextJob(){
        // create a user (id will be 1)
        UdoitDB::query("INSERT into users (api_key) VALUES ('sample_api_key')");

        // turn off background worker and add a job for this user
        UdoitJob::$background_worker_enabled = false;
        UdoitJob::addJobToQueue('type_2', 1, 'job_5', ['data2' => 'data_value2']);

        // expect the job to have been run
        $res = UdoitDB::query("SELECT * FROM job_queue")->fetch();

        self::assertEquals(1, $res['user_id']);
        self::assertEquals('type_2', $res['job_type']);
        self::assertEquals('{"data2":"data_value2"}', $res['data']);
        self::assertEquals('job_5', $res['job_group']);
        self::assertEquals('finished', $res['status']);
        self::assertTrue(!empty($res['results']));
    }

    public function testCountJobsRemaining(){
        UdoitJob::$background_worker_enabled = true;

        self::assertEquals(0, UdoitJob::countJobsRemaining());

        UdoitJob::addJobToQueue('type', 55, 'job_4', ['data' => 'data_value']);
        self::assertEquals(1, UdoitJob::countJobsRemaining());

        UdoitJob::addJobToQueue('type', 55, 'job_4', ['data2' => 'data_value2']);
        self::assertEquals(2, UdoitJob::countJobsRemaining());
    }

    public function testGetNextJobChangesStatusToRunning(){
        UdoitJob::$background_worker_enabled = true;
        UdoitJob::addJobToQueue('type', 11, 'job_4', ['data' => 'data_value']);
        UdoitJob::addJobToQueue('type', 22, 'job_5', ['data' => 'data_value']);
        $job = self::callProtectedStaticMethod('UdoitJob', 'getNextJob');

        // make sure it gets the first of the 2 jobs
        self::assertEquals(11, $job->user_id);

        // make sure it gets the next job because the first is now running
        $job = self::callProtectedStaticMethod('UdoitJob', 'getNextJob');
        self::assertEquals(22, $job->user_id);

    }

    public function testGetNextJobHandlesNoJobsGracefully(){
        UdoitJob::$background_worker_enabled = true;
        $job = self::callProtectedStaticMethod('UdoitJob', 'getNextJob');

        self::assertFalse($job);
    }

    public function testFinalizeReportProcessesJobsAndWritesReportToFile(){
        // create a user (id will be 1)
        UdoitDB::query("INSERT into users (api_key) VALUES ('sample_api_key')");

        // no need to mock http - scan_item 'test' won't try to call the api
        UdoitJob::$background_worker_enabled = false;
        UdoitJob::addJobToQueue('scan', 1, 'job_3', ['data' => 'data_value', 'scan_item' => 'test']);
        UdoitJob::addJobToQueue('scan', 1, 'job_4', ['data' => 'data_value', 'scan_item' => 'test']);
        UdoitJob::addJobToQueue('scan', 1, 'job_4', ['data2' => 'data_value2', 'scan_item' => 'test']);
        UdoitJob::addJobToQueue('finalize_report', 1, 'job_4', ['data' => 'result!', 'course_title' => 'test_course']);

        $jobs = UdoitDB::query("SELECT * FROM job_queue WHERE job_group = 'job_4'")->fetchAll();
        self::assertCount(3, $jobs);
        self::assertEquals('finished', $jobs[0]['status']);
        self::assertEquals('finished', $jobs[1]['status']);
        self::assertEquals('finished', $jobs[2]['status']);

        // check the report contents
        $report_file = json_decode($jobs[2]['results'], 1)['file'];
        self::assertStringStartsWith('vfs://exampleDir/1/', $report_file);
        $contents = file_get_contents($report_file);
        $report = json_decode($contents, true);

        self::assertArrayHasKey('total_results', $report);
        self::assertArrayHasKey('course', $report);
        self::assertArrayHasKey('content', $report);
        self::assertEquals('test_course', $report['course']);
    }

    // public function testGetApiKeyFromJob(){
    //     UdoitDB::query("INSERT into users (api_key) VALUES ('sample_api_key')");
    //     $job = (object) ['id' => 9, 'user_id' => 1];
    //     $key = self::callProtectedStaticMethod('UdoitJob', 'getApiKeyFromJob', $job);
    //     self::assertEquals('sample_api_key', $key);
    // }

    /**
     * @expectedException Exception
     */
    // public function testGetApiKeyFromJobThrowsWhenTheresNoKey(){
    //     UdoitDB::query("INSERT into users (api_key) VALUES ('sample_api_key')");

    //     $job = (object) ['id' => 9, 'user_id' => 2];
    //     // NOTE: using phpunit's @expectedException above ^^^^ self::expectException(Exception::class);
    //     $key = self::callProtectedStaticMethod('UdoitJob', 'getApiKeyFromJob', $job);
    //     // nothing after this line will execute
    // }

    public function testUpdateJobStatus(){
        UdoitDB::query("INSERT into users (api_key) VALUES ('sample_api_key')");
        UdoitJob::$background_worker_enabled = false;
        UdoitJob::addJobToQueue('scan', 1, 'job_3', ['data' => 'data_value', 'scan_item' => 'test']);
        $job = (object) ['id' => 1, 'user_id' => 1];

        self::callProtectedStaticMethod('UdoitJob', 'updateJobStatus', $job, 'broken');

        $jobs = UdoitDB::query("SELECT * FROM job_queue WHERE job_group = 'job_3'")->fetchAll();

        self::assertEquals('broken', $jobs[0]['status']);
    }

    public function testFinalizeProperlyCombinesJobResults(){
        UdoitDB::query("INSERT into users (api_key) VALUES ('sample_api_key')");
        UdoitJob::$background_worker_enabled = false;
        UdoitJob::addJobToQueue('scan', 1, 'job_4', ['data' => 'data_value', 'scan_item' => 'test']);
        UdoitJob::addJobToQueue('scan', 1, 'job_4', ['data2' => 'data_value2', 'scan_item' => 'test']);

        $sth = UdoitDB::prepare("UPDATE job_queue set results = :results WHERE id = :id");
        $sth->bindValue(':results', file_get_contents(__DIR__.'/retriveAndScanResults1.json'));
        $sth->bindValue(":id", 1);
        $sth->execute();
        $sth->bindValue(':results', file_get_contents(__DIR__.'/retriveAndScanResults2.json'));
        $sth->bindValue(":id", 2);
        $sth->execute();

        // Causes UdoitJob::combineJobResults to be called
        UdoitJob::addJobToQueue('finalize_report', 1, 'job_4', ['data' => 'result!', 'course_title' => 'test_course']);

        $res = UdoitDB::query("SELECT * FROM job_queue WHERE job_type = 'finalize_report'")->fetch();

        // check the report contents
        $report_file = json_decode($res['results'], 1)['file'];
        self::assertStringStartsWith('vfs://exampleDir/1/', $report_file);
        $contents = file_get_contents($report_file);
        $report = json_decode($contents, true);

        self::assertArrayHasKey('total_results', $report);
        self::assertArrayHasKey('content', $report);

        self::assertArrayHasKey('errors', $report['total_results']);
        self::assertEquals(0, $report['total_results']['errors']);

        self::assertArrayHasKey('warnings', $report['total_results']);
        self::assertEquals(0, $report['total_results']['warnings']);

        self::assertArrayHasKey('suggestions', $report['total_results']);
        self::assertEquals(1, $report['total_results']['suggestions']);

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

}
