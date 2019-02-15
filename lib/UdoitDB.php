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

class UdoitDB
{

    const TEST_EXPIRE_TIME = 5; // 5 seconds, may need to be adjusted

    private static $dbClass = 'PDO';
    public static $type;
    private static $user;
    private static $dsn;
    private static $password;
    private static $options;
    private static $pdo = null;
    private static $last_test_time = 0;

    public static function setup($db_type, $dsn, $db_user, $db_password, $db_options = [])
    {
        static::$type = $db_type;
        static::$user = $db_user;
        static::$dsn = $dsn;
        static::$password = $db_password;
        static::$options = $db_options;
    }

    // acts as a pass through for pdo that checks the connection
    public static function __callStatic($name, $args)
    {
        static::testAndReconnect();
        // test to see if the method exists on pdo
        if (!method_exists(static::$pdo, $name)) {
            throw new \RuntimeException("{$name} method does not exist on PDO object");
        }

        // pass through to pdo
        return call_user_func_array([static::$pdo, $name], $args);
    }

    public static function testAndReconnect($force_test = false)
    {
       // make sure we're still connected
        if (!static::test($force_test)) {
            static::connect();
        }
    }

    // runs a very basic query on the db to verify connection status
    public static function test($force = false)
    {
        if (empty(static::$pdo)) {
            return false;
        }

        try {
            $now = time();
            // check if forced or the last test time expired
            if ($force || (static::$last_test_time + self::TEST_EXPIRE_TIME) < $now) {
                static::$last_test_time = $now;
                static::$pdo->query('SELECT version()');
            }

            return true;
        } catch (\Exception $e) {
            error_log("Database Test Connection Error");
            error_log($e->getMessage());

            return false;
        }
    }

    public static function disconnect()
    {
        static::$pdo = null; // there's no disconnect w/ pdo, it's cleaned up when garbage collected
    }

    protected static function connect()
    {
        try {
            switch (static::$type) {
                case 'test':
                    $db = new PDO('sqlite::memory:');
                    break;

                case 'pgsql':
                    $db = new static::$dbClass(static::$dsn, static::$user, static::$password);
                    $db->query("SET TIME ZONE 'UTC'");
                    break;

                case 'mysql':
                    $db = new static::$dbClass(static::$dsn, static::$user, static::$password, static::$options);
                    $db->query("SET time_zone = '+00:00'");
                    break;

                default:
                    throw new \RuntimeException("Database type ".static::$type." not supported.");
                    break;
            }

            static::$last_test_time = time();
            static::$pdo = $db;
        } catch (\RuntimeException $e) {
            error_log("Database Connection Error");
            error_log($e->getMessage());
            echo('Database Connection error');
            exit();
        }
    }
}
