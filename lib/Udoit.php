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
require_once('../config/settings.php');
require_once('quail/quail/quail.php');

use Httpful\Request;

class Udoit {
    /**
     * @var string - The API key needed to communicate with Canvas
     */
    public $api_key;

    /**
     * @var string - The base uri for the Canvas instance
     */
    public $base_uri;

    /**
     * @var array - An array of issues detected by UDOIT
     */
    public $bad_content;

    /**
     * @var string - The id of the content being fixed
     */
    public $content_id;

    /**
     * @var array - An array of Canvas content types selected by the user
     */
    public $content_types;

    /**
     * @var string - The course title
     */
    public $course_title;

    /**
     * @var string - The course id our content is in
     */
    public $course_id;

    /**
     * @var array - Count of total results for a UDOIT scan
     */
    public $total_results;

    /**
     * @var array - Bad module external urls
     */
    public $module_urls;

    /**
     * @var array - Unscannable files (pdf, doc, ppt, etc)
     */
    public $unscannable;

    /**
     * @var string - stringified json report
     */
    protected $json_report;

    /**
     * The class constructor
     * @param array data - An array of POST data
     */
    public function __construct($data) {
        $this->api_key       = $data['api_key'];
        $this->base_uri      = $data['base_uri'];
        $this->content_types = $data['content_types'];
        $this->course_id     = $data['course_id'];
        $this->course_title  = $data['course_title'];
        $this->total_results = ['errors' => 0, 'warnings' => 0, 'suggestions' => 0];
        $this->module_urls   = [];
        $this->unscannable   = [];
    }

    /**
     * [buildReport description]
     * @return [type] [description]
     */
    public function buildReport() {
        foreach ($this->content_types as $type) {
            session_start();
            $_SESSION['build_report_progress'] = $type;
            session_write_close();

            $typeResults = [];
            $courseContentType = $this->getCourseContent($type);

            foreach ($courseContentType['items'] as $r) {
                if ($r['amount'] != 0) {
                    $typeResults[] = $r;

                    $this->total_results['errors']      += count($r['error']);
                    $this->total_results['warnings']    += count($r['warning']);
                    $this->total_results['suggestions'] += count($r['suggestion']);
                }
            }

            if ($courseContentType['module_urls']) {
                $this->module_urls = $courseContentType['module_urls'];
            }

            if ($courseContentType['unscannable']) {
                $this->unscannable = $courseContentType['unscannable'];
            }

            $courseContentType['items'] = $typeResults;
            $this->bad_content[$type]   = [
                'title'  => $type,
                'items'  => $courseContentType['items'],
                'amount' => $courseContentType['amount'],
                'time'   => $courseContentType['time']
            ];
        }

        if ($this->module_urls) {
            $this->bad_content['module_urls'] = [
                'title'  => 'module_urls',
                'items'  => $this->module_urls,
                'amount' => count($this->module_urls),
                'time'   => $courseContentType['time']
            ];
        }

        if ($this->unscannable) {
            $this->bad_content['unscannable'] = [
                'title'  => 'unscannable',
                'items'  => $this->unscannable,
                'amount' => count($this->unscannable)
            ];
        }

        // so the ajax call knows we're done
        session_start();
        $_SESSION['build_report_progress'] = 'done';
        session_write_close();

        $to_encode = [
            'course'        => $this->course_title,
            'total_results' => $this->total_results,
            'content'       => $this->bad_content,
        ];

        $this->json_report = json_encode($to_encode);

    }

    /**
     * Calls the Quail library to generate a UDOIT report
     * @param  array $scanned_content - The items from whatever type of Canvas content was scanned
     * @return array                  - The report results
     */
    private function generateReport($scanned_content) {

        global $redirects_on;

        $content_report = [];
        $new_links = [];
        
        /* Runs each item in the test array through the Quail accessibility checker */
        foreach ($scanned_content as &$html) {
            if (strlen($html['content']) == 0) {
                continue;
            }
            $quail  = new quail($html['content'], 'wcag2aaa', 'string', 'static');
            $quail->runCheck();

            $result      = $quail->getReport();
            $report      = $result['report'];

            $html['report'] = $report;

            foreach ($report as $value) {
                if ($value['message'] != NULL && $value['type'] == 'redirectedLink') $new_links[] = $value['message'];
            }
        }

        if($redirects_on) $redirects = $this->redirectTest($new_links);

        foreach ($scanned_content as &$html) {
            if (strlen($html['content']) == 0) {
                continue;
            }

            $error_count = 0;
            $severe      = [];
            $warning     = [];
            $suggestion  = [];

            $report = &$html['report'];
            foreach ($report as &$value) {
                if($value['type'] == 'redirectedLink'){        
                    $ref = $value['message'];
                    preg_match('/(.+?)#/', $ref, $matches);
                    $base = $matches[1];
                    if (array_key_exists($value['message'], $redirects) && $redirects[$ref] != $base) {
                        $value['message'] = $redirects[$ref];
                    } else {
                        unset($report[$value['message']]);
                        continue;
                    }
                }

                //  Some don't have a severity num
                if ( ! array_key_exists('severity_num', $value)) {
                    continue;
                }

                if ($value['severity_num'] == 1) {
                    $severe[] = $value;
                }
                elseif ($value['severity_num'] == 2) {
                    $warning[] = $value;
                }
                elseif ($value['severity_num'] == 3) {
                    $suggestion[] = $value;
                }

                if (count($value) > 0) {
                    $error_count++;
                }

            }

            $content_report[] = [
                'id'         => $html['id'],
                'name'       => $html['title'],
                'url'        => $html['url'],
                'amount'     => $error_count,
                'error'      => $severe,
                'warning'    => $warning,
                'suggestion' => $suggestion,
            ];
        }

        return $content_report;
    }


