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
require_once('../config/localConfig.php');
require_once('../core/quail/quail.php');
require('../vendor/autoload.php');
include 'Udoit.php';
include 'Ufixit.php';

use Httpful\Request;

$SESSION_user_id = $_POST['user_id'];
$SESSION_course_id = $_POST['course_id'];
$SESSION_context_label = $_POST['context_label'];
$SESSION_context_title = $_POST['context_title'];

// check if course content is being scanned or fixed
switch ($_POST['main_action']) {
    case 'udoit':
        // for saving this report later

        session_start();
        $user_id = $SESSION_user_id; //$_SESSION['launch_params']['custom_canvas_user_id'];
        session_write_close();

        // UDOIT can't scan what isn't selected
        if ($_POST['content'] === 'none') {
            die('<div class="alert alert-danger no-margin margin-top"><span class="glyphicon glyphicon-exclamation-sign"></span> Please select which course content you wish to scan above.</div>');
        }

        session_start();
        $data = [
            'api_key'       => $_SESSION['api_key'],
            'base_uri'      => $base_url,
            'content_types' => $_POST['content'],
            'course_id'     => $SESSION_course_id //$_SESSION['launch_params']['custom_canvas_course_id']
        ];
        session_write_close();

        $udoit = new Udoit($data);
        $udoit->buildReport();

        $to_encode = [
            'course'        => $SESSION_context_title, //$_SESSION['launch_params']['context_title'],
            'total_results' => $udoit->total_results,
            'content'       => $udoit->bad_content,
        ];
        $encoded_report   = json_encode($to_encode);
        $report_directory = '../reports/'.$user_id.'/'.$to_encode['course'];

        if (!file_exists($report_directory)) {
            mkdir($report_directory, 0777, true);
            chmod('../reports/'.$user_id, 0777);
            chmod($report_directory, 0777);
        }

        $file = $report_directory.'/'.date('Y_m_d__g:i_a').'.json';

        file_put_contents($file, $encoded_report);
        chmod($file, 0777);

        // saves the report to the database
        $dsn = "mysql:dbname=$db_name;host=$db_host";

        try {
            $dbh = new PDO($dsn, $db_user, $db_password);
        } catch (PDOException $e) {
            echo 'Connection failed: ' . $e->getMessage();
        }

        $sth = $dbh->prepare("
            INSERT INTO
                $db_reports_table
            SET
                user_id=:userid,
                course_id=:courseid,
                file_path=:filepath,
                date_run=NOW(),
                errors=:errors,
                suggestions=:suggestions
        ");
        $sth->bindParam(':userid', $user_id, PDO::PARAM_INT);
        $sth->bindParam(':courseid', $data['course_id'], PDO::PARAM_INT);
        $sth->bindParam(':filepath', $file, PDO::PARAM_STR);
        $sth->bindParam(':errors', $udoit->total_results['errors'], PDO::PARAM_STR);
        $sth->bindParam(':suggestions', $udoit->total_results['suggestions'], PDO::PARAM_STR);

        if (!$sth->execute()) {
            die('Ya done goof\'d');
        }

        $udoit_report = json_decode($encoded_report);

        require 'parseResults.php';

        break;
    case 'ufixit':
        $data = [
            'base_uri'     => $base_url,
            'content_id'   => $_POST['contentid'],
            'content_type' => $_POST['contenttype'],
            'error_html'   => htmlspecialchars_decode($_POST['errorhtml']),
            'error_colors' => isset($_POST['errorcolor']) ? $_POST['errorcolor'] : '',
            'error_type'   => $_POST['errortype'],
            'new_content'  => $_POST['newcontent']
        ];

        session_start();

        $data['course_id'] = $SESSION_course_id; //$_SESSION['launch_params']['custom_canvas_course_id'];

        $dom = new DOMDocument();
        $data['api_key']   = $_SESSION['api_key'];

        session_write_close();

        $ufixit = new Ufixit($data);

        if ($data['content_type'] === 'files') {
            $ufixit->curled_file = $ufixit->getFile("root");

            if ($ufixit->curled_file == false) {
                header('HTTP/1.1 404 File Not Found');
                header('Content-Type: application/json; charset=UTF-8');
                die(json_encode(['message' => '404 Error: File not found']));
            }
        }

        $submitting_again = false;

        // fixes content based on what the error is
        switch ($data['error_type']) {
            case 'aMustContainText':
            case 'aSuspiciousLinkText':
            case 'aLinkTextDoesNotBeginWithRedundantWord':

                $dom->loadHTML('<?xml encoding="utf-8" ?>' . $data['error_html']);

                $tag = $dom->getElementsByTagName('a')->item(0);
                $tag->removeAttribute('target');
                $data['error_html'] = $dom->saveHTML($tag);

                $corrected_error = $ufixit->fixLink($data['error_html'], $data['new_content'], $submitting_again);
                break;
            case 'cssTextHasContrast':
                $corrected_error = $ufixit->fixCss($data['error_colors'], $data['error_html'], $data['new_content'], $submitting_again);
                break;
            case 'headersHaveText':
                $corrected_error = $ufixit->fixHeading($data['error_html'], $data['new_content'], $submitting_again);
                break;
            case 'imgHasAlt':
            case 'imgNonDecorativeHasAlt':
            case 'imgAltIsDifferent':
                //$data['error_html'] = str_replace('alt=""', 'alt', $data['error_html']);
                $corrected_error = $ufixit->fixAltText($data['error_html'], $data['new_content'], $submitting_again);

                $remove_attr = preg_replace("/ data-api-endpoint.*$/s", "", $data['error_html']);
                $data['error_html'] = $remove_attr;
                break;
            case 'tableDataShouldHaveTh':
                // fixing table headers is a special case...
                $corrected_error    = $ufixit->fixTableHeaders($data['error_html'], $data['new_content'], $submitting_again);
                $data['error_html'] = $corrected_error['old'];
                $corrected_error    = $corrected_error['fixed'];
                break;
            case 'tableThShouldHaveScope':
                $corrected_error = $ufixit->fixTableThScopes($data['error_html'], $data['new_content'], $submitting_again);
                break;
        }

        // uploads the fixed content
        switch ($data['content_type']) {
            case 'announcements':
            case 'discussions':
                $ufixit->uploadFixedDiscussions($corrected_error, $data['error_html']);
                break;
            case 'assignments':
                $ufixit->uploadFixedAssignments($corrected_error, $data['error_html']);
                break;
            case 'files':
                $ufixit->uploadFixedFiles($corrected_error, $data['error_html']);
                break;
            case 'pages':
                $ufixit->uploadFixedPages($corrected_error, $data['error_html']);
                break;
            case 'syllabus':
                $ufixit->uploadFixedSyllabus($corrected_error, $data['error_html']);
                break;
        }

        break;
}