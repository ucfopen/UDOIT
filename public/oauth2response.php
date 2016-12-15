<?php
/**
*	Copyright (C) 2014 University of Central Florida, created by Jacob Bates, Eric Colon, Fenel Joseph, and Emily Sachs.
*
*	This program is free software: you can redistribute it and/or modify
*	it under the terms of the GNU General Public License as published by
*	the Free Software Foundation, either version 3 of the License, or
*	(at your option) any later version.
*
*	This program is distributed in the hope that it will be useful,
*	but WITHOUT ANY WARRANTY; without even the implied warranty of
*	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*	GNU General Public License for more details.
*
*	You should have received a copy of the GNU General Public License
*	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
*	Primary Author Contact:  Jacob Bates <jacob.bates@ucf.edu>
*/
require_once('../config/settings.php');
require_once('../lib/utils.php');

$get_input = filter_input_array(INPUT_GET, FILTER_SANITIZE_STRING); // Sanitize $_GET global

if (isset($get_input['error'])) {
	Utils::exitWithPageError('Authentication problem:  Access Denied.');
}

if (isset($get_input['code'])) {
	session_start();

	$base_url  = $_SESSION['base_url'];
	$response  = Utils::authorize_new_api_key($oauth2_id, $oauth2_uri, $oauth2_key, $base_url, $get_input['code']);

	// It should have access_token and refresh_token
	if ( ! isset($response->access_token) || ! isset($response->refresh_token)) {
		Utils::exitWithPageError('Authentication problem:  Please contact support.');
	}

	// Save the API key to the session variable
	$_SESSION['api_key'] = $response->access_token;

	// Save Refresh Key to DB

	// check for existing
	$dbh = include('../lib/db.php');
	$sth = $dbh->prepare("SELECT * FROM {$db_user_table} WHERE id = :userid LIMIT 1");
	$sth->bindValue(':userid', $_SESSION['launch_params']['custom_canvas_user_id'], PDO::PARAM_INT);
	$sth->execute();

	// insert or update
	if ($result = $sth->fetchObject()) {
		$sth = $dbh->prepare("UPDATE {$db_user_table} SET api_key = :key WHERE id = :userid");
	} else {
		$sth = $dbh->prepare("INSERT INTO {$db_user_table} (id, api_key, date_created) VALUES (:userid, :key, CURRENT_TIMESTAMP)");
	}

	// execute
	$sth->bindValue(':key', $response->refresh_token, PDO::PARAM_STR);
	$sth->bindValue(':userid', $_SESSION['launch_params']['custom_canvas_user_id'], PDO::PARAM_INT);
	$sth->execute();

	header('Location: index.php');
	exit();
}

Utils::exitWithPageError('Authentication problem, please ensure that your instance of UDOIT is configured correctly.');
