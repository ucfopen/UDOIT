<?php

require_once '../core/quail/quail.php';
require '../vendor/autoload.php';

use Httpful\Request;

class UDoIt
{
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
     * @var string - The course id our content is in
     */
    public $course_id;

    /**
     * @var array - Count of total results for a UDOIT scan
     */
    public $total_results;

    /**
     * @var array - Unscannable files (pdf, doc, ppt, etc)
     */
    public $unscannable;

    /**
     * The class constructor
     * @param array data - Array of something...
     */
    public function __construct($data)
    {
        $this->api_key       = $data['api_key'];
        $this->base_uri      = $data['base_uri'];
        $this->content_types = $data['content_types'];
        $this->course_id     = $data['course_id'];
        $this->total_results = ['errors' => 0, 'warnings' => 0, 'suggestions' => 0];
        $this->unscannable   = '';
    }

    /**
     * Builds the report of issues detected by UDOIT
     */
    public function buildReport()
    {
        session_start();
        $_SESSION['progress'] = 0;
        session_write_close();

        foreach ($this->content_types as $type) {
            session_start();
            $_SESSION["progress"] = $type;
            session_write_close();

            $typeResults = [];

            $courseContentType = $this->getCourseContent($type);

            foreach ($courseContentType['items'] as $r) {
                if ($r['amount'] != 0) {
                    array_push($typeResults, $r);

                    $this->total_results['errors']      += count($r['error']);
                    $this->total_results['warnings']    += count($r['warning']);
                    $this->total_results['suggestions'] += count($r['suggestion']);
                }
            }

            if ($courseContentType['unscannable']) {
                $this->unscannable = $courseContentType['unscannable'];
            }

            $courseContentType['items'] = $typeResults;
            $this->bad_content[$type]   = [
                'title'  => $type,
                'items'  => $courseContentType['items'],
                'amount' => $courseContentType['amount'],
                'time'   => $courseContentType['time'],
            ];
        }

        if ($this->unscannable) {
            $this->bad_content['unscannable'] = [
                'title'  => 'unscannable',
                'items'  => $this->unscannable,
                'amount' => count($this->unscannable),
            ];
        }

        // so the ajax call knows we're done
        session_start();
        $_SESSION["progress"] = 'done';
        session_write_close();
    }

    /**
     * [generateReport description]
     * @param  [type] $scanned_content
     * @return [type]
     */
    private function generateReport($scanned_content)
    {
        $content_report = [];
        /* Runs each item in the test array through the Quail accessibility checker */
        foreach ($scanned_content as $html) {
            if (strlen($html['content']) == 0) {
                continue;
            }

            $error  = 0;
            $report = [];
            $quail  = new quail($html['content'], 'wcag2aaa', 'string', 'static');

            $quail->runCheck();

            $result     = $quail->getReport();
            $report     = $result['report'];
            $severe     = [];
            $warning    = [];
            $suggestion = [];

            foreach ($report as $value) {
                //  Some don't have a severity num
                if (!array_key_exists('severity_num', $value)) {
                    continue;
                }

                if ($value['severity_num'] == 1) {
                    array_push($severe, $value);
                } elseif ($value['severity_num'] == 2) {
                    array_push($warning, $value);
                } elseif ($value['severity_num'] == 3) {
                    array_push($suggestion, $value);
                }

                if (count($value) > 0) {
                    $error++;
                }
            }

            $final['id']         = $html['id'];
            $final['name']       = $html['title'];
            $final['url']        = $html['url'];
            $final['amount']     = $error;
            $final['error']      = $severe;
            $final['warning']    = $warning;
            $final['suggestion'] = $suggestion;

            array_push($content_report, $final);
        }

        return $content_report;
    }

