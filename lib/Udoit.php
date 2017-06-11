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

use Httpful\Request;

class Udoit
{
    /**
     * Retrieves an entire group of content by type and scans it
     * @param string api_key - API Key of the user were acting as
     * @param string content_type - The group of content types we'll retrieve EX: 'pages' or 'assignments'
     *
     * @return array - Results of the scan
     */
    public static function retrieveAndScan($api_key, $canvas_api_url, $course_id, $content_type)
    {
        $items_with_issues = [];
        $totals = ['errors' => 0, 'warnings' => 0, 'suggestions' => 0];
        $module_urls = [];
        $unscannables = [];

        $content = static::getCourseContent($api_key, $canvas_api_url, $course_id, $content_type);

        $scan_time_start = microtime(true);
        $content['items']  = static::scanContent($content['items']);
        $content['time']   = round($scan_time_start - microtime(true), 2);
        $content['amount'] = count($content['items']);

        // remove results w/o issues and count the totals
        foreach ($content['items'] as $item) {
            if ($item['amount'] == 0) {
                continue;
            }

            $items_with_issues[]   = $item;
            $totals['errors']      += count($item['error']);
            $totals['warnings']    += count($item['warning']);
            $totals['suggestions'] += count($item['suggestion']);
        }

        // format results
        if ($content['module_urls']) {
            $module_urls = array_merge($module_urls, $content['module_urls']);
        }
        if ($content['unscannable']) {
            $unscannables = array_merge($unscannables, $content['unscannable']);
        }

        return [
            'total_results' => $totals,
            'scan_results' => [
                'module_urls'  => $module_urls,
                'unscannable' => $unscannables,
                $content_type => [
                    'title'  => $content_type,
                    'items'  => $items_with_issues,
                    'amount' => $content['amount'],
                    'time'   => $content['time'],
                ],
            ],
        ];
    }

    /**
     * Calls the Quail library to generate a UDOIT report
     * @param  array $scanned_content - The items from whatever type of Canvas content was scanned
     *
     * @return array                  - The report results
     */
    public static function scanContent(array $content_items)
    {
        require_once(__DIR__.'/quail/quail/quail.php');
        $report = [];

        // Runs each item through the Quail accessibility checker
        foreach ($content_items as $item) {
            if (empty($item['content'])) {
                continue;
            }

            $quail  = new quail($item['content'], 'wcag2aaa', 'string', 'static');
            $quail->runCheck();
            $quail_report = $quail->getReport();

            $issue_count = 0;
            $errors      = [];
            $warnings    = [];
            $suggestions = [];

            // loop over the items returning from Quail
            foreach ($quail_report['report'] as $quail_issue) {
                if (empty($quail_issue['severity_num'])) {
                    continue;
                }

                $issue_count++;

                switch ((int) $quail_issue['severity_num']) {
                    case 1:
                        $errors[] = $quail_issue;
                        break;

                    case 2:
                        $warnings[] = $quail_issue;
                        break;

                    case 3:
                        $suggestions[] = $quail_issue;
                        break;
                }
            }

            $quail_summary = [
                'id'         => $item['id'],
                'name'       => $item['title'],
                'url'        => $item['url'],
                'amount'     => $issue_count,
                'error'      => $errors,
                'warning'    => $warnings,
                'suggestion' => $suggestions,
            ];

            $report[] = $quail_summary;
        }

        return $report;
    }

