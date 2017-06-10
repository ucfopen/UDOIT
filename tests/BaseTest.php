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

class MockObj {
  function __call($name, $args) {
    if (is_callable($this->$name)) {
      array_unshift($args, $this);
      return call_user_func_array($this->$name, $args);
    }
  }
}

class BaseTest extends PHPUnit_Framework_TestCase{

    protected static function getPrivateStaticPropertyValue($class, $prop){
        $class = new ReflectionClass($class);
        $p = $class->getProperty($prop);
        $p->setAccessible(true);
        return $p->getValue();
    }

    protected static function callProtectedStaticMethod($class, $method){
        $refClass = new ReflectionClass($class);
        $refMethod = $refClass->getMethod($method);
        $refMethod->setAccessible(true);
        return $refMethod->invokeArgs(null, array_slice(func_get_args(), 2));
    }

    protected static function setPrivateStaticPropertyValue($class, $prop, $value){
        $class = new ReflectionClass($class);
        $p = $class->getProperty($prop);
        $p->setAccessible(true);
        $p->setValue($value);
    }

    protected static function clearMockDBConnection(){
        self::setPrivateStaticPropertyValue('UdoitDB', 'dbClass', 'PDO');
        self::setPrivateStaticPropertyValue('UdoitDB', 'type', null);
        self::setPrivateStaticPropertyValue('UdoitDB', 'user', null);
        self::setPrivateStaticPropertyValue('UdoitDB', 'dsn', null);
        self::setPrivateStaticPropertyValue('UdoitDB', 'password', null);
        self::setPrivateStaticPropertyValue('UdoitDB', 'last_test_time', 0);
        self::setPrivateStaticPropertyValue('UdoitDB', 'pdo', null);
    }

    protected static function assertPDOStatementBindValueCalled($stmt, $key, $value){
        $found = [];
        foreach ($stmt->bind_value_calls as $call) {
            if ($call[0] == $key) $found = $call;
        }
        self::assertGreaterThanOrEqual(2, count($found), "Statement not found for $key");
        self::assertEquals($key, $found[0]);
        self::assertEquals($value, $found[1]);
    }

    /**
     * Mock Httpful\Request::get() results to return what we want
     * both arguments incriment the return value on each call
     * First call returns $header_to_array_returns[0] and body_returns[0]
     * Yea, this is pretty cryptic and nested, mocking chained function calls php is gnarly
     */
    protected static function mockGetRequestResult(Array $header_to_array_returns, Array $body_returns){
        $called = -1;
        // mock *get()* from Httpful\Request::get()
        $mock_get = new MockObj();
        // mock *send()* from Httpful\Request::get()->send()
        $mock_get->send = $mock_send = function() use(&$called, $header_to_array_returns, $body_returns)  {
            $called++;
            // mock *$response* from $response = Httpful\Request::get()->send()
            $mock_response = new MockObj();
            // mock *headers* from Httpful\Request::get()->send()->headers
            $mock_response->headers = new MockObj();
            // mock *toArray()* from Httpful\Request::get()->send()->headers->toArray()
            $mock_response->headers->toArray = function() use(&$called, $header_to_array_returns) {
                return $header_to_array_returns[$called];
            };
            $mock_response->body = $body_returns[$called];
            return $mock_response;
         };

         // mock *followRedirects()* on Httpful\Request::get()->followRedirects()
         $mock_get->followRedirects = function() use(&$mock_send ) {
            $m = new MockObj();
            // mock *expectsHtml()* on Httpful\Request::get()->followRedirects()->expectsHtml()
            $m->expectsHtml = function() use(&$mock_send) {
                // mock *send()* on Httpful\Request::get()->followRedirects()->expectsHtml()->send()
                $m = new MockObj();
                $m->send = $mock_send;
                return $m;
            };
            return $m;
        };

         return $mock_get;
    }

}
