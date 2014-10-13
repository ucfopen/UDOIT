<?php
require_once '../config/localConfig.php';
require_once '../core/quail/quail.php';
require '../vendor/autoload.php';

use Httpful\Request;

session_start();

$course_id = $_SESSION['launch_params']['custom_canvas_course_id'];
$api_key = $_SESSION['api_key'];
$_SESSION['progress'] = 0;

// because we can't scan what isn't selected
if ($_POST['content'] == 'none') {
    echo "<div class=\"alert alert-danger no-margin margin-top\"><span class=\"glyphicon glyphicon-exclamation-sign\"></span> Please select which course content you wish to scan above.</div>";
    exit();
}

session_write_close();

$total_results = [
    "errors" => 0,
    "warnings" => 0,
    "suggestions" => 0,
];

$unscannable = "";

foreach ($_POST['content'] as $type) {
    session_start();
    $_SESSION["progress"] = $type;
    session_write_close();
    $typeResults = [];
    $courseContentType = get_course_content($type, $base_url, $course_id, $api_key);

    foreach ($courseContentType['items'] as $r) {
        if ($r['amount'] != 0) {
            array_push($typeResults, $r);

            $total_results['errors'] += count($r['error']);
            $total_results['warnings'] += count($r['warning']);
            $total_results['suggestions'] += count($r['suggestion']);
        }
    }

    if ($courseContentType['unscannable']) {
        $unscannable = $courseContentType['unscannable'];
    }

    $courseContentType['items'] = $typeResults;
    $badContent[$type] = [
        'title' => $type,
        'items' => $courseContentType['items'],
        'amount' => $courseContentType['amount'],
        'time' => $courseContentType['time'],
    ];
}

if ($unscannable) {
    $badContent['unscannable'] = [
        'title' => 'unscannable',
        'items' => $unscannable,
        'amount' => count($unscannable),
    ];
}

// so the ajax call knows we're done
session_start();
$_SESSION["progress"] = "done";
session_write_close();

require 'parseResults.php';

// this scans the course
function get_course_content($content_type, $base_url, $course_id, $api_key) {
    $content_result = [
        'items' => [],
        'amount' => 0,
        'time' => microtime(true),
        'unscannable' => [],
    ];
    $per_page = 100;

    switch ($content_type) {
        case "announcements":
            $url = $base_url."/api/v1/courses/".$course_id."/discussion_topics?&only_announcements=true&access_token=".$api_key;
            $response = Request::get($url)->send();
            $the_content = $response;
            break;
        case "assignments":
            $url = $base_url."/api/v1/courses/".$course_id."/assignments?&access_token=".$api_key;
            $response = Request::get($url)->send();
            $the_content = $response;
            break;
        case "discussions":
            $url = $base_url."/api/v1/courses/".$course_id."/discussion_topics?&access_token=".$api_key;
            $response = Request::get($url)->send();
            $the_content = $response;
            break;
        case "files":
            do {
                $url = $base_url."/api/v1/courses/".$course_id."/files?page=1&per_page=".$per_page."&access_token=".$api_key;
                $response = Request::get($url)->send();
                $the_links = parse_links($response->headers->toArray()['link']);

                $the_content = $response;

                if (isset($the_links['next'])) {
                    $url = $the_links['next'];
                }
            } while (isset($the_links['next']));
            break;
        case "pages":
            do {
                $url = $base_url."/api/v1/courses/".$course_id."/pages?page=1&per_page=".$per_page."&access_token=".$api_key;
                $response = Request::get($url)->send();
                $the_links = parse_links($response->headers->toArray()['link']);

                $the_content = $response;

                if (isset($the_links['next'])) {
                    $url = $the_links['next'];
                }
            } while (isset($the_links['next']));
            break;
    }

    foreach ($the_content->body as $single) {
        switch ($content_type) {
            case "announcements":
                array_push($content_result['items'], array(
                    'id' => $single->id,
                    'content' => $single->message,
                    'title' => $single->title,
                    'url' => $single->html_url
                    )
                );
                break;
            case "assignments":
                array_push($content_result['items'], array(
                    'id' => $single->id,
                    'content' => $single->description,
                    'title' => $single->name,
                    'url' => $single->html_url
                    )
                );
                break;
            case "discussions":
                array_push($content_result['items'], array(
                    'id' => $single->id,
                    'content' => $single->message,
                    'title' => $single->title,
                    'url' => $single->html_url
                    )
                );
                break;
            case "files":
                $extension = pathinfo($single->filename)['extension'];
                //don't capture mac files, ._
                $mac_check = (substr($single->display_name, 0, 2));
                if ($mac_check != "._") {
                    if ($extension != "html") {
                        if ($extension == "pdf" || $extension == "doc" || $extension == "docx" || $extension == "ppt" || $extension == "pptx") {
                            array_push($content_result['unscannable'], array(
                                'title' => $single->display_name,
                                'url' => $single->url
                                )
                            );
                        }
                    } else {
                        array_push($content_result['items'], array(
                            'id' => $single->id,
                            'content' => Request::get($single->url)->followRedirects()->send()->body,
                            'title' => $single->display_name,
                            'url' => $single->url
                            )
                        );
                    }
                }
                break;
            case "pages":
                $url = $base_url."/api/v1/courses/".$course_id."/pages/".$single->url."?access_token=".$api_key;
                $wiki_page = Request::get($url)->send();

                array_push($content_result['items'], array(
                    'id' => $wiki_page->body->url,
                    'content' => $wiki_page->body->body,
                    'title' => $wiki_page->body->title,
                    'url' => $wiki_page->body->html_url
                    )
                );
                break;
        }
    }

    $time_end = microtime(true);
    $content_result['amount'] = count($content_result['items']);
    $content_result['items'] = generate_report($content_result['items']);
    $content_result['time'] = round($time_end - $content_result['time'], 2);

    return $content_result;
}

// Creates an assoc. array of the links header
function parse_links($links) {
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

function generate_report($scannedContent) {
    $contentReport = [];
    /* Runs each item in the test array through the Quail accessibility checker */
    foreach ($scannedContent as $html) {
        if (strlen($html['content']) == 0) {
            break;
        }

        $error = 0;
        $report = [];
        $quail = new quail($html['content'], 'section508', 'string', 'static');
        $quail->runCheck();
        $result = $quail->getReport();
        $report = $result['report'];
        $severe = [];
        $warning = [];
        $suggestion = [];

        foreach ($report as $value) {
            //  Some don't have a severity num, no clue why.
            if (!array_key_exists("severity_num", $value)) {
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

        $final['id'] = $html['id'];
        $final['name'] = $html['title'];
        $final['url'] = $html['url'];
        $final['amount'] = $error;
        $final['error'] = $severe;
        $final['warning'] = $warning;
        $final['suggestion'] = $suggestion;

        array_push($contentReport, $final);
    }

    return $contentReport;
}