    /**
     * Communicates with the Canvas API to retrieve course content
     * @param  string $type - The type of course content to be scanned
     * @return [type]
     */
    private function getCourseContent($type)
    {
        $content_result = [
            'items'       => [],
            'amount'      => 0,
            'time'        => microtime(true),
            'unscannable' => [],
        ];
        $the_content = [];
        $per_page    = 100;

        switch ($type) {
            case 'announcements':
                $url           = $this->base_uri.'/api/v1/courses/'.$this->course_id.'/discussion_topics?&only_announcements=true&access_token='.$this->api_key;
                $response      = Request::get($url)->send();

                foreach ($response->body as $thing) {
                    $the_content[] = $thing;
                }

                break;
            case 'assignments':
                $url            = $this->base_uri.'/api/v1/courses/'.$this->course_id.'/assignments?&access_token='.$this->api_key;
                $response       = Request::get($url)->send();

                foreach ($response->body as $thing) {
                    $the_content[] = $thing;
                }

                break;
            case 'discussions':
                $url            = $this->base_uri.'/api/v1/courses/'.$this->course_id.'/discussion_topics?&access_token='.$this->api_key;
                $response       = Request::get($url)->send();

                foreach ($response->body as $thing) {
                    $the_content[] = $thing;
                }

                break;
            case 'files':
                $url = $this->base_uri.'/api/v1/courses/'.$this->course_id.'/files?page=1&per_page='.$per_page.'&access_token='.$this->api_key;

                do {
                    $response  = Request::get($url)->send();
                    $the_links = $this->parseLinks($response->headers->toArray()['link']);

                    foreach ($response->body as $thing) {
                        $the_content[] = $thing;
                    }

                    if (isset($the_links['next'])) {
                        $url = $the_links['next'].'&access_token='.$this->api_key;
                    }

                } while (isset($the_links['next']));

                break;
            case 'pages':
                $url = $this->base_uri.'/api/v1/courses/'.$this->course_id.'/pages?page=1&per_page='.$per_page.'&access_token='.$this->api_key;

                do {
                    $response  = Request::get($url)->send();
                    $the_links = $this->parseLinks($response->headers->toArray()['link']);

                    foreach ($response->body as $thing) {
                        $the_content[] = $thing;
                    }

                    if (isset($the_links['next'])) {
                        $url = $the_links['next'].'&access_token='.$this->api_key;
                    }
                } while (isset($the_links['next']));
                break;
            case 'syllabus':
                $url           = $this->base_uri.'/api/v1/courses/'.$this->course_id.'/?include[]=syllabus_body&access_token='.$this->api_key;
                $response      = Request::get($url)->send();
                $the_content[] = $response->body;

                break;
        }

        foreach ($the_content as $single) {
            switch ($type) {
                case 'announcements':
                    array_push($content_result['items'], array(
                        'id'      => $single->id,
                        'content' => $single->message,
                        'title'   => $single->title,
                        'url'     => $single->html_url
                        )
                    );
                    break;
                case 'assignments':
                    array_push($content_result['items'], array(
                        'id'      => $single->id,
                        'content' => $single->description,
                        'title'   => $single->name,
                        'url'     => $single->html_url
                        )
                    );
                    break;
                case 'discussions':
                    array_push($content_result['items'], array(
                        'id'      => $single->id,
                        'content' => $single->message,
                        'title'   => $single->title,
                        'url'     => $single->html_url
                        )
                    );
                    break;
                case 'files':
                    $extension = pathinfo($single->filename, PATHINFO_EXTENSION);
                    // ignore ._ mac files
                    $mac_check = substr($single->display_name, 0, 2);
                    if ($mac_check != '._') {
                        // filters non html files
                        if ($extension != 'html' && $extension != 'htm') {
                            if ($extension == 'pdf' || $extension == 'doc' || $extension == 'docx' || $extension == 'ppt' || $extension == 'pptx') {
                                array_push($content_result['unscannable'], array(
                                    'title' => $single->display_name,
                                    'url'   => $single->url
                                    )
                                );
                            }
                        } else {
                            array_push($content_result['items'], array(
                                'id'      => $single->id,
                                'content' => Request::get($single->url)->followRedirects()->send()->body,
                                'title'   => $single->display_name,
                                'url'     => $single->url
                                )
                            );
                        }
                    }
                    break;
                case 'pages':
                    $url       = $this->base_uri.'/api/v1/courses/'.$this->course_id.'/pages/'.$single->url.'?access_token='.$this->api_key;
                    $wiki_page = Request::get($url)->send();

                    array_push($content_result['items'], array(
                        'id'      => $wiki_page->body->url,
                        'content' => $wiki_page->body->body,
                        'title'   => $wiki_page->body->title,
                        'url'     => $wiki_page->body->html_url
                        )
                    );
                    break;
                case 'syllabus':
                    array_push($content_result['items'], array(
                        'id'      => $single->id,
                        'content' => $single->syllabus_body,
                        'title'   => 'Syllabus',
                        'url'     => $this->base_uri.'/courses/'.$single->id.'/assignments/syllabus'
                        )
                    );
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
     * [parseLinks description]
     * @param  [type] $links
     * @return [type]
     */
    private function parseLinks($links)
    {
        $links = explode(',', $links);
        $pretty = [];

        // Break up the link entries into URL and rel
        foreach ($links as $link){
            $temp = explode('; ', $link);
            // Create the pretty array where we have nice indices with urls
            $pretty[substr($temp[1], 5, -1)] = substr($temp[0], 1, -1);
        }

        return $pretty;
    }
}