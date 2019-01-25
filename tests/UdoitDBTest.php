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

class UdoitDBTest extends BaseTest
{

    public static function setUpBeforeClass()
    {
        require_once(__DIR__.'/PDOMock.php');
        require_once(__DIR__.'/PDOStatementMock.php');
    }

    public function setUp()
    {
        self::setPrivateStaticPropertyValue('UdoitDB', 'dbClass', 'PDOMock');
    }

    public function tearDown()
    {
        self::clearMockDBConnection();
    }

    public function testMysqlSetup()
    {
        UdoitDB::setup('mysql', 'b', 'c', 'd', ['a' => 'b']);

        self::assertEquals('mysql', self::getPrivateStaticPropertyValue('UdoitDB', 'type'));
        self::assertEquals('b', self::getPrivateStaticPropertyValue('UdoitDB', 'dsn'));
        self::assertEquals('c', self::getPrivateStaticPropertyValue('UdoitDB', 'user'));
        self::assertEquals('d', self::getPrivateStaticPropertyValue('UdoitDB', 'password'));
        self::assertEquals(['a' => 'b'], self::getPrivateStaticPropertyValue('UdoitDB', 'options'));
    }

    public function testPsqlSetup()
    {
        UdoitDB::setup('pgsql', 'b', 'c', 'd');

        self::assertEquals('pgsql', self::getPrivateStaticPropertyValue('UdoitDB', 'type'));
        self::assertEquals('b', self::getPrivateStaticPropertyValue('UdoitDB', 'dsn'));
        self::assertEquals('c', self::getPrivateStaticPropertyValue('UdoitDB', 'user'));
        self::assertEquals('d', self::getPrivateStaticPropertyValue('UdoitDB', 'password'));
    }

    public function testConnectMysql()
    {
        UdoitDB::setup('mysql', 'b', 'c', 'd', ['a' => 'b']);
        UdoitDB::testAndReconnect();
        $pdo = self::getPrivateStaticPropertyValue('UdoitDB', 'pdo');
        self::assertInstanceOf(PDOMock, $pdo);
        self::assertArraySubset(['b', 'c', 'd', ['a' => 'b']], $pdo->constructor_args);
    }

    public function testConnectPgsql()
    {
        UdoitDB::setup('pgsql', 'b', 'c', 'd');
        UdoitDB::testAndReconnect();
        $pdo = self::getPrivateStaticPropertyValue('UdoitDB', 'pdo');
        self::assertInstanceOf(PDOMock, $pdo);
        self::assertArraySubset(['b'], $pdo->constructor_args);
    }

    public function testDisconnect()
    {
        UdoitDB::setup('mysql', 'b', 'c', 'd');
        UdoitDB::testAndReconnect();
        self::assertInstanceOf(PDOMock, self::getPrivateStaticPropertyValue('UdoitDB', 'pdo'));
        UdoitDB::disconnect();
        self::assertNull(self::getPrivateStaticPropertyValue('UdoitDB', 'pdo'));
    }

    public function testConnectionTestWithoutConnection()
    {
        UdoitDB::setup('mysql', 'b', 'c', 'd');
        self::assertFalse(UdoitDB::test());
    }

    public function testConnectionTestWithConnectionBeforeTimeoutDoesntRunQuery()
    {
        UdoitDB::setup('mysql', 'b', 'c', 'd');
        self::callProtectedStaticMethod('UdoitDB', 'connect');

        self::assertTrue(UdoitDB::test());
        $pdo = self::getPrivateStaticPropertyValue('UdoitDB', 'pdo');
        self::assertCount(1, $pdo->query_calls);
    }

    public function testConnectionTestWithConnectionBeforeTimeoutWithForceOnDoesRunQuery()
    {
        UdoitDB::setup('mysql', 'b', 'c', 'd');
        self::callProtectedStaticMethod('UdoitDB', 'connect');

        self::assertTrue(UdoitDB::test(true));
        $pdo = self::getPrivateStaticPropertyValue('UdoitDB', 'pdo');
        self::assertCount(2, $pdo->query_calls);
    }

    public function testConnectionTestWithConnectionAfterTimeoutDoesRunQuery()
    {
        UdoitDB::setup('mysql', 'b', 'c', 'd');
        self::callProtectedStaticMethod('UdoitDB', 'connect');
        self::setPrivateStaticPropertyValue('UdoitDB', 'last_test_time', 0);

        self::assertTrue(UdoitDB::test());
        $pdo = self::getPrivateStaticPropertyValue('UdoitDB', 'pdo');
        self::assertCount(2, $pdo->query_calls);
    }

    public function testPDOPassThroughCallsPDOFunction()
    {
        UdoitDB::setup('mysql', 'b', 'c', 'd');
        self::callProtectedStaticMethod('UdoitDB', 'connect');

        UdoitDB::query('QUERY VALUE HERE');
        $pdo = self::getPrivateStaticPropertyValue('UdoitDB', 'pdo');
        self::assertEquals('QUERY VALUE HERE', $pdo->query_calls[1][0]);
    }

    public function testPDOPassThroughWillReconnect()
    {
        UdoitDB::setup('mysql', 'b', 'c', 'd');
        self::assertFalse(UdoitDB::test());

        UdoitDB::query('QUERY VALUE HERE');
        self::assertTrue(UdoitDB::test());
    }
}
