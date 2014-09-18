<?php
    include_once('../config/localConfig.php');
    include_once('curlClass.php');
    require_once('../core/quail/quail.php');

    session_start();
    // print_r($_SESSION);

    $course_id = $_SESSION['launch_params']['custom_canvas_course_id'];
    $api_key = $_SESSION['api_key'];

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

    foreach ($_POST['content'] as $type) {
        $_SESSION["progress"] = $type;
        $typeResults = [];
        $courseContentType = get_course_content($type, $base_url, $course_id, $api_key);

        foreach ($courseContentType['items'] as $r) {
            if($r['amount'] != 0) {
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
            "title" => $type,
            "items" => $courseContentType['items'],
            "amount" => $courseContentType['amount'],
            "time" => $courseContentType['time'],
        ];
    }

    // so the ajax call knows we're done
    $_SESSION["progress"] = "done";

    echo '
    <h1 class="text-center">
        Report for ' . $_SESSION['launch_params']['context_title'] . '
        <br>
        <small>' . $total_results['errors'] . ' errors total, ' . $total_results['warnings'] . ' warnings total, ' . $total_results['suggestions'] . ' suggestions total</small>
    </h1>

    <p><a href="#" class="btn btn-default btn-xs download-pdf"><span class="glyphicon glyphicon-save"></span> Save report as PDF</a><p>
    <div id="errorWrapper">
    ';

    foreach ($badContent as $bad) {
        parse_results(ucfirst($bad['title']), $bad);
    }

    if (isset($unscannable)) {
        parse_results("unscannable", $unscannable);
    }

    // this scans the course
    function get_course_content($content_type, $base_url, $course_id, $api_key) {
        $content_result = [
            'items' => [],
            'amount' => 0,
            'time' => microtime(true),
            'unscannable' => [],
        ];
        $per_page = 100;
        $the_content = [];
        $custom_headers = ['Authorization: Bearer '.$api_key];

        switch ($content_type) {
            case "announcements":
                $url = $base_url."/api/v1/courses/".$course_id."/discussion_topics?&only_announcements=true&access_token=".$api_key;
                break;
            case "assignments":
                $url = $base_url."/api/v1/courses/".$course_id."/assignments?&access_token=".$api_key;
                break;
            case "discussions":
                $url = $base_url."/api/v1/courses/".$course_id."/discussion_topics?&access_token=".$api_key;
                break;
            case "files":
                $url = $base_url."/api/v1/courses/".$course_id."/files?page=1&per_page=".$per_page."&access_token=".$api_key;
                break;
            case "pages":
                $url = $base_url."/api/v1/courses/".$course_id."/pages?page=1&per_page=".$per_page."&access_token=".$api_key;
                break;
        }

        do {
            $ch = curl_init($url);

            curl_setopt($ch, CURLOPT_HTTPHEADER, $custom_headers);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_VERBOSE, 1);
            curl_setopt($ch, CURLOPT_HEADER, 1);

            $response = curl_exec($ch);
            $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
            $links = extractLinks(substr($response, 0, $header_size));
            $body = substr($response, $header_size);

            curl_close($ch);

            $the_content = array_merge($the_content, json_decode($body));

            if(isset($links['next'])) {
                $url = $links['next'];
            }
        } while (isset($links['next']));

        foreach ($the_content as $single) {
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
                                'content' => Curl::get($single->url, false, array(CURLOPT_FOLLOWLOCATION=>1)),
                                'title' => $single->display_name,
                                'url' => $single->url
                                )
                            );                          
                        }
                    }
                    break;
                case "pages":
                    $url = $base_url."/api/v1/courses/".$course_id."/pages/".$single->url."?access_token=".$api_key;
                    $wiki_page = Curl::get($url, true, null, true);

                    array_push($content_result['items'], array(
                        'id' => $wiki_page['response']->url,
                        'content' => $wiki_page['response']->body,
                        'title' => $wiki_page['response']->title,
                        'url' => $wiki_page['response']->html_url
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

    function extractLinks($headers){
        // Convert to array
        $header_array = http_parse_headers($headers);
        // Break up the links into one entry per link
        $links = explode(',', $header_array['Link']);

        $pretty = [];

        // Break up the link entries into URL and rel
        foreach ($links as $key=>$link) {
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

    function parse_results($contentType, $result) { ?>
    <? if($contentType != "unscannable"): ?>
        <h2 class="content-title"><?= $contentType; ?> <small><?= count($result['items']) ?> bad files from <?= $result['amount'] ?> total in <?= $result['time'] ?> seconds</small></h2>
        <? if(!$result['items']): ?>
            <div class="alert alert-success"><span class="glyphicon glyphicon-ok"></span> No problems were detected for this type of content!</div>
        <? else: ?>
            <? foreach($result['items'] as $report): ?>
                <? if($report['amount'] > 0): ?>
                    <div class="errorItem panel panel-default">
                        <div class="panel-heading clearfix">
                            <button class="btn btn-xs btn-default btn-toggle pull-left no-print margin-right-small"><span class="glyphicon glyphicon-plus"></span></button>

                            <h3 class="plus pull-left"><a href="<?= $report['url']; ?>" target="_blank"><?= $report['name']; ?></a></h3>

                            <div class="pull-right">
                                <span class="label label-danger <?php if(count($report['error']) == 0) { echo 'fade '; } if(count($report['error']) < 10) { echo 'single'; } else { echo 'double'; } ?>"><span class="glyphicon glyphicon-ban-circle"></span> <?= count($report['error']); ?></span>
                                <span class="label label-warning <?php if(count($report['warning']) == 0) { echo 'fade '; } if(count($report['warning']) < 10) { echo 'single'; } else { echo 'double'; } ?>"><span class="glyphicon glyphicon-warning-sign"></span> <?= count($report['warning']); ?></span>
                                <span class="label label-primary <?php if(count($report['suggestion']) == 0) { echo 'fade '; } if(count($report['suggestion']) < 10) { echo 'single'; } else { echo 'double'; } ?>"><span class="glyphicon glyphicon-info-sign"></span> <?= count($report['suggestion']); ?></span>
                            </div>
                        </div>

                        <div class="errorSummary panel-body">
                            <? if(count($report['error']) > 0): ?>
                                <div class="panel panel-danger">
                                    <div class="panel-heading">
                                        <h4 class="panel-title">Errors (<?= count($report['error']); ?>)</h4>
                                    </div>

                                    <ul class="list-group">
                                        <? foreach($report['error'] as $item): ?>
                                            <li class="list-group-item">
                                                <div class="clearfix margin-bottom-small">
                                                    <h5 class="error pull-left"><span class="glyphicon glyphicon-remove-sign"></span> <?= $item['title']; ?></h5>
                                                </div>

                                                <? if(isset($item['description'])): ?>
                                                    <p><?= $item['description'] ?></p>
                                                <? endif; ?>

                                                <? if($item['html']): ?>
                                                    <pre><code class="html"><strong>Line <?= $item['lineNo']; ?></strong>: <?= $item['html']; ?></code></pre>
                                                <? endif; ?>

                                                <? if($item['type'] = "cssTextHasContrast" || $item['type'] = "imgHasAlt" || $item['type'] = "tableDataShouldHaveTh" || $item['type'] = "tableThShouldHaveScope"): ?>
                                                    <button class="fix-this no-print btn btn-success">U FIX IT!</button>

                                                    <form action="app/contentUpdater.php" method="post" class="form-horizontal no-print hidden" role="form">
                                                        <input type="hidden" name="contentid" value="<?= $report['id'] ?>">

                                                        <div class="input-group">
                                                            <input type="text" name="newcontent" class="form-control" placeholder="New value">
                                                            <span class="input-group-btn">
                                                                <button class="submit-content btn btn-default" type="submit">Submit</button>
                                                            </span>
                                                        </div><!-- /input-group -->
                                                    </form>
                                                <? endif; ?>
                                            </li>
                                        <? endforeach; ?>
                                    </ul>
                                </div>
                            <? endif; ?>

                            <? if(count($report['warning']) > 0): ?>
                                <div class="panel panel-warning">
                                    <div class="panel-heading">
                                        <h4 class="panel-title">Warnings (<?= count($report['warning']); ?>)</h4>
                                    </div>

                                    <ul class="list-group">
                                        <? foreach($report['warning'] as $item): ?>
                                            <li class="list-group-item">
                                                <div class="clearfix margin-bottom-small">
                                                    <h5 class="warning pull-left"><span class="glyphicon glyphicon-remove-sign"></span> <?= $item['title']; ?></h5>
                                                </div>

                                                <? if(isset($item['description'])): ?>
                                                    <p><?= $item['description'] ?></p>
                                                <? endif; ?>

                                                <? if($item['html']): ?>
                                                    <pre><code class="html"><strong>Line <?= $item['lineNo']; ?></strong>: <?= $item['html']; ?></code></pre>
                                                <? endif; ?>
                                            </li>
                                        <? endforeach; ?>
                                    </ul>
                                </div>
                            <? endif; ?>

                            <? if(count($report['suggestion']) > 0): ?>
                                <div class="panel panel-info no-margin">
                                    <div class="panel-heading">
                                        <h4 class="panel-title">Suggestions (<?= count($report['suggestion']); ?>)</h4>
                                    </div>

                                    <ul class="list-group">
                                        <? foreach($report['suggestion'] as $item): ?>
                                            <li class="list-group-item">
                                                <div class="clearfix margin-bottom-small">
                                                    <h5 class="suggestion pull-left"><span class="glyphicon glyphicon-remove-sign"></span> <?= $item['title']; ?></h5>
                                                </div>

                                                <? if(isset($item['description'])): ?>
                                                    <p><?= $item['description'] ?></p>
                                                <? endif; ?>

                                                <? if($item['html']): ?>
                                                    <pre><code class="html"><strong>Line <?= $item['lineNo']; ?></strong>: <?= $item['html']; ?></code></pre>
                                                <? endif; ?>
                                            </li>
                                        <? endforeach; ?>
                                    </ul>
                                </div>
                            <? endif; ?>
                        </div>
                    </div>
                <? endif; ?>
            <? endforeach; ?>
        <? endif; ?>
    <? else: ?>
        <h2 class="content-title text-danger">Unscannable <small class="text-danger"><?= count($result) ?> files</small></h2>
        <div class="errorItem panel panel-danger">
            <div class="panel-heading clearfix">
                <button class="btn btn-xs btn-danger btn-toggle pull-left no-print margin-right-small"><span class="glyphicon glyphicon-plus"></span></button>

                <h3 class="plus pull-left">UDOIT cannot scan these files</h3>
            </div>

            <div class="errorSummary panel-body">
                <div class="list-group no-margin">
                    <? foreach($result as $item): ?>
                        <a href="<?= $item['url']; ?>" class="list-group-item"><?= $item['title']; ?></a>
                    <? endforeach; ?>
                </ul>
            </div>
        </div>      
    <? endif; ?>
<?php } //end of function

