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

class UdoitTest extends BaseTest
{
    public function setUp()
    {
        Mockery::close();
    }

    public function tearDown()
    {
        UdoitDB::disconnect();
        Mockery::close();
    }

    public function testApiParseLinksParsesLinkHeadersCorrectly()
    {
        $link_header = '<https://url.com/current>; rel="current",'.
            '<https://url.com/next>; rel="next",'.
            '<https://url.com/first>; rel="first",'.
            '<https://url.com/last>; rel="last"';

        $result = static::callProtectedStaticMethod(Udoit, 'apiParseLinks', $link_header);

        self::assertEquals('https://url.com/current', $result['current']);
        self::assertEquals('https://url.com/next', $result['next']);
        self::assertEquals('https://url.com/first', $result['first']);
        self::assertEquals('https://url.com/last', $result['last']);
    }

    public function testApiGetAllLinksFollowsLinkHeadersAndReturnsExpectedResults()
    {

        $header_to_array_returns = [
            ['link' => '<test_url2?>; rel="next"'], // first call
            ['link' => '<test_url3?>; rel="next"'], // second call
            ['link' => ''],
        ];

        $body_returns = [
            ["body_0_a", "body_0_b"],
            ["body_1_a", "body_1_b"],
            ["body_2_a", "body_2_b"],
        ];

        $mock_get_result = self::mockGetRequestResult($header_to_array_returns, $body_returns);

        // overload Httpful\Request::get() to return $mock_get
        Mockery::mock('overload:Httpful\Request')
            ->shouldReceive('get')
            ->andReturn($mock_get_result);

        $result = static::callProtectedStaticMethod(Udoit, 'apiGetAllLinks', 'api_key', 'test_url1?');

        self::assertCount(6, $result);
        self::assertArraySubset(['body_0_a', 'body_0_b', 'body_1_a', 'body_1_b', 'body_2_a', 'body_2_b'], $result);
    }

    public function testGetCoursContentGetsMultipleItems()
    {
        $header_to_array_returns = [
            ['link' => '<test_url2?>; rel="next"'], // first call
            ['link' => '<test_url3?>; rel="next"'], // second call
            ['link' => ''],
        ];

        $body_returns = [
            [
                (object) [
                    'id' => "id_value",
                    'message' => 'message_value',
                    'title' => 'title_value',
                    'html_url' => 'url_value',
                ],
            ],
            [
                (object) [
                    'id' => "id_value2",
                    'message' => 'message_value2',
                    'title' => 'title_value2',
                    'html_url' => 'url_value2',
                ],
            ],
            [],
        ];

        $mock_get_result = self::mockGetRequestResult($header_to_array_returns, $body_returns);

        // overload Httpful\Request::get() to return $mock_get
        Mockery::mock('overload:Httpful\Request')
            ->shouldReceive('get')
            ->andReturn($mock_get_result);

        $result = Udoit::getCourseContent('', '', '', 'announcements');

        self::assertCount(2, $result['items']);
        self::assertEquals('id_value', $result['items'][0]['id']);
        self::assertEquals('id_value2', $result['items'][1]['id']);
    }

    public function testGetCoursContentBuildsExpectedReturnStructure()
    {
        $body_returns = [[]];

        $mock_get_result = self::mockGetRequestResult([], $body_returns);

        // overload Httpful\Request::get() to return $mock_get
        Mockery::mock('overload:Httpful\Request')
            ->shouldReceive('get')
            ->andReturn($mock_get_result);

        $result = Udoit::getCourseContent('', '', '', 'announcements');

        self::assertArrayHasKey('items', $result);
        self::assertArrayHasKey('amount', $result);
        self::assertArrayHasKey('time', $result);
        self::assertArrayHasKey('module_urls', $result);
        self::assertArrayHasKey('unscannable', $result);

        self::assertEmpty($result['module_urls']);
        self::assertEmpty($result['unscannable']);
        self::assertEmpty($result['items']);
    }