    function redirectTest($rlinks) {
        $curls = array();
        $result = array();
        $mcurl = curl_multi_init();
        foreach ($rlinks as $i => $link){
            $curls[$i] = curl_init();
            curl_setopt($curls[$i], CURLOPT_URL, $link);
            curl_setopt($curls[$i], CURLOPT_HEADER, TRUE);
            curl_setopt($curls[$i], CURLOPT_NOBODY, TRUE);
            curl_setopt($curls[$i], CURLOPT_REFERER, TRUE);
            curl_setopt($curls[$i], CURLOPT_TIMEOUT, 2);
            curl_setopt($curls[$i], CURLOPT_AUTOREFERER, TRUE);
            curl_setopt($curls[$i], CURLOPT_RETURNTRANSFER, TRUE);
            curl_setopt($curls[$i], CURLOPT_FOLLOWLOCATION, TRUE);
            curl_multi_add_handle($mcurl, $curls[$i]);
        }
        $running = null;
        do {
            curl_multi_exec($mcurl, $running);
        } while ($running > 0);
            
        foreach($rlinks as $i => $link){
            $redirect = curl_getinfo($curls[$i], CURLINFO_EFFECTIVE_URL);
            if($link != $redirect){
                $result[$link] = $redirect;
            }
            curl_multi_remove_handle($mcurl, $curls[$i]);
        }
        curl_multi_close($mcurl);
        return $result;
    }

