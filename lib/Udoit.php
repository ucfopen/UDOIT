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
     * @param string $api_key        API Key of the user were acting as
     * @param string $canvas_api_url The base URL of the Canvas API
     * @param string $course_id      The Canvas course id
     * @param string $content_type   The group of content types we'll retrieve EX: 'pages' or 'assignments'
     * @param string $report_type    The type of severity the user would like to see on report
     *
     * @return array Results of the scan
     */
    public static function retrieveAndScan($api_key, $canvas_api_url, $course_id, $content_type, $report_type)
    {
        global $logger;
        session_start();

        $logger->addInfo("Starting retrieveAndScan - course: {$course_id}, content: {$content_type}, report_type: {$report_type}");

        $items_with_issues = []; // array of content items that the scanner found issues in
        $totals = ['errors' => 0, 'suggestions' => 0];
        $error_summary = [];
        $suggestion_summary = [];
        $scan_time_start = microtime(true);

        $content = static::getCourseContent($api_key, $canvas_api_url, $course_id, $content_type);

        if ('module_urls' !== $content_type) {
            // everything except module_urls goes through a content scanner
            $scanned_items = static::scanContent($content['items'], $report_type);

            // remove results w/o issues and count the totals
            // create a new list of items
            foreach ($scanned_items as $item) {
                if ($item['amount'] == 0) {
                    continue;
                }

                $items_with_issues[]   = $item;
                $totals['errors']      += count($item['error']);
                $totals['suggestions'] += count($item['suggestion']);

                foreach ($item['error'] as $issue) {
                    $title = $issue['title'];
                    if (!isset($error_summary[$title])) {
                        $error_summary[$title] = new stdClass();
                        $error_summary[$title]->count = 1;
                    } else {
                        $error_summary[$title]->count++;
                    }
                }

                foreach ($item['suggestion'] as $suggestion) {
                    $title = $suggestion['title'];
                    if (!isset($suggestion_summary[$title])) {
                        $suggestion_summary[$title] = new stdClass();
                        $suggestion_summary[$title]->count = 1;
                    } else {
                        $suggestion_summary[$title]->count++;
                    }
                }
            }
        } else {
            // module_urls skips the scanner, just add them to the items with issues
            $items_with_issues = $content['items'];
            $totals['suggestions'] += count($items_with_issues);
        }

        // caluculate the total run time
        $content['time']  = round(microtime(true) - $scan_time_start, 2);

        $logger->addInfo("Finished retrieveAndScan - course: {$course_id}, content: {$content_type}");

        $content_return = [
            'title'  => $content_type,
            'items'  => $items_with_issues,
            'amount' => $content['amount'],
            'time'   => $content['time'],
        ];

        // If there was an api error, and it's set to true, pass it up
        if (isset($content['api_error']) && $content['api_error']) {
            $content_return['api_error'] = $content['api_error'];
        }

        // If there was a scope error, and it's set to true, pass it up
        if (isset($content['scope_error']) && $content['scope_error']) {
            $content_return['scope_error'] = $content['scope_error'];
        }

        return [
            'total_results' => $totals,
            'scan_results' => [
                'unscannable' => $content['unscannable'],
                'error_summary' => $error_summary,
                'suggestion_summary' => $suggestion_summary,
                $content_type => $content_return,
            ],
        ];
    }

    /**
     * Calls the Quail library to generate a UDOIT report
     * @param  array  $content_items The items from whatever type of Canvas content was scanned
     * @param  string $report_type   The type of severity the user would like to see on report
     *
     * @return array  The report results
     */
    public static function scanContent(array $content_items, $report_type)
    {
        require_once(__DIR__.'/quail/quail/quail.php');
        $report = [];
        global $logger;

        // Runs each item through the Quail accessibility checker
        foreach ($content_items as $item) {
            if (empty($item['content'])) {
                continue;
            }

            $quail  = new quail($item['content'], 'wcag2aaa', 'string', 'static', 'en', $report_type);
            $quail->runCheck();
            $quail_report = $quail->getReport();

            $issue_count = 0;
            $errors      = [];
            $warnings    = [];
            $suggestions = [];
            $state       = null;

            // loop over the items returning from Quail
            foreach ($quail_report['report'] as $quail_issue) {
                if (empty($quail_issue['severity_num'])) {
                    continue;
                }

                $issue_count++;
                $state = $quail_issue['state'];

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
     * @param string $api_key        Api key for the user we're acting as
     * @param string $canvas_api_url Base uri for your canvas api
     * @param string $course_id      The canvas course id
     * @param string $type           The type of course content to be scanned
     *
     * @return array The report results
     */
    public static function getCourseContent($api_key, $canvas_api_url, $course_id, $type)
    {
        global $logger;
        $api_url = "{$canvas_api_url}/api/v1/courses/{$course_id}/";
        $content_result = [
            'items'       => [], // array of items of this type
            'amount'      => 0, // count of items
            'time'        => 0, // total time for the scan
            'unscannable' => [], // items that couldnt be scanned
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
                // Gather all modules out here so we can attach them to files later
                $all_modules = static::apiGet("{$api_url}modules", $api_key)->send()->body;
                if (is_array($all_modules) || is_object($all_modules)) {
                    foreach ($all_modules as $m) {
                        $m->items = static::apiGet($m->items_url, $api_key)->send()->body;
                    }
                }

                $contents = static::apiGetAllLinks($api_key, "{$api_url}files?");
                foreach ($contents as $c) {
                    if (substr($c->display_name, 0, 2) === '._') {
                        continue;
                    }

                    $extension = pathinfo($c->filename, PATHINFO_EXTENSION);
                    global $file_scan_size_limit;

                    if (in_array($extension, ['pdf', 'doc', 'docx', 'ppt', 'pptx'])) {
                        // not scannable types
                        // get folder path
                        // get full_name from folder information for folder url
                        $path = str_replace('course files', '', static::apiGet("{$api_url}folders/{$c->folder_id}", $api_key)->send()->body->full_name);
                        // only prepend 'folder' if the current path is not in the root folder
                        if (!empty($path)) {
                            $path = "folder".$path;
                        }
                        // prepend canvas url
                        $path = "{$canvas_api_url}/courses/{$course_id}/files/".$path;

                        // saves modules item is in for unscannable section
                        unset($modules);
                        $modules = [];
                        foreach ($all_modules as $m) {
                            foreach ($m->items as $i) {
                                if ($i->title == $c->display_name) {
                                    $modules[] = $m->name;
                                }
                            }
                        }
                        $modules = array_unique($modules);

                        $content_result['unscannable'][] = [
                            'title'     => $c->display_name,
                            'url'       => $c->url,
                            'path'      => $path,
                            'modules'    => $modules,
                            'extension' => $extension,
                            'big'       => false,
                        ];
                    } elseif (!empty($c->size) && $c->size > $file_scan_size_limit) {
                        // too big to scan
                        $content_result['unscannable'][] = [
                            'title' => $c->display_name,
                            'url' => $c->url,
                            'big' => true,
                        ];
                    } elseif (in_array($extension, ['html', 'htm'])) {
                        // scannable!
                        $content_result['items'][] = [
                            'id'      => $c->id,
                            'content' => static::apiGet($c->url)->followRedirects()->expectsHtml()->send()->body,
                            'title'   => $c->display_name,
                            'url'     => $c->url,
                        ];
                    }
                }
                break;

            case 'pages':
                $contents = static::apiGetAllLinks($api_key, "{$api_url}pages?");
                foreach ($contents as $c) {
                    $wiki_page = static::apiGet("{$api_url}pages/{$c->url}", $api_key)->send();

                    $content_result['items'][] = [
                        'id'      => $wiki_page->body->url,
                        'content' => $wiki_page->body->body,
                        'title'   => $wiki_page->body->title,
                        'url'     => $wiki_page->body->html_url,
                    ];
                }
                break;

            case 'module_urls':
                $url = "{$api_url}modules?include[]=items&";
                $search = '/(youtube|vimeo)/';
                $resp = static::apiGetAllLinks($api_key, $url);
                $count = 0;

                foreach ($resp as $r) {
                    foreach ($r->items as $c) {
                        $count++;
                        $external_url = (isset($c->external_url) ? $c->external_url : '');

                        if (preg_match($search, $external_url) === 1) {
                            $content_result['items'][] = [
                                'id'           => $c->id,
                                'external_url' => $c->external_url,
                                'title'        => $c->title,
                                'url'          => $c->html_url,
                            ];
                        }
                    }
                }

                // module_urls is the only one that must count now
                // todo - just return all items and do the 'scanning' in the scann content function
                $content_result['amount'] = $count;
                break;

            case 'syllabus':
                $url = "{$api_url}?include[]=syllabus_body";
                $response = static::apiGet($url, $api_key)->send();

                if (isset($response->body->syllabus_body)) {
                    $logger->addInfo("Syllabus body found, adding to report.");
                    $content_result['items'][] = [
                        'id'      => $response->body->id,
                        'content' => $response->body->syllabus_body,
                        'title'   => 'Syllabus',
                        'url'     => "{$canvas_api_url}/courses/{$course_id}/assignments/syllabus",
                    ];
                } elseif (isset($response->body->errors) && count($response->body->errors) > 0) {
                    foreach ($response->body->errors as $error) {
                        $logger->addError("Canvas API responded with an error for {$url}: $error->message");
                    }
                    // Report this error back to the user.
                    $content_result['api_error'] = true;
                } else {
                    // This is likely caused by a scoped developer key not having sufficient scopes
                    // Or it could be due to a limitation in canvas that doesn't allow includes for scoped keys
                    $logger->addError("Unable to scan Syllabus due to scoped developer key.  Displaying message to user.");
                    $content_result['scope_error'] = true;
                }
                break;

            case 'test':
                // Do nothing, this is reserved for tests that shouldn't do anything
                break;
        }

        // if the tasks didn't set the amount, calculate it now
        if ($content_result['amount'] == 0) {
            $content_result['amount'] = count($content_result['items']);
        }

        return $content_result;
    }

    /**
    * An abstraction of Request::get that adds the api key to the header
    * @param string $url The Canvas API URL
    * @param string $key The Canvas API key
    *
    * @return The results of the request
    **/
    protected static function apiGet($url, $key = null)
    {
        global $logger;
        $logger->addInfo("Requesting {$url}");
        $req = Request::get($url);

        if (!empty($key)) {
            $req->addHeader('Authorization', "Bearer ${key}");
        }

        return $req;
    }

    /**
    * Gets every page from the Canvas API till there's none left
    * @param string $api_key The Canvas API Key
    * @param string $url     The Canvas API URL
    *
    * @return The results of the request
    **/
    protected static function apiGetAllLinks($api_key, $url)
    {
        global $logger;
        $limit = 500;
        $per_page = 100;
        $results = [];

        do {
            $response = static::apiGet("{$url}page=1&per_page={$per_page}", $api_key)->send();
            if (isset($response->body->errors) && count($response->body->errors) > 0) {
                foreach ($response->body->errors as $error) {
                    $logger->addError("Canvas API responded with an error for {$url}: $error->message");
                }
                break;
            }

            $links = static::apiParseLinks($response->headers->toArray()['link']);

            if (empty($response->body)) {
                $logger->addError("Canvas API returned empty body for {$url}");
                break;
            }

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
     * @param  string $links The pagination links
     *
     * @return array An array of the separated links
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