    public function testGetCoursContentGetsAnnouncements()
    {
        $body_returns = [
            [
                (object) [
                    'id' => "id_value",
                    'message' => 'message_value',
                    'title' => 'title_value',
                    'html_url' => 'url_value',
                ],
            ],
            [],
        ];

        $mock_get_result = self::mockGetRequestResult([], $body_returns);

        // overload Httpful\Request::get() to return $mock_get
        Mockery::mock('overload:Httpful\Request')
            ->shouldReceive('get')
            ->andReturn($mock_get_result);

        $result = Udoit::getCourseContent('', '', '', 'announcements');

        self::assertEmpty($result['module_urls']);
        self::assertEmpty($result['unscannable']);
        self::assertCount(1, $result['items']);

        self::assertArrayHasKey('id', $result['items'][0]);
        self::assertArrayHasKey('content', $result['items'][0]);
        self::assertArrayHasKey('title', $result['items'][0]);
        self::assertArrayHasKey('url', $result['items'][0]);

        self::assertEquals('id_value', $result['items'][0]['id']);
        self::assertEquals('message_value', $result['items'][0]['content']);
        self::assertEquals('title_value', $result['items'][0]['title']);
        self::assertEquals('url_value', $result['items'][0]['url']);
    }

    public function testGetCoursContentGetsAssignments()
    {
        $body_returns = [
            [
                (object) [
                    'id' => "id_value",
                    'description' => 'description_value',
                    'name' => 'name_value',
                    'html_url' => 'url_value',
                ],
            ],
            [],
        ];

        $mock_get_result = self::mockGetRequestResult([], $body_returns);

        // overload Httpful\Request::get() to return $mock_get
        Mockery::mock('overload:Httpful\Request')
            ->shouldReceive('get')
            ->andReturn($mock_get_result);

        $result = Udoit::getCourseContent('', '', '', 'assignments');

        self::assertEmpty($result['module_urls']);
        self::assertEmpty($result['unscannable']);
        self::assertCount(1, $result['items']);

        self::assertArrayHasKey('id', $result['items'][0]);
        self::assertArrayHasKey('content', $result['items'][0]);
        self::assertArrayHasKey('title', $result['items'][0]);
        self::assertArrayHasKey('url', $result['items'][0]);

        self::assertEquals('id_value', $result['items'][0]['id']);
        self::assertEquals('description_value', $result['items'][0]['content']);
        self::assertEquals('name_value', $result['items'][0]['title']);
        self::assertEquals('url_value', $result['items'][0]['url']);
    }

    public function testGetCoursContentGetsDiscussions()
    {
        $body_returns = [
            [
                (object) [
                    'id' => "id_value",
                    'message' => 'message_value',
                    'title' => 'title_value',
                    'html_url' => 'url_value',
                ],
            ],
            [],
        ];

        $mock_get_result = self::mockGetRequestResult([], $body_returns);

        // overload Httpful\Request::get() to return $mock_get
        Mockery::mock('overload:Httpful\Request')
            ->shouldReceive('get')
            ->andReturn($mock_get_result);

        $result = Udoit::getCourseContent('', '', '', 'discussions');

        self::assertEmpty($result['module_urls']);
        self::assertEmpty($result['unscannable']);
        self::assertCount(1, $result['items']);

        self::assertArrayHasKey('id', $result['items'][0]);
        self::assertArrayHasKey('content', $result['items'][0]);
        self::assertArrayHasKey('title', $result['items'][0]);
        self::assertArrayHasKey('url', $result['items'][0]);

        self::assertEquals('id_value', $result['items'][0]['id']);
        self::assertEquals('message_value', $result['items'][0]['content']);
        self::assertEquals('title_value', $result['items'][0]['title']);
        self::assertEquals('url_value', $result['items'][0]['url']);
    }


    public function testGetCoursContentGetsUnscannableFiles()
    {
        $header_to_array_returns = [
            ['link' => ''], // just one page
        ];

        $body_returns = [
            [
                (object) [
                    'display_name' => "display_name_value.pdf",
                    'filename' => "filename.pdf",
                    'id' => 'id_value',
                    'url' => 'url_value',
                    'html_url' => 'url_value',
                ],
            ],
            [],
        ];

        $mock_get_result = self::mockGetRequestResult($header_to_array_returns, $body_returns);

        // overload Httpful\Request::get() to return $mock_get
        Mockery::mock('overload:Httpful\Request')
            ->shouldReceive('get')
            ->andReturn($mock_get_result);

        $result = Udoit::getCourseContent('', '', '', 'files');

        self::assertEmpty($result['module_urls']);
        self::assertCount(1, $result['unscannable']);
        self::assertEmpty($result['items']);

        self::assertArrayHasKey('title', $result['unscannable'][0]);
        self::assertArrayHasKey('url', $result['unscannable'][0]);

        self::assertEquals('display_name_value.pdf', $result['unscannable'][0]['title']);
        self::assertEquals('url_value', $result['unscannable'][0]['url']);
    }