    /**
     * Communicates with the Canvas API to retrieve course content
     * @param  string $type - The type of course content to be scanned
     * @return array        - The report results
     */
    private function getCourseContent($type) {
        $content      = [];
        $per_page     = 100;
        $page_count   = 1;
        $base_api_url = "{$this->base_uri}/api/v1/courses/{$this->course_id}/";
        $content_result = [
            'items'       => [],
            'amount'      => 0,
            'time'        => microtime(true),
            'module_urls' => [],
            'unscannable' => [],
        ];

        switch ($type) {
            case 'announcements':
                $page_count = 1;
                do {
                    $url = "{$base_api_url}discussion_topics?&only_announcements=true&access_token={$this->api_key}&page={$page_count}";
                    $response = Request::get($url)->send();

                    foreach ($response->body as $thing) {
                        $content[] = $thing;
                    }
                    $page_count++;

                } while ( ! empty($response->body));

                break;

            case 'assignments':
                $page_count = 1;
                do {
                    $url      = "{$base_api_url}assignments?&access_token={$this->api_key}&page={$page_count}";
                    $response = Request::get($url)->send();

                    foreach ($response->body as $thing) {
                        $content[] = $thing;
                    }
                    $page_count++;

                } while ( ! empty($response->body));

                break;

            case 'discussions':
                $page_count = 1;
                do {
                    $url      = "{$base_api_url}discussion_topics?&access_token={$this->api_key}&page={$page_count}";
                    $response = Request::get($url)->send();

                    foreach ($response->body as $thing) {
                        $content[] = $thing;
                    }
                    $page_count++;
                } while ( ! empty($response->body));

                break;

            case 'files':
                $url = "{$this->base_uri}/api/v1/courses/{$this->course_id}/files?page=1&per_page={$per_page}&access_token={$this->api_key}";

                do {
                    $response  = Request::get($url)->send();
                    $the_links = $this->parseLinks($response->headers->toArray()['link']);


                    foreach ($response->body as $thing) {
                        $content[] = $thing;
                    }

                    if (isset($the_links['next'])) {
                        $url = $the_links['next'].'&access_token='.$this->api_key;
                    }

                } while (isset($the_links['next']));

                break;

            case 'pages':
                $url = "{$base_api_url}pages?page=1&per_page={$per_page}&access_token={$this->api_key}";
                do {
                    $response  = Request::get($url)->send();
                    $the_links = $this->parseLinks($response->headers->toArray()['link']);

                    foreach ($response->body as $thing) {
                        $content[] = $thing;
                    }

                    if (isset($the_links['next'])) {
                        $url = $the_links['next'].'&access_token='.$this->api_key;
                    }
                } while (isset($the_links['next']));
                break;

            case 'syllabus':
                $url       = "{$base_api_url}?include[]=syllabus_body&access_token={$this->api_key}";
                $response  = Request::get($url)->send();
                $content[] = $response->body;

                break;

            case 'modules':
                $page_count = 1;
                do {
                    $url      = "{$base_api_url}modules?include[]=items&access_token={$this->api_key}&page={$page_count}";
                    $response = Request::get($url)->send()->body;

                    foreach ($response as $r) {
                        foreach ($r->items as $item) {
                            $content[] = $item;
                        }
                    }
                    $page_count++;
                } while ( ! empty($response->body));

                break;
        }

        foreach ($content as $single) {
            switch ($type) {
                case 'announcements':
                    $content_result['items'][] = [
                        'id'      => $single->id,
                        'content' => $single->message,
                        'title'   => $single->title,
                        'url'     => $single->html_url
                    ];
                    break;

                case 'assignments':
                    $content_result['items'][] = [
                        'id'      => $single->id,
                        'content' => $single->description,
                        'title'   => $single->name,
                        'url'     => $single->html_url
                    ];
                    break;

                case 'discussions':
                    $content_result['items'][] = [
                        'id'      => $single->id,
                        'content' => $single->message,
                        'title'   => $single->title,
                        'url'     => $single->html_url
                    ];
                    break;

                case 'files':
                    // ignore ._ mac files
                    if (substr($single->display_name, 0, 2) == '._') {
                        break;
                    }

                    $extension = pathinfo($single->filename, PATHINFO_EXTENSION);

                    if (in_array($extension, ['html', 'htm'])) {
                        $content_result['items'][] = [
                            'id'      => $single->id,
                            'content' => Request::get($single->url)->followRedirects()->expectsHtml()->send()->body,
                            'title'   => $single->display_name,
                            'url'     => $single->url
                        ];
                    }
                    // filters non html files
                    if (in_array($extension, ['pdf', 'doc', 'docx', 'ppt', 'pptx'])){
                        $content_result['unscannable'][] = [
                            'title' => $single->display_name,
                            'url'   => $single->url
                        ];
                    }
                    break;

                case 'pages':
                    $url       = "{$base_api_url}pages/{$single->url}?access_token={$this->api_key}";
                    $wiki_page = Request::get($url)->send();

                    $content_result['items'][] = [
                        'id'      => $wiki_page->body->url,
                        'content' => $wiki_page->body->body,
                        'title'   => $wiki_page->body->title,
                        'url'     => $wiki_page->body->html_url
                    ];
                    break;

                case 'syllabus':
                    $content_result['items'][] = [
                        'id'      => $single->id,
                        'content' => $single->syllabus_body,
                        'title'   => 'Syllabus',
                        'url'     => "{$this->base_uri}/courses/{$single->id}/assignments/syllabus"
                    ];
                    break;

                case 'modules':
                    $search = '/(youtube|vimeo)/';
                    $external_url = isset($single->external_url) ? $single->external_url : '';

                    if (preg_match($search, $external_url)) {
                        $content_result['module_urls'][] = [
                            'id'           => $single->id,
                            'external_url' => $single->external_url,
                            'title'        => $single->title,
                            'url'          => $single->html_url
                        ];
                    }
                    break;

            }
        }

        $time_end                 = microtime(true);
        $content_result['amount'] = count($content_result['items']);
        $content_result['items']  = $this->generateReport($content_result['items']);
        $content_result['time']   = round($time_end - $content_result['time'], 2);

        return $content_result;
    }

    /**
     * Parses pagination links returned from Canvas
     * @param  string $links - The pagination links
     * @return array         - An array of the separated links
     */
    public static function parseLinks($links) {
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

    /**
     * Gets a copy of the json report
     * @return string - Stringified json report
     */
    public function getReport() {
        return $this->json_report;
   }

    /**
     * Saves the report in json format to a file
     * @param  string $title        - The title of the report
     * @param  string $reports_dir  - Base path of the reports directory
     * @return void
     */
    public function saveReport($title, $reports_dir) {
        // make sure report directory exists
        $file_name  = date('Y_m_d__g:i:s_a').'.json';
        $final_path = "{$reports_dir}/{$title}";

        if ( ! file_exists($final_path)) {
            mkdir($final_path, 0755, true);
            chmod($reports_dir, 0755);
        }

    $file = "{$final_path}/{$file_name}";
        file_put_contents($file, $this->json_report);
        chmod($file, 0755);
        return $file;
    }
}
