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

require_once(__DIR__.'/../config/settings.php');

// Sanitize post parameters
$get_input = filter_input_array(INPUT_GET, FILTER_SANITIZE_STRING);

session_start();
header('Content-type: text/json');

function respond_and_die($data, $http_code=200)
{
    http_response_code($http_code);

    die(json_encode($data));
}

function respond_with_error($http_code, $data)
{
    $response = [
        'success' => false,
        'data' => $data,
    ];

    respond_and_die($response, $http_code);
}

function respond_with_success($data)
{
    $response = [
        'success' => true,
        'data' => $data,
    ];

    respond_and_die($response, 200);
}

// Verify we have the variables we need from the LTI launch
$expect = ['base_url', 'launch_params', 'is_admin'];
foreach ($expect as $key) {
    if (empty($_SESSION[$key])) {
        // Set response to 401 (Unauthorized)
        respond_with_error(401, "Missing LTI launch information. Please ensure that your instance of UDOIT is installed to Canvas correctly. Missing: {$key}");
    }
}

// If Administrator is not found in the user's list of roles, kick them out with an error
if (!$_SESSION['is_admin']) {
    // Set response to 403 (Forbidden)
    respond_with_error(403, 'Insufficient permissions to continue.  Please contact your LMS Administrator.');
}

// Verify we have the minimum GET parameters we need
if (empty($get_input['stat'])) {
    // Set response to 400 (Bad Request)
    respond_with_error(400, 'Request is missing the stat parameter.  Please contact your administrator.');
}

switch ($get_input['stat']) {
    case 'users':
        $results = UdoitStats::instance()->getUsers();

        if ($results === false) {
            respond_with_error(500, "Error retrieving Users from database.");
        }

        respond_with_success($results);
        break;

    case 'usergrowth':
        // Gather and validate inputs
        $expect = ['grain', 'startdate', 'enddate'];
        foreach ($expect as $key){
            if(empty($get_input[$key])) {
                respond_with_error(400, "Request is missing the {$key} parameter.");
            }
        }

        $startDate = new DateTime($get_input['startDate']);
        $startDate = new DateTime($get_input['endDate']);

        $results = UdoitStats::instance()->countNewUsers($get_input['grain'], $startDate, $endDate);

        if ($results === false) {
            respond_with_error(500, "Error retrieving Users from database.");
        }

        respond_with_success($results);
        break;

    default:
        respond_with_error(400, "Stat {$get_input['stat']} does not exist.");
}
