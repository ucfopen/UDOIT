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

require_once(__DIR__.'/includes.php');

// Verify we have the minimum GET parameters we need
if (empty($_GET['stat'])) {
    // Set response to 400 (Bad Request)
    respond_with_error(400, 'Request is missing the stat parameter.  Please contact your administrator.');
}

switch ($_GET['stat']) {
    case 'scans':
        $start_date = empty($_GET['startdate']) ? null : new DateTime($_GET['startdate']);
        $end_date = empty($_GET['enddate']) ? null : new DateTime($_GET['enddate']);

        $term_id = filter_var($_GET['termid'], FILTER_VALIDATE_INT) ? filter_var($_GET['termid'], FILTER_SANITIZE_NUMBER_INT) : null;
        $course_id = filter_var($_GET['courseid'], FILTER_VALIDATE_INT) ? filter_var($_GET['courseid'], FILTER_SANITIZE_NUMBER_INT) : null;
        $user_id = filter_var($_GET['userid'], FILTER_VALIDATE_INT) ? filter_var($_GET['userid'], FILTER_SANITIZE_NUMBER_INT) : null;
        $latest = empty($_GET['latestonly']) ? false : true;

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
            respond_with_error(500, "Error retrieving Users from database.");
        }
        respond_with_success($results);
        break;

    case 'usergrowth':
        $startDate = empty($_GET['startdate']) ? null : new DateTime($_GET['startdate']);
        $endDate = empty($_GET['enddate']) ? null : new DateTime($_GET['enddate']);
        $results = UdoitStats::instance()->countNewUsers($_GET['grain'], $startDate, $endDate);
        if (false === $results) {
            respond_with_error(500, "Error retrieving Users from database.");
        }
        respond_with_success($results);
        break;

    default:
        respond_with_error(400, "Stat {$_GET['stat']} does not exist.");
}
