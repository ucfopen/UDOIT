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

    echo(json_encode($data));

    die();
}

function respond_with_error($http_code, $message)
{
    $response = [
        'status'  => 'error',
        'message' => $message,
    ];

    // Set response to 401 (Unauthorized)
    respond_and_die($response, $http_code);
}

// Verify we have the variables we need from the LTI launch
$expect = ['base_url', 'launch_params', 'is_admin'];
foreach ($expect as $key) {
    if (empty($_SESSION[$key])) {
        $response = [
            'status'  => 'error',
            'message' => "Missing LTI launch information. Please ensure that your instance of UDOIT is installed to Canvas correctly. Missing: {$key}",
        ];

        // Set response to 401 (Unauthorized)
        respond_and_die($response, 401);
    }
}

// If Administrator is not found in the user's list of roles, kick them out with an error
if (!$_SESSION['is_admin']) {
    $response = [
        'status'  => 'error',
        'message' => 'Insufficient permissions to continue.  Please contact your LMS Administrator.',
    ];
    // Set response to 403 (Forbidden)
    respond_and_die($response, 403);
}

// Verify we have the minimum GET parameters we need
if (empty($get_input['stat'])) {
    $response = [
        'status'  => 'error',
        'message' => "Request is missing the stat parameter.  Please contact your administrator.",
    ];

    // Set response to 400 (Bad Request)
    respond_and_die($response, 400);
}

switch ($get_input['stat']) {
    case 'users':
        $results = UdoitStats::instance()->getUsers();
        if ($results !== false) {
            $response = [
                'status' => 'success',
                'data' => $results,
            ];
            respond_and_die($response);
        } else {
            respond_with_error(500, "Error retrieving Users from database.");
        }
        
        break;

    case 'usergrowth':
        // Gather and validate inputs
        $expect = ['grain', 'startdate', 'enddate'];
        foreach ($expect as $key){
            if(empty($get_input[$key])) {
                respond_with_error(400, "Request is missing the {$key} parameter.");
            }
        }

        break;

    default:
        $response = [
            'status'  => 'error',
            'message' => "Stat {$get_input['stat']} does not exist.",
        ];

        // Set response to 400 (Bad Request)
        respond_and_die($response, 400);
}