    public function testGetCoursContentGetsFiles()
    {
        $header_to_array_returns = [
            ['link' => ''], // just one page
        ];

        $body_returns = [
            [
                (object) [
                    'display_name' => "display_name_value.html",
                    'filename' => "filename.html",
                    'id' => 'id_value',
                    'url' => 'url_value',
                    'html_url' => 'url_value',
                ],
            ],
            '<p>some html</p>',
            [],
        ];

        $mock_get_result = self::mockGetRequestResult($header_to_array_returns, $body_returns);

        // overload Httpful\Request::get() to return $mock_get
        Mockery::mock('overload:Httpful\Request')
            ->shouldReceive('get')
            ->andReturn($mock_get_result);

        $result = Udoit::getCourseContent('', '', '', 'files');

        self::assertEmpty($result['module_urls']);
        self::assertEmpty($result['unscannable']);
        self::assertCount(1, $result['items']);

        self::assertArrayHasKey('id', $result['items'][0]);
        self::assertArrayHasKey('content', $result['items'][0]);
        self::assertArrayHasKey('title', $result['items'][0]);
        self::assertArrayHasKey('url', $result['items'][0]);

        self::assertEquals('id_value', $result['items'][0]['id']);
        self::assertEquals('<p>some html</p>', $result['items'][0]['content']);
        self::assertEquals('display_name_value.html', $result['items'][0]['title']);
        self::assertEquals('url_value', $result['items'][0]['url']);
    }


    public function testGetCoursContentGetsPages()
    {
        $header_to_array_returns = [
            ['link' => ''], // just one page
        ];

        $body_returns = [
            [
                (object) [
                    'display_name' => "display_name_value.html",
                    'filename' => "filename.html",
                    'id' => 'id_value',
                    'url' => 'url_value',
                    'html_url' => 'url_value',
                ],
            ],
            (object) [
                'url' => 'url_value',
                'body' => 'body_value',
                'title' => 'title_value',
                'html_url' => 'html_url_value',
            ],
            [],
        ];

        $mock_get_result = self::mockGetRequestResult($header_to_array_returns, $body_returns);

        // overload Httpful\Request::get() to return $mock_get
        Mockery::mock('overload:Httpful\Request')
            ->shouldReceive('get')
            ->andReturn($mock_get_result);

        $result = Udoit::getCourseContent('', '', '', 'pages');

        self::assertEmpty($result['module_urls']);
        self::assertEmpty($result['unscannable']);
        self::assertCount(1, $result['items']);

        self::assertArrayHasKey('id', $result['items'][0]);
        self::assertArrayHasKey('content', $result['items'][0]);
        self::assertArrayHasKey('title', $result['items'][0]);
        self::assertArrayHasKey('url', $result['items'][0]);

        self::assertEquals('url_value', $result['items'][0]['id']);
        self::assertEquals('body_value', $result['items'][0]['content']);
        self::assertEquals('title_value', $result['items'][0]['title']);
        self::assertEquals('html_url_value', $result['items'][0]['url']);
    }

    public function testGetCoursContentFindsNoVieosInModulesCorrectly()
    {
        $header_to_array_returns = [
            ['link' => ''], // just one page
        ];

        $body_returns = [
            [
                (object) [
                    'items' => [
                        (object) [
                            'external_url' => "external_url_value",
                            'id' => 'id_value',
                            'url' => 'url_value',
                            'title' => 'title_value',
                        ],
                    ],
                ],
            ],
            [],
        ];

        $mock_get_result = self::mockGetRequestResult($header_to_array_returns, $body_returns);

        // overload Httpful\Request::get() to return $mock_get
        Mockery::mock('overload:Httpful\Request')
            ->shouldReceive('get')
            ->andReturn($mock_get_result);

        $result = Udoit::getCourseContent('', '', '', 'modules');

        self::assertEmpty($result['module_urls']);
        self::assertEmpty($result['unscannable']);
        self::assertEmpty($result['items']);
    }

