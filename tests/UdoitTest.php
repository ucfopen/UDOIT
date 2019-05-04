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

        $result = static::callProtectedStaticMethod('Udoit', 'apiParseLinks', $link_header);

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

        $result = static::callProtectedStaticMethod('Udoit', 'apiGetAllLinks', 'api_key', 'test_url1?');

        self::assertCount(6, $result);
        self::assertArraySubset(['body_0_a', 'body_0_b', 'body_1_a', 'body_1_b', 'body_2_a', 'body_2_b'], $result);
    }

    public function testGetCaptionsVimeo()
    {

        require_once('lib/quail/quail/common/services/media/vimeo.php');
        $vimeo = new vimeoService();

        // These arrays represent how the API will respond to requests
        // Note: These arrays should be of the same length and order

        // Headers returned from API calls
        $headers = [
            [], // private
            [], // nonexistent
            [], // video with captions
            [], // video with no captions
        ];

        // Bodies returned from API calls
        $bodies = [
            (object) [],             // private
            (object) [],             // nonexistent
            (object) ['total' => 1], // video with captions
            (object) ['total' => 0], // video with no captions
        ];

        // Statuses returned from API calls
        $statuses = [
            400, // private
            404, // nonexistent
            200, // video with captions
            200, // video with no captions
        ];

        // URLs to test and the expected function response
        $urls = [
            ['https://vimeo.com/278000241', 1], // private
            ['https://vimeo.com/27800024', 1],  // nonexistent
            ['https://vimeo.com/305804024', 2], // video with captions
            ['https://vimeo.com/303668864', 0], // video with no captions
            ['https://vimeo.com/video/123', 2], // malformed (no API call)
            ['https://vimeo.com/', 2],          // malformed (no API call)
        ];

        $api_responses = self::mockGetRequestResult($headers, $bodies, $statuses);
        Mockery::mock('overload:Httpful\Request')
            ->shouldReceive('get')
            ->andReturn($api_responses);

        foreach ($urls as $url) {
            self::assertSame($vimeo->captionsMissing($url[0]), $url[1]);
        }
    }

    public function testGetCaptionsYoutube()
    {

        require_once('lib/quail/quail/common/services/media/youtube.php');
        $youtube = new youtubeService();

        // These arrays represent how the API will respond to requests
        // Note: These arrays should be of the same length and order

        // Headers returned from API calls
        $headers = [
            [], // private
            [], // nonexistent
            [], // video with captions
            [], // video with no captions
        ];

        // Bodies returned from API calls
        $bodies = [
            (object) [],             // private
            (object) [],             // nonexistent
            (object) ['items' => [   // video with captions
                (object) ['snippet' =>
                    (object) ['trackKind' => 'ASR'],
                    ],
                (object) ['snippet' =>
                    (object) ['trackKind' => 'standard'],
                    ],
                ],
            ],
            (object) ['items' => [   // video without captions
                (object) ['snippet' =>
                    (object) ['trackKind' => 'ASR'],
                    ],
                ],
            ],
            (object) [],              // video with no captions or autocaptions
        ];

        // Statuses returned from API calls
        $statuses = [
            404, // private
            404, // nonexistent
            200, // video with captions
            200, // video with no captions
            404, // video with no captions or autocaptions
        ];

        // URLs to test and the expected response
        $urls = [
            ['https://www.youtube.com/watch?v=XNh9C6S4-6M', 1], // private
            ['https://www.youtube.com/watch?v=XNh9C6S4-6P', 1], // nonexistent
            ['https://www.youtube.com/watch?v=NTfOnGZUZDk', 2], // video with captions
            ['https://www.youtube.com/watch?v=UKS_of5MUj0', 0], // video with no captions
            ['https://www.youtube.com/watch?v=XBBwbGq6Z6Q', 1], // video with no captions or autocaptions
            ['https://www.youtube.com/', 2],                    // malformed (no API call)
            ['https://www.youtube.com/lol', 2],                 // malformed (no API call)
        ];

        $api_responses = self::mockGetRequestResult($headers, $bodies, $statuses);
        Mockery::mock('overload:Httpful\Request')
            ->shouldReceive('get')
            ->andReturn($api_responses);

        foreach ($urls as $url) {
            self::assertSame($youtube->captionsMissing($url[0]), $url[1]);
        }
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
            ['link' => ''],
        ];

        $body_returns = [
            [ // Modules list
                (object) [
                    'name' => "Test Module",
                    'items_url' => "something/that/doesnt/matter",
                ],
            ],
            [ // Only a single item in the module
                (object) [
                    'title' => "display_name_value.pdf",
                ],
            ],
            [ // Only a single file
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
            [], // We don't care about modules, no modules means no items
            [ // An HTML file since we aren't testing unscannable files
                (object) [
                    'display_name' => "display_name_value.html",
                    'filename' => "filename.html",
                    'id' => 'id_value',
                    'url' => 'url_value',
                    'html_url' => 'url_value',
                ],
            ],
            '<p>some html</p>', // Getting the html contents of the file
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

        $api_body = '
        [
            {
                "id":1,
                "items": [
                    {
                        "external_url":  "external_url_value",
                        "id":  "id_value",
                        "html_url":  "html_url_value",
                        "title":  "title_value"
                    },
                    {
                        "external_url":  "youtube_external_url_value",
                        "id":  "id_value",
                        "html_url":  "html_url_value",
                        "title":  "title_value"
                    },
                    {
                        "external_url":  "vimeo_external_url_value",
                        "id":  "id_value",
                        "html_url":  "html_url_value",
                        "title":  "title_value"
                    }
                ]
            }
        ]';

        $body_returns = [
            json_decode($api_body),
            [],
        ];

        $mock_get_result = self::mockGetRequestResult($header_to_array_returns, $body_returns);

        // overload Httpful\Request::get() to return $mock_get
        Mockery::mock('overload:Httpful\Request')
            ->shouldReceive('get')
            ->andReturn($mock_get_result);

        $result = Udoit::getCourseContent('', '', '', 'module_urls');

        self::assertCount(2, $result['items']);
        self::assertEmpty($result['unscannable']);

        $m_urls = $result['items'];
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
            (object) [
                'syllabus_body' => "content_value",
                'id' => 'id_value',
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

        self::assertTrue($testHandler->hasRecordThatContains('modules is an unknown report title, it will be omitted from the report.', \Monolog\Logger::WARNING));
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

        $api_body = '
        [
            {
                "display_name": "display_name_value.html",
                "filename": "filename.html",
                "id": "id_value",
                "url": "url_value",
                "html_url": "url_value"
            },
            {
                "display_name": "display_name_value.pdf",
                "filename": "filename.pdf",
                "id": "id_value",
                "url": "url_value",
                "html_url": "url_value"
            }
        ]';

        $body_returns = [
            [], // We don't care about Modules here
            json_decode($api_body), // one HTML file and one unscannable file
            '<img src="http://url.com/image.jpg"/>', // Contents of the HTML file
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
        self::assertEquals(1, $result['total_results']['suggestions']); // This should be its own test

        $res = $result['scan_results'];

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
    }

    public function testRetrieveAndScanReturnsModules()
    {
        $header_to_array_returns = [
            ['link' => ''], // just one page
        ];

        $api_body = '
        [
            {
                "id":1,
                "items": [
                    {
                        "external_url":  "external_url_value",
                        "id":  "id_value",
                        "html_url":  "html_url_value",
                        "title":  "title_value"
                    },
                    {
                        "external_url":  "youtube_external_url_value",
                        "id":  "id_value",
                        "html_url":  "html_url_value",
                        "title":  "title_value"
                    },
                    {
                        "external_url":  "vimeo_external_url_value",
                        "id":  "id_value",
                        "html_url":  "html_url_value",
                        "title":  "title_value"
                    }
                ]
            }
        ]';

        $body_returns = [
            json_decode($api_body),
            [],
        ];

        $mock_get_result = self::mockGetRequestResult($header_to_array_returns, $body_returns);

        // overload Httpful\Request::get() to return $mock_get
        Mockery::mock('overload:Httpful\Request')
            ->shouldReceive('get')
            ->andReturn($mock_get_result);

        $result = Udoit::retrieveAndScan('', '', '', 'module_urls');

        // make sure the totals we expect to see are calculated
        self::assertArrayHasKey('total_results', $result);
        self::assertEquals(0, $result['total_results']['errors']);
        self::assertEquals(0, $result['total_results']['warnings']);
        self::assertEquals(2, $result['total_results']['suggestions']);

        $res = $result['scan_results'];

        // make sure only the items with videos are in items
        self::assertCount(2, $res['module_urls']['items']);

        // make sure unscannable doesnt have anything but exists
        self::assertArrayHasKey('unscannable', $res);
        self::assertCount(0, $res['unscannable']);

        // make sure amount reflects the total number of items scanned
        self::assertEquals(3, $res['module_urls']['amount']);

        // verify that a module_urls item has the expected keys
        self::assertArrayHasKey('id', $res['module_urls']['items'][0]);
        self::assertArrayHasKey('external_url', $res['module_urls']['items'][0]);
        self::assertArrayHasKey('url', $res['module_urls']['items'][0]);
        self::assertArrayHasKey('title', $res['module_urls']['items'][0]);
    }
}
