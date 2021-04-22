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

class UdoitStatsTest extends BaseTest
{

    public static function setUpBeforeClass(): void
    {
        require_once(__DIR__.'/PDOMock.php');
        require_once(__DIR__.'/PDOStatementMock.php');
    }

    public function setUp(): void
    {
        Mockery::close();
        self::setPrivateStaticPropertyValue('UdoitDB', 'dbClass', 'PDOMock');
    }

    public function tearDown(): void
    {
        Mockery::close();
        self::clearMockDBConnection();
    }

    public function testInstance()
    {
        $result = UdoitStats::instance();
        self::assertInstanceOf('UdoitStats', $result);
    }

    public function testGetReports()
    {
        UdoitDB::setup('mysql', 'b', 'c', 'd', ['a' => 'b']);
        $test = new UdoitStats();

        $result = $test->getReports(false, "", "", "0");
        self::assertTrue($result === null);

        $result = $test->getReports(true, "", "", "0");
        self::assertTrue($result === null);

        $result = $test->getReports(false, "", "", "0", ['' => '', 'term_id' => '', 'user_id' => '1']);
        self::assertTrue($result === null);

        UdoitDB::setForceFail(true);
        $result = $test->getReports(false, "", "", "0");
        self::assertTrue($result === false);
    }

    public function testGetReportsCount()
    {
        UdoitDB::setup('mysql', 'b', 'c', 'd', ['a' => 'b']);
        $test = new UdoitStats();

        $result = $test->getReportsCount(false, "");
        self::assertTrue($result === null);

        $result = $test->getReportsCount(true, "");
        self::assertTrue($result === null);

        $result = $test->getReportsCount(false, "", ['' => '', 'term_id' => '', 'user_id' => '1']);
        self::assertTrue($result === null);

        UdoitDB::setForceFail(true);
        $result = $test->getReportsCount(false, "");
        self::assertTrue($result === false);
    }

    public function testGetReportJsons()
    {
        UdoitDB::setup('mysql', 'b', 'c', 'd', ['a' => 'b']);
        $test = new UdoitStats();

        $result = $test->getReportJsons();
        self::assertTrue($result === null);

        UdoitDB::setForceFail(true);
        $result = $test->getReportJsons();
        self::assertTrue($result === false);
    }

    public function testGetUsers()
    {
        UdoitDB::setup('mysql', 'b', 'c', 'd', ['a' => 'b']);
        $test = new UdoitStats();

        $result = $test->getUsers("", "");
        self::assertTrue($result === null);

        UdoitDB::setForceFail(true);
        $result = $test->getUsers("", "");
        self::assertTrue($result === false);
    }

    public function testGetUserCount()
    {
        UdoitDB::setup('mysql', 'b', 'c', 'd', ['a' => 'b']);
        $test = new UdoitStats();

        $result = $test->getUserCount();
        self::assertTrue($result === null);

        UdoitDB::setForceFail(true);
        $result = $test->getUserCount();
        self::assertTrue($result === false);
    }

    public function testCountNewUsers()
    {
        UdoitDB::setup('mysql', 'b', 'c', 'd', ['a' => 'b']);
        $test = new UdoitStats();
        $date = new DateTime();

        $result = $test->countNewUsers("", $date, $date, "", "");
        self::assertTrue($result === null);

        $result = $test->countNewUsers("day", $date, $date, "", "");
        self::assertTrue($result === null);

        UdoitDB::setForceFail(true);
        $result = $test->countNewUsers("", $date, $date, "", "");
        self::assertTrue($result === false);
    }

    public function testCountNewUsersCount()
    {
        UdoitDB::setup('mysql', 'b', 'c', 'd', ['a' => 'b']);
        $test = new UdoitStats();
        $date = new DateTime();

        $result = $test->countNewUsersCount("", $date, $date);
        self::assertTrue($result === null);

        $result = $test->countNewUsersCount("day", $date, $date);
        self::assertTrue($result === null);

        UdoitDB::setForceFail(true);
        $result = $test->countNewUsersCount("", $date, $date);
        self::assertTrue($result === false);
    }
}
