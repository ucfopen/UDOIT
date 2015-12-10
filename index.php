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
require_once('vendor/autoload.php');
require_once('config/localConfig.php');
use Httpful\Request;

error_reporting(E_ALL & ~E_NOTICE);
ini_set("display_errors", 1);
session_start();
header('Content-Type: text/html; charset=utf-8');

$templates = new League\Plates\Engine('templates');

if ( ! isset($_SESSION['valid'])) {
	$_SESSION['valid'] = false;
}

if ($_SESSION['valid'] === false) {
	include_once('lib/ims-blti/blti.php');
	// Initialize, all secrets are 'secret', do not set session, and do not redirect
	$context = new BLTI($consumer_key, $shared_secret, false, false);

	if ( ! $context->valid) {
		$error = 'Configuration problem, please ensure that your instance of UDOIT is configured correctly.';
		echo $templates->render('error', ['error' => $error]);
		exit();
	}

	$_SESSION['launch_params']['custom_canvas_user_id'] = $_POST['custom_canvas_user_id'];
	$_SESSION['launch_params']['custom_canvas_course_id'] = $_POST['custom_canvas_course_id'];
	$_SESSION['launch_params']['context_label'] = $_POST['context_label'];
	$_SESSION['launch_params']['context_title'] = $_POST['context_title'];
	$_SESSION['valid'] = true;
}

$redirect = true;

// Establish base_url given by canvas API
if( isset($_POST['custom_canvas_api_domain']) ){
	$base_url = $_SESSION['base_url'] = 'https://'.$_POST['custom_canvas_api_domain'].'/';
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

// Pull the API key from the database
try {
	$dsn = "mysql:dbname=$db_name;host=$db_host";
	$dbh = new PDO($dsn, $db_user, $db_password);
} catch (PDOException $e) {
	$_SESSION['valid'] = false;
	echo $templates->render('error', ['error' => 'Connection failed: ' . $e->getMessage()]);
	exit();
}

$sth = $dbh->prepare("SELECT * FROM $db_user_table WHERE id=:userid LIMIT 1");
$sth->bindParam(':userid', $_SESSION['launch_params']['custom_canvas_user_id'], PDO::PARAM_INT);
$sth->execute();

$result = $sth->fetchAll();

if (isset($result[0])) {
	$_SESSION['api_key'] = $result[0]['api_key'];
}

// Do we have an API key?
if (isset($_SESSION['api_key'])) {
	//If we do, test it out
	$url = $base_url.'/api/v1/users/'.$_SESSION['launch_params']['custom_canvas_user_id'].'/profile?access_token='.$_SESSION['api_key'];
	$resp = Request::get($url)->send();
	$redirect = !isset($resp->body->id);
} else {
	//Otherwise, redirect to the oauth2 process
	$redirect = true;
}

// if the api key was invalid, or we didn't have an api key, start the oauth2 process
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
	'launch_params'   => $_SESSION['launch_params'],
	'udoit_tests'     => $udoit_tests
];

echo $templates->render('udoit', $render_arr);
