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

use Httpful\Request;

error_reporting(E_ALL & ~E_NOTICE);
ini_set("display_errors", 1);
session_start();
header('Content-Type: text/html; charset=utf-8');
//ja: Sanitize $post parameters
$post  = filter_input_array(INPUT_POST, FILTER_SANITIZE_STRING);

$templates = new League\Plates\Engine('../templates');

// If we have oauth values in post or if we don't have a valid session variable, set the variable to false
// This forces the user to go through the BLTI verification
if ( isset($_POST["oauth_consumer_key"]) || !isset($_SESSION['valid'])) {
	$_SESSION['valid'] = false;
}

if ($_SESSION['valid'] === false) {
	require_once('../lib/ims-blti/blti.php');
	// Initialize, all secrets are 'secret', do not set session, and do not redirect
	$context = new BLTI($consumer_key, $shared_secret, false, false);

	if ( ! $context->valid) {
		error_log("BLTI not valid: our key: {$consumer_key}");
		error_log($context->message);
		$error = 'Configuration problem, please ensure that your instance of UDOIT is configured correctly.';
		echo $templates->render('error', ['error' => $error]);
		exit();
	}

	$_SESSION['launch_params']['custom_canvas_user_id'] = $post['custom_canvas_user_id'];
	$_SESSION['launch_params']['custom_canvas_course_id'] = $post['custom_canvas_course_id'];
	$_SESSION['launch_params']['context_label'] = $post['context_label'];
	$_SESSION['launch_params']['context_title'] = $post['context_title'];
	$_SESSION['valid'] = true;
}

// Establish base_url given by canvas API
if( isset($post['custom_canvas_api_domain']) ){
	$base_url = $_SESSION['base_url'] = 'https://'.$post['custom_canvas_api_domain'].'/';
} elseif( isset($_SESSION['base_url']) ){
	$base_url = $_SESSION['base_url'];
} else {
	echo '
			<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
					<title>UDOIT Accessibility Checker</title>
					<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css" />
					<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap-theme.min.css" />
				</head>
				<body>
					<div style="padding: 12px;">
						<div class="alert alert-danger">
							<span class="glyphicon glyphicon-exclamation-sign"></span> No domain provided.  Please ensure that your instance of UDOIT is installed to Canvas correctly.
						</div>
					</div>
				</body>
			</html>
		';
		die();
}

// By default, we'll be redirecting to the Oauth2 process, unless something below interrupts that redirect
$redirect = true;



// Test the API key from the session first.
// If it doesn't work, we need to go through the refresh process
if (isset($_SESSION['api_key'])) {
	//If we do, test it out
	$url = $base_url.'api/v1/users/'.$_SESSION['launch_params']['custom_canvas_user_id'].'/profile';
	$resp = Request::get($url)
		->addHeader('Authorization', 'Bearer '.$_SESSION['api_key'])
		->send();
	$refresh = !isset($resp->body->id);
	$redirect = false;
} else {
	$refresh = true;
}

if( $refresh ) {
	$dbh = include('../lib/db.php');

	// Pull the Refresh Token from the database
	$sth = $dbh->prepare("SELECT * FROM $db_user_table WHERE id=:userid LIMIT 1");
	$sth->bindParam(':userid', $_SESSION['launch_params']['custom_canvas_user_id'], PDO::PARAM_INT);
	$sth->execute();

	$result = $sth->fetchAll();

	if (isset($result[0])) {
		$_SESSION['refresh_token'] = $result[0]['api_key'];

		//Exchange Refresh Token for API Key
		$url = $base_url . '/login/oauth2/token';

		$postdata = array(
			'grant_type' => 'refresh_token',
			'client_id' => $oauth2_id,
			'redirect_uri' => $oauth2_uri,
			'client_secret' => $oauth2_key,
			'refresh_token' => $_SESSION['refresh_token']
		);

		$post = http_build_query($postdata);
		$ch = curl_init($url);

		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

		$response = json_decode(curl_exec($ch));
		curl_close($ch);

		// Check response to make sure the refresh token is still valid.  If not valid, go through Oauth2
		if ( isset($response->access_token) ){
			$_SESSION['api_key'] = $response->access_token;
			$redirect = false;
		} else {
			$redirect = true;
		}
	} else {
		//If there is no user in the DB, send them to the Oauth2 process
		$redirect = true;
	}
}

// if the redirect key was invalid or we didn't have a redirect key, start the oauth2 process
if ($redirect) {
	//Redirect user to oauth2 endpoint on the Canvas end
	session_write_close();
	header('Location: '.$base_url.'/login/oauth2/auth/?client_id='.$oauth2_id.'&response_type=code&redirect_uri='.$oauth2_uri);
}

// Invalidate the session so we start from scratch
$_SESSION['valid'] = false;

session_write_close();

$render_arr = [
	'welcome_message' => $udoit_welcome_message,
	'disclaimer_message' => $udoit_disclaimer_message,
	'launch_params'   => $_SESSION['launch_params'],
	'udoit_tests'     => $udoit_tests
];

echo $templates->render('udoit', $render_arr);
