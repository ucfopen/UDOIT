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
require_once('../lib/quail/quail/quail.php');
require_once('../lib/Udoit.php');
require_once('../lib/Ufixit.php');
require_once('../lib/utils.php');

session_start();

$base_url     = $_SESSION['base_url'];
$user_id      = $_SESSION['launch_params']['custom_canvas_user_id'];
$course_title = $_SESSION['launch_params']['context_title'];
$api_key      = $_SESSION['api_key'];

if ( ! Utils::validate_api_key($user_id, $base_url, $api_key)) {
    $api_key = $_SESSION['api_key'] = Utils::refresh_api_key($oauth2_id, $oauth2_uri, $oauth2_key, $base_url, $_SESSION['refresh_token']);

    if (empty($api_key)) {
        Utils::exitWithPartialError('Error refreshing authorization. Please re-load UDOIT and try again.');
    }
}

session_write_close();

$main_action = filter_input(INPUT_POST, 'main_action', FILTER_SANITIZE_STRING);
switch ($main_action) {
    case 'udoit':
        if ($UDOIT_ENV != ENV_PROD) {
            require 'parseResults.php';
            exit();
        }

        $content = filter_input(INPUT_POST, 'content', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY);

        // No content selected
        if ($content == 'none') {
            Utils::exitWithPartialError('Please select which course content you wish to scan above.');
        }

        $data = [
            'course_title'  => $course_title,
            'api_key'       => $api_key,
            'base_uri'      => $base_url,
            'content_types' => $content,
            'course_id'     => filter_input(INPUT_POST, 'course_id', FILTER_SANITIZE_NUMBER_INT)
        ];

        $title = filter_input(INPUT_POST, 'context_title', FILTER_SANITIZE_STRING);
        $udoit = new Udoit($data);
        $udoit->buildReport();
        $file = $udoit->saveReport($title, "../reports/{$user_id}");

        $dbh = include('../lib/db.php');

        $sth = $dbh->prepare("
            ALTER TABLE {$db_reports_table} ADD file TEXT;"
        );
        $sth->execute();

        if ( ! $sth->execute()) {
            error_log("Column already created");
        }

        $sth = $dbh->prepare("
            INSERT INTO
                {$db_reports_table} 
                (user_id, course_id, file, date_run, errors, suggestions)
            VALUES
                (:userid, :courseid, :file, CURRENT_TIMESTAMP, :errors, :suggestions)"
        );

        $sth->bindValue(':userid', $user_id, PDO::PARAM_INT);
        $sth->bindValue(':courseid', $data['course_id'], PDO::PARAM_INT);
        $sth->bindValue(':file', $udoit->getReport(), PDO::PARAM_STR);
        $sth->bindValue(':errors', $udoit->total_results['errors'], PDO::PARAM_STR);
        $sth->bindValue(':suggestions', $udoit->total_results['suggestions'], PDO::PARAM_STR);

        if ( ! $sth->execute()) {
            error_log(print_r($sth->errorInfo(), true));
            Utils::exitWithPartialError('Error inserting report into database');
        }

        $udoit_report = json_decode($udoit->getReport());
        require 'parseResults.php';
        break;

    case 'ufixit':

        $data = [
            'base_uri'     => $base_url,
            'content_id'   => filter_input(INPUT_POST, 'contentid', FILTER_SANITIZE_STRING),
            'content_type' => filter_input(INPUT_POST, 'contenttype', FILTER_SANITIZE_STRING),
            'error_html'   => html_entity_decode(filter_input(INPUT_POST, 'errorhtml', FILTER_SANITIZE_FULL_SPECIAL_CHARS), ENT_QUOTES),
            'error_type'   => filter_input(INPUT_POST, 'errortype', FILTER_SANITIZE_STRING),
            'bold'         => (filter_input(INPUT_POST, 'add-bold', FILTER_SANITIZE_STRING) == 'bold'),
            'italic'       => (filter_input(INPUT_POST, 'add-italic', FILTER_SANITIZE_STRING) == 'italic'),
            'remove_color' => (filter_input(INPUT_POST, 'remove-color', FILTER_SANITIZE_STRING) == 'true'),
            'course_id'    => filter_input(INPUT_POST, 'course_id', FILTER_SANITIZE_NUMBER_INT),
            'api_key'      => $api_key
        ];

        $ufixit = new Ufixit($data);

        if (strtolower($data['content_type']) == 'files') {
            $ufixit->curled_file = $ufixit->getFile("root");

            if ($ufixit->curled_file == false) {
                header('HTTP/1.1 404 File Not Found');
                header('Content-Type: application/json; charset=UTF-8');
                die(json_encode(['message' => '404 Error: File not found']));
            }
        }

        // fixes content based on what the error is
        switch ($data['error_type']) {
            case 'aMustContainText':
            case 'aSuspiciousLinkText':
            case 'aLinkTextDoesNotBeginWithRedundantWord':
                $new_content = filter_input(INPUT_POST, 'newcontent', FILTER_SANITIZE_STRING);
                $corrected_error = $ufixit->fixLink($data['error_html'], $new_content);
                break;

            case 'cssTextHasContrast':
                $new_content_array  = filter_input(INPUT_POST, 'newcontent', FILTER_SANITIZE_STRING, FILTER_REQUIRE_ARRAY);
                $corrected_error = $ufixit->fixCssColor($data['error_html'], $new_content_array, $data['bold'], $data['italic']);
                break;

            case 'cssTextStyleEmphasize':
                $corrected_error = $ufixit->fixCssEmphasize($data['error_html'], $data['bold'], $data['italic'], $data['remove_color']);
                break;

            case 'headersHaveText':
                $new_content = filter_input(INPUT_POST, 'newcontent', FILTER_SANITIZE_STRING);
                $corrected_error = $ufixit->fixHeading($data['error_html'], $new_content);
                break;

            case 'imgHasAlt':
            case 'imgNonDecorativeHasAlt':
            case 'imgAltIsDifferent':
            case 'imgAltIsTooLong':
                $new_content = filter_input(INPUT_POST, 'newcontent', FILTER_SANITIZE_STRING);
                $corrected_error = $ufixit->fixAltText($data['error_html'], $new_content);
                break;

            case 'tableDataShouldHaveTh':
                // fixing table headers is a special case...
                $new_content = filter_input(INPUT_POST, 'newcontent', FILTER_SANITIZE_STRING);
                $corrected_error    = $ufixit->fixTableHeaders($data['error_html'], $new_content);
                $data['error_html'] = $corrected_error['old'];
                $corrected_error    = $corrected_error['fixed'];
                break;

            case 'tableThShouldHaveScope':
                $new_content = filter_input(INPUT_POST, 'newcontent', FILTER_SANITIZE_STRING);
                $corrected_error = $ufixit->fixTableThScopes($data['error_html'], $new_content);
                break;
        }

        // uploads the fixed content
        switch (strtolower($data['content_type'])) {
            case 'announcements':
            case 'discussions':
                $ufixit->uploadFixedDiscussions($corrected_error, $data['error_html']);
                break;

            case 'assignments':
                $ufixit->uploadFixedAssignments($corrected_error, $data['error_html']);
                break;

            case 'files':
                $file_info = $ufixit->uploadFixedFiles($corrected_error, $data['error_html']);
                print_r(json_encode($file_info));
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
