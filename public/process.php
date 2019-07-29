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

session_start();
$base_url     = $_SESSION['base_url'];
$user_id      = $_SESSION['launch_params']['custom_canvas_user_id'];
$course_title = $_SESSION['launch_params']['context_title'];
UdoitUtils::$canvas_base_url = $_SESSION['base_url'];
session_write_close();

// make sure the session hasn't gone stale and lost the launch params
if (empty($user_id) || empty($base_url)) {
    global $logger;
    $logger->addError('Missing data expected in session, forcing user to relaunch lti');
    exit('{"error": "Your session timed out, please refresh the page and try again."}');
}

$main_action = filter_input(INPUT_POST, 'main_action', FILTER_SANITIZE_STRING);
switch ($main_action) {
    case 'udoit':
        if (ENV_PROD !== $UDOIT_ENV) {
            require 'parseResults.php';
            exit();
        }

        $content   = filter_input(INPUT_POST, 'content', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY);
        $title     = filter_input(INPUT_POST, 'context_title', FILTER_SANITIZE_STRING);
        $course_id = filter_input(INPUT_POST, 'course_id', FILTER_SANITIZE_NUMBER_INT);
        $job_group = uniqid('job_', true); // uniqid for this group of jobs
        $user_id = $_SESSION['launch_params']['custom_canvas_user_id'];
        $api_key = UdoitUtils::instance()->getValidRefreshedApiKey($user_id);
        $course_locale = substr(UdoitUtils::instance()->getCourseLocale($api_key, $course_id), 0, 2);

        // No content selected
        if ('none' === $content) {
            $logger->addInfo('no content selected');
            exit('{"error": "Please select which course content you wish to scan above."}');
        }

        // common data object
        $common_data = [
            'course_title' => $course_title,
            'base_uri'     => $base_url,
            'title'        => $title,
            'course_id'    => $course_id,
            'scan_item'    => $scan_item,
            'course_locale'=> $course_locale
        ];

        // create an id to group all these jobs together
        $job_group_id = UdoitJob::createJobGroupId();

        // expire old jobs to make sure old jobs don't clog up the queue
        UdoitJob::expireOldJobs();

        // split up the items we're scanning into multiple jobs
        foreach ($content as $scan_item) {
            $data = array_merge($common_data, ['scan_item' => $scan_item]);
            UdoitJob::addJobToQueue('scan', $user_id, $job_group_id, $data);
        }

        // RUN NOW if the background worker isn't enabled
        if (!UdoitJob::$background_worker_enabled) {
            $limit = 50;
            while (!UdoitJob::isJobGroupReadyToFinalize($job_group_id) && $limit--) {
                UdoitJob::runNextJob();
            }
        }
        // add a job to combine the results from all the jobs

        echo(json_encode(['job_group' => $job_group_id]));
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
            'api_key'      => UdoitUtils::instance()->getValidRefreshedApiKey($user_id),
        ];

        $ufixit = new Ufixit($data);

        if (strtolower($data['content_type']) === 'files') {
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
            case 'imgHasAltDeco':
            case 'imgNonDecorativeHasAlt':
            case 'imgAltIsDifferent':
            case 'imgAltIsTooLong':
                if (filter_input(INPUT_POST, 'makedeco', FILTER_SANITIZE_STRING) == 'on') {
                    $corrected_error = $ufixit->fixAltText($data['error_html'], "", true);
                } else {
                    $new_content = filter_input(INPUT_POST, 'newcontent', FILTER_SANITIZE_STRING);
                    $corrected_error = $ufixit->fixAltText($data['error_html'], $new_content, false);
                }
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