    public function testGetCoursContentFindsVideosInModules()
    {
        $header_to_array_returns = [
            ['link' => ''], // just one page
        ];

        $body_returns = [
            [
                (object) [
                    'items' => [
                        (object) [
                            'external_url' => "external_url_value",
                            'id' => 'id_value',
                            'html_url' => 'html_url_value',
                            'title' => 'title_value',
                        ],
                        (object) [
                            'external_url' => "youtube_external_url_value",
                            'id' => 'id_value',
                            'html_url' => 'html_url_value',
                            'title' => 'title_value',
                        ],
                        (object) [
                            'external_url' => "vimeo_external_url_value",
                            'id' => 'id_value',
                            'html_url' => 'html_url_value',
                            'title' => 'title_value',
                        ],
                    ],
                ],
            ],
            [],
        ];

        $mock_get_result = self::mockGetRequestResult($header_to_array_returns, $body_returns);

        // overload Httpful\Request::get() to return $mock_get
        Mockery::mock('overload:Httpful\Request')
            ->shouldReceive('get')
            ->andReturn($mock_get_result);

        $result = Udoit::getCourseContent('', '', '', 'modules');

        self::assertCount(2, $result['module_urls']);
        self::assertEmpty($result['unscannable']);
        self::assertEmpty($result['items']);

        $m_urls = $result['module_urls'];
        self::assertArrayHasKey('id', $m_urls[0]);
        self::assertArrayHasKey('external_url', $m_urls[0]);
        self::assertArrayHasKey('title', $m_urls[0]);
        self::assertArrayHasKey('url', $m_urls[0]);

        self::assertArrayHasKey('id', $m_urls[1]);
        self::assertArrayHasKey('external_url', $m_urls[1]);
        self::assertArrayHasKey('title', $m_urls[1]);
        self::assertArrayHasKey('url', $m_urls[1]);

        self::assertEquals('id_value', $m_urls[0]['id']);
        self::assertEquals('youtube_external_url_value', $m_urls[0]['external_url']);
        self::assertEquals('title_value', $m_urls[0]['title']);
        self::assertEquals('html_url_value', $m_urls[0]['url']);
    }

    public function testGetCoursContentGetsSyllabus()
    {
        $header_to_array_returns = [];

        $body_returns = [
            [
                (object) [
                    'syllabus_body' => "content_value",
                    'id' => 'id_value',
                ],
            ],
            [],
        ];

        $mock_get_result = self::mockGetRequestResult($header_to_array_returns, $body_returns);

        // overload Httpful\Request::get() to return $mock_get
        Mockery::mock('overload:Httpful\Request')
            ->shouldReceive('get')
            ->andReturn($mock_get_result);

        $result = Udoit::getCourseContent('key', 'apiurl', 'course', 'syllabus');


        self::assertEmpty($result['module_urls']);
        self::assertEmpty($result['unscannable']);
        self::assertCount(1, $result['items']);

        self::assertArrayHasKey('id', $result['items'][0]);
        self::assertArrayHasKey('content', $result['items'][0]);
        self::assertArrayHasKey('title', $result['items'][0]);
        self::assertArrayHasKey('url', $result['items'][0]);

        self::assertEquals('id_value', $result['items'][0]['id']);
        self::assertEquals('content_value', $result['items'][0]['content']);
        self::assertEquals('Syllabus', $result['items'][0]['title']);
        self::assertEquals('apiurl/courses/course/assignments/syllabus', $result['items'][0]['url']);
    }

    public function testScanContentReturnsNothingWithNoCententToScan()
    {
        $content_items = [
            ['content' => ''],
        ];
        $result = Udoit::scanContent($content_items);
        self::assertEmpty($result);
    }

    public function testScanContentReturnsNothingWithNoItems()
    {
        $content_items = [];
        $result = Udoit::scanContent($content_items);
        self::assertEmpty($result);
    }

