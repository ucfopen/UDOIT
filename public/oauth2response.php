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

$get_input = filter_input_array(INPUT_GET, FILTER_SANITIZE_STRING); // Sanitize $_GET global

if (isset($get_input['error'])) {
    UdoitUtils::instance()->exitWithPageError('Authentication problem: Access Denied.');
}

if (!isset($get_input['code'])) {
    UdoitUtils::instance()->exitWithPageError('Authentication problem, please ensure that your instance of UDOIT is configured correctly.');
}

session_start();
// get session variables
$canvas_user_id = $_SESSION['launch_params']['custom_canvas_user_id'];
$canvas_uri = $_SESSION['base_url'];
$new_key = UdoitUtils::instance()->authorizeNewApiKey($canvas_uri, $get_input['code']);

// It should have access_token and refresh_token
if (!isset($new_key->access_token) || !isset($new_key->refresh_token)) {
    UdoitUtils::instance()->exitWithPageError('Authentication problem:  Please contact support.');
}

UdoitUtils::instance()->createOrUpdateUser($canvas_user_id, $new_key->access_token, $new_key->refresh_token, $canvas_uri);

if ($_SESSION['destination'] === 'admin') {
    $redirect_to = 'admin.php';
} elseif ($_SESSION['destination'] === 'scanner') {
    $redirect_to = 'scanner.php';
}

header("Location: {$redirect_to}");
