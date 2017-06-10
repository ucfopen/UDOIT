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
class IndexTest extends BaseTest
{
    protected function setUp() {
        // $this->exampleDir = vfsStream::setup('exampleDir'); // this resets after every test
        // UdoitJob::$reports_dir = vfsStream::url('exampleDir'); // this resets after every test
        UdoitDB::setup('test', 'b', 'c', 'd');
        include(__DIR__.'/../lib/db_create_tables.php');
        Mockery::close();
    }

    protected function tearDown(){
        UdoitDB::disconnect();
        Mockery::close();
    }

    public function testApiParseLinksParsesLinkHeadersCorrectly() {
        $_POST = [];
        $_POST['custom_canvas_user_id'] = 5;
        $_POST['custom_canvas_course_id'] = 5;
        $_POST['oauth_consumer_key'] = 5;
        $_POST['context_label'] = 5;
        $_POST['context_title'] = 5;
        $_POST['custom_canvas_api_domain'] = 5;
        ob_start();
        include(__DIR__.'/../public/index.php');
        $buffer = ob_get_clean();
        self::assertContains('<title>UDOIT Accessibility Checker</title>', $buffer);
    }
}