    public function testScanContentReportsErrors()
    {
        $content_items = [
            ['content' => '<img src="http://url.com/image.jpg"/>'],
            ['content' => '<img src="http://url.com/image.jpg"/>'],
        ];

        $result = Udoit::scanContent($content_items);

        self::assertCount(2, $result);

        self::assertArrayHasKey('id', $result[0]);
        self::assertArrayHasKey('name', $result[0]);
        self::assertArrayHasKey('url', $result[0]);
        self::assertArrayHasKey('amount', $result[0]);
        self::assertArrayHasKey('error', $result[0]);
        self::assertArrayHasKey('warning', $result[0]);
        self::assertArrayHasKey('suggestion', $result[0]);

        self::assertEmpty($result[0]['error']);
        self::assertEmpty($result[0]['warning']);
        self::assertCount(1, $result[0]['suggestion']);

        self::assertArrayHasKey('text_type', $result[0]['suggestion'][0]);
        self::assertArrayHasKey('type', $result[0]['suggestion'][0]);
        self::assertArrayHasKey('lineNo', $result[0]['suggestion'][0]);
        self::assertArrayHasKey('severity', $result[0]['suggestion'][0]);
        self::assertArrayHasKey('severity_num', $result[0]['suggestion'][0]);
        self::assertArrayHasKey('title', $result[0]['suggestion'][0]);
        self::assertArrayHasKey('description', $result[0]['suggestion'][0]);
        self::assertArrayHasKey('path', $result[0]['suggestion'][0]);
        self::assertArrayHasKey('html', $result[0]['suggestion'][0]);

        self::assertArrayHasKey('text_type', $result[0]['suggestion'][0]);
        self::assertArrayHasKey('type', $result[0]['suggestion'][0]);
        self::assertArrayHasKey('lineNo', $result[0]['suggestion'][0]);
        self::assertArrayHasKey('severity', $result[0]['suggestion'][0]);
        self::assertArrayHasKey('severity_num', $result[0]['suggestion'][0]);
        self::assertArrayHasKey('title', $result[0]['suggestion'][0]);
        self::assertArrayHasKey('description', $result[0]['suggestion'][0]);
        self::assertArrayHasKey('path', $result[0]['suggestion'][0]);
        self::assertArrayHasKey('html', $result[0]['suggestion'][0]);

        self::assertEquals(3, $result[0]['suggestion'][0]['severity_num']);
        self::assertEquals('imgHasAlt', $result[0]['suggestion'][0]['type']);
    }

    public function testSortReportGroupsReturnsExpectedOrder()
    {
        // an object compatible with sortReportGroups() that's out of order
        $report_json = '{
            "content": {
                "module_urls": {
                    "title": "module_urls",
                    "time": 0
                },
                "unscannable": {
                    "title": "unscannable",
                    "time": 0
                },
                "files": {
                    "title": "files",
                    "time": 4
                },
                "announcements": {
                    "title": "announcements",
                    "time": 1
                },
                "assignments": {
                    "title": "assignments",
                    "time": 2
                },
                "discussions": {
                    "title": "discussions",
                    "time": 0
                },
                "modules": {
                    "title": "modules",
                    "time": 0
                },
                "pages": {
                    "title": "pages",
                    "time": 0
                },
                "syllabus": {
                    "title": "syllabus",
                    "time": 0
                }
            }
        }';

        // the order we expect them to be in when finished
        $expected_key_order = [
            'announcements',
            'assignments',
            'discussions',
            'files',
            'pages',
            'syllabus',
            'module_urls',
            'unscannable',
        ];

        $testHandler = self::getTestHandler();

        $report = json_decode($report_json);
        $result = UdoitUtils::instance()->sortReportGroups($report->content);

        // verifty
        self::assertCount(8, $result);
        self::assertEquals(array_keys($result), $expected_key_order);
        self::assertEquals(1, $result['announcements']->time);
        self::assertEquals(2, $result['assignments']->time);
        self::assertEquals(4, $result['files']->time);