    /**
     * Communicates with the Canvas API to retrieve course content
     * @param  string $api_key - Api key for the user we're acting as
     * @param  string $canvas_api_url - Base uri for your canvas api
     * @param  string $type - The type of course content to be scanned
     *
     * @return array        - The report results
     */
    public static function getCourseContent($api_key, $canvas_api_url, $course_id, $type)
    {
        global $logger;

        $api_url = "{$canvas_api_url}/api/v1/courses/{$course_id}/";
        $content_result = [
            'items'       => [],
            'amount'      => 0,
            'time'        => microtime(true),
            'module_urls' => [],
            'unscannable' => [],
        ];

        switch ($type) {
            case 'announcements':
                $contents = static::apiGetAllLinks($api_key, "{$api_url}discussion_topics?&only_announcements=true");
                foreach ($contents as $c) {
                    $content_result['items'][] = [
                        'id'      => $c->id,
                        'content' => $c->message,
                        'title'   => $c->title,
                        'url'     => $c->html_url,
                    ];
                }
                break;

            case 'assignments':
                $contents = static::apiGetAllLinks($api_key, "{$api_url}assignments?");
                foreach ($contents as $c) {
                    $content_result['items'][] = [
                        'id'      => $c->id,
                        'content' => $c->description,
                        'title'   => $c->name,
                        'url'     => $c->html_url,
                    ];
                }
                break;

            case 'discussions':
                $contents = static::apiGetAllLinks($api_key, "{$api_url}discussion_topics?");
                foreach ($contents as $c) {
                    $content_result['items'][] = [
                        'id'      => $c->id,
                        'content' => $c->message,
                        'title'   => $c->title,
                        'url'     => $c->html_url,
                    ];
                }
                break;

            case 'files':
                $contents = static::apiGetAllLinks($api_key, "{$api_url}files?");
                foreach ($contents as $c) {
                    if (substr($c->display_name, 0, 2) === '._') {
                        continue;
                    }

                    $extension = pathinfo($c->filename, PATHINFO_EXTENSION);

                    if ($c->size > 50000000) {
                        $content_result['unscannable'][] = [
                            'title' => $c->display_name,
                            'url' => $c->url,
                            'big' => true,
                        ];
                    } else {
                        if (in_array($extension, ['html', 'htm'])) {
                            $content_result['items'][] = [
                                'id'      => $c->id,
                                'content' => Request::get($c->url)->followRedirects()->expectsHtml()->send()->body,
                                'title'   => $c->display_name,
                                'url'     => $c->url,
                            ];
                        }
                        // filters non html files
                        if (in_array($extension, ['pdf', 'doc', 'docx', 'ppt', 'pptx'])) {
                            $content_result['unscannable'][] = [
                                'title' => $c->display_name,
                                'url'   => $c->url,
                                'big'   => false,
                            ];
                        }
                    }
                }
                break;

            case 'pages':
                $contents = static::apiGetAllLinks($api_key, "{$api_url}pages?");
                foreach ($contents as $c) {
                    $url = "{$api_url}pages/{$c->url}?access_token={$api_key}";
                    $wiki_page = Request::get($url)->send();

                    $content_result['items'][] = [
                        'id'      => $wiki_page->body->url,
                        'content' => $wiki_page->body->body,
                        'title'   => $wiki_page->body->title,
                        'url'     => $wiki_page->body->html_url,
                    ];
                }
                break;

            case 'modules':
                $url = "{$api_url}assignments?";
                $search = '/(youtube|vimeo)/';
                $resp = static::apiGetAllLinks($api_key, $url);

                foreach ($resp as $r) {
                    foreach ($r->items as $c) {
                        $external_url = isset($c->external_url) ? $c->external_url : '';

                        if (preg_match($search, $external_url)) {
                            $content_result['module_urls'][] = [
                                'id'           => $c->id,
                                'external_url' => $c->external_url,
                                'title'        => $c->title,
                                'url'          => $c->html_url,
                            ];
                        }
                    }
                }
                break;

            case 'syllabus':
                $url = "{$api_url}?include[]=syllabus_body&access_token={$api_key}";
                $response = Request::get($url)->send();
                foreach ($response->body as $c) {
                    $content_result['items'][] = [
                        'id'      => $c->id,
                        'content' => $c->syllabus_body,
                        'title'   => 'Syllabus',
                        'url'     => "{$canvas_api_url}/courses/{$course_id}/assignments/syllabus",
                    ];
                }
                break;
        }

        return $content_result;
    }

    // get every page from the Canvas API till there's none left
    protected static function apiGetAllLinks($api_key, $url)
    {
        global $logger;
        $limit = 500;
        $per_page = 100;
        $results = [];

        do {
            $req_url = "{$url}page=1&per_page={$per_page}&access_token={$api_key}";
            $logger->addInfo("Requesting {$req_url}");
            $response = Request::get($req_url)->send();
            if ($response->status > 400) {
                $logger->addError("Error response from {$req_url}");
                break;
            }

            $links = static::apiParseLinks($response->headers->toArray()['link']);
            foreach ($response->body as $thing) {
                $results[] = $thing;
            }

            if (isset($links['next'])) {
                $url = "{$links['next']}&access_token={$api_key}";
            }

            usleep(250000); // 1/4 sec
        } while (isset($links['next']) && $cur_page < $limit);

        return $results;
    }

    /**
     * Parses pagination links returned from Canvas
     * @param  string $links - The pagination links
     *
     * @return array         - An array of the separated links
     */
    protected static function apiParseLinks($links)
    {
        $links  = explode(',', $links);
        $pretty = [];

        // Break up the link entries into URL and rel
        foreach ($links as $link) {
            $temp = explode('; ', $link);
            // Create the pretty array where we have nice indices with urls
            $pretty[substr($temp[1], 5, -1)] = substr($temp[0], 1, -1);
        }

        return $pretty;
    }
}
