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

require_once(__DIR__.'/includes.php');

// Verify we have the minimum GET parameters we need
if (!isset($_GET['stat'])) {
    // Set response to 400 (Bad Request)
    respond_with_error(400, 'Request is missing the stat parameter.  Please contact your administrator.');
}

switch ($_GET['stat']) {
    case 'scans':
        $start_date = !empty($_GET['startdate']) ? new DateTime($_GET['startdate']) : null;
        $end_date = !empty($_GET['enddate']) ? new DateTime($_GET['enddate']) : null;
        $term_id = sanitize_id($_GET['termid']);
        $course_id = sanitize_id($_GET['courseid']);
        $user_id = sanitize_id($_GET['userid']);
        $latest = isset($_GET['latestonly']) ? true : false;

        $results = UdoitStats::instance()->getReports($latest, $_GET['orderby'],
            $get_data = [
                'start_date'    => $start_date,
                'end_date'      => $end_date,
                'term_id'       => $term_id,
                'course_id'     => $course_id,
                'user_id'       => $user_id,
            ]
        );
        if (false === $results) {
            respond_with_error(500, "Error retrieving Scans from database.");
        }

        respond_with_success($results);
        break;
    
    case 'errors':
        $results = UdoitStats::instance()->getReportJsons();
        if (false === $results) {
            respond_with_error(500, "Error retrieving Scans from database.");
        }

        foreach ($results as $result) {
            $reports[] = json_decode($result['report_json'], true);
        }

        // Count errors
        foreach ($reports as $report) {
            foreach ($report['error_summary'] as $error => $value) {
                if (!isset($errors_count[$error])) {
                    $errors_count[$error] = $value['count'];
                    continue;
                }
                $errors_count[$error] += $value['count'];
            }
        }

        $errors = [];

        if (!empty($errors_count)) {
            arsort($errors_count); // Sort in descending order

            // Format to make compatible with current json_tableify function
            foreach ($errors_count as $error => $count) {
                $errors[] = [
                    'Error' => $error,
                    'Count' => $count,
                ];
            }
        }

        respond_with_success($errors);

        break;

    case 'usergrowth':
        $startDate = !empty($_GET['startdate']) ? new DateTime($_GET['startdate']) : null;
        $endDate = !empty($_GET['enddate']) ? new DateTime($_GET['enddate']) : null;
        $results = UdoitStats::instance()->countNewUsers($_GET['grain'], $startDate, $endDate);
        if (false === $results) {
            respond_with_error(500, "Error retrieving User Growth from database.");
        }

        respond_with_success($results);
        break;

    case 'termslist':
        $user_id = $_SESSION['launch_params']['custom_canvas_user_id'];
        $api_key = UdoitUtils::instance()->getValidRefreshedApiKey($_SESSION['launch_params']['custom_canvas_user_id']);
        $request = $_SESSION['base_url'].'/api/v1/accounts/'.$user_id.'/terms';
        $results = Request::get($request)->addHeader('Authorization', "Bearer ${api_key}")->send()->body->enrollment_terms;
        if (false === $results) {
            respond_with_error(500, "Error retrieving Terms from database.");
        }

        for ($i = 0; $i < count($results); $i++) {
            $terms[$i] = ['name' => $results[$i]->name, 'id' => $results[$i]->id];
        }

        respond_with_success($terms);
        break;

    case 'courseinfo':
        if (empty($_GET['id'])) {
            respond_with_error(400, "Request is missing the {$key} parameter.");
        }

        $course_id = sanitize_id($_GET['id']);
        $api_key = UdoitUtils::instance()->getValidRefreshedApiKey($_SESSION['launch_params']['custom_canvas_user_id']);
        $request = $_SESSION['base_url'].'/api/v1/courses/'.$course_id.'?include[]=term';
        $course = Request::get($request)->addHeader('Authorization', "Bearer ${api_key}")->send()->body;

        if (false === $course) {
            respond_with_error(500, "Error retrieving Course from database.");
        }

        respond_with_success([
            'Term' => $course->term->name,
            'Course' => $course->name,
        ]);
        break;

    case 'username':
        if (empty($_GET['id'])) {
            respond_with_error(400, "Request is missing the {$key} parameter.");
        }

        $id = sanitize_id($_GET['id']);
        $api_key = UdoitUtils::instance()->getValidRefreshedApiKey($_SESSION['launch_params']['custom_canvas_user_id']);
        $request = $_SESSION['base_url'].'/api/v1/users/'.$id.'/profile';
        $result = Request::get($request)->addHeader('Authorization', "Bearer ${api_key}")->send()->body->name;

        if (false === $result) {
            respond_with_error(500, "Error retrieving Course from database.");
        }

        respond_with_success($result);
        break;

    default:
        respond_with_error(400, "Stat {$_GET['stat']} does not exist.");
}