        self::assertTrue($testHandler->hasRecordThatContains('modules is an unkown report title, it will be omitted from the report.', \Monolog\Logger::WARNING));
    }

    public function testRetrieveAndScanBuildsBasicResponse()
    {
        $body_returns = [[]];

        $mock_get_result = self::mockGetRequestResult([], $body_returns);

        // overload Httpful\Request::get() to return $mock_get
        Mockery::mock('overload:Httpful\Request')
            ->shouldReceive('get')
            ->andReturn($mock_get_result);

        $result = Udoit::getCourseContent('', '', '', 'announcements');


        self::assertArrayHasKey('items', $result);
        self::assertArrayHasKey('amount', $result);
        self::assertArrayHasKey('time', $result);
        self::assertArrayHasKey('module_urls', $result);
        self::assertArrayHasKey('unscannable', $result);

        self::assertEmpty($result['items']);
        self::assertEmpty($result['module_urls']);
        self::assertEmpty($result['unscannable']);
        self::assertEquals(0, $result['amount']);
    }

    public function testRetrieveAndScanReturnsFiles()
    {
        $header_to_array_returns = [
            ['link' => ''], // just one page
        ];

        $body_returns = [
            [
                (object) [
                    'display_name' => "display_name_value.html",
                    'filename' => "filename.html",
                    'id' => 'id_value',
                    'url' => 'url_value',
                    'html_url' => 'url_value',
                ],
                (object) [
                    'display_name' => "display_name_value.pdf",
                    'filename' => "filename.pdf",
                    'id' => 'id_value',
                    'url' => 'url_value',
                    'html_url' => 'url_value',
                ],
            ],
            '<img src="http://url.com/image.jpg"/>',
            [],
        ];

        $mock_get_result = self::mockGetRequestResult($header_to_array_returns, $body_returns);

        // overload Httpful\Request::get() to return $mock_get
        Mockery::mock('overload:Httpful\Request')
            ->shouldReceive('get')
            ->andReturn($mock_get_result);

        $result = Udoit::retrieveAndScan('', '', '', 'files');

        self::assertArrayHasKey('scan_results', $result);

        self::assertEquals(0, $result['total_results']['errors']);
        self::assertEquals(0, $result['total_results']['warnings']);
        self::assertEquals(1, $result['total_results']['suggestions']);

        $res = $result['scan_results'];

        self::assertArrayHasKey('module_urls', $res);
        self::assertCount(1, $res['unscannable']);
        self::assertArrayHasKey('unscannable', $res);
        self::assertCount(1, $res['unscannable']);

        self::assertEquals('display_name_value.pdf', $res['unscannable'][0]['title']);
        self::assertEquals('url_value', $res['unscannable'][0]['url']);

        self::assertArrayHasKey('files', $res);
        self::assertArrayHasKey('title', $res['files']);
        self::assertArrayHasKey('items', $res['files']);
        self::assertArrayHasKey('amount', $res['files']);
        self::assertArrayHasKey('time', $res['files']);
        self::assertCount(1, $res['files']['items']);

        self::assertArrayHasKey('id', $res['files']['items'][0]);
        self::assertArrayHasKey('name', $res['files']['items'][0]);
        self::assertArrayHasKey('url', $res['files']['items'][0]);
        self::assertArrayHasKey('amount', $res['files']['items'][0]);
        self::assertArrayHasKey('error', $res['files']['items'][0]);
        self::assertArrayHasKey('warning', $res['files']['items'][0]);
        self::assertArrayHasKey('suggestion', $res['files']['items'][0]);

        self::assertCount(1, $res['files']['items'][0]['suggestion']);
        self::assertCount(1, $res['files']['items'][0]['suggestion']);
    }

    public function testRetrieveAndScanReturnsModules()
    {
        $header_to_array_returns = [
            ['link' => ''], // just one page
        ];

        $body_returns = [
            [
                (object) [
                    'items' => [
                        (object) [
                            'external_url' => "external_url_value",
                            'id' => 'id_value',
                            'html_url' => 'html_url_value',
                            'title' => 'title_value',
                        ],
                        (object) [
                            'external_url' => "youtube_external_url_value",
                            'id' => 'id_value',
                            'html_url' => 'html_url_value',
                            'title' => 'title_value',
                        ],
                        (object) [
                            'external_url' => "vimeo_external_url_value",
                            'id' => 'id_value',
                            'html_url' => 'html_url_value',
                            'title' => 'title_value',
                        ],
                    ],
                ],
            ],
            [],
        ];

        $mock_get_result = self::mockGetRequestResult($header_to_array_returns, $body_returns);

        // overload Httpful\Request::get() to return $mock_get
        Mockery::mock('overload:Httpful\Request')
            ->shouldReceive('get')
            ->andReturn($mock_get_result);

        $result = Udoit::retrieveAndScan('', '', '', 'modules');

        self::assertEquals(0, $result['totals']['errors']);
        self::assertEquals(0, $result['totals']['warnings']);
        self::assertEquals(0, $result['totals']['suggestions']);

        $res = $result['scan_results'];

        self::assertArrayHasKey('module_urls', $res);
        self::assertCount(2, $res['module_urls']);
        self::assertArrayHasKey('unscannable', $res);
        self::assertCount(0, $res['unscannable']);

        self::assertArrayHasKey('id', $res['module_urls']['0']);
        self::assertArrayHasKey('external_url', $res['module_urls']['0']);
        self::assertArrayHasKey('url', $res['module_urls']['0']);
        self::assertArrayHasKey('title', $res['module_urls']['0']);
    }
}
