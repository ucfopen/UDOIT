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

session_start();
header('Content-Type: text/html; charset=utf-8');

// Sanitize post parameters
$post_input = filter_input_array(INPUT_POST, FILTER_SANITIZE_STRING);
$post_input['custom_canvas_user_id'] = filter_input(INPUT_POST, 'custom_canvas_user_id', FILTER_SANITIZE_NUMBER_INT);
$post_input['custom_canvas_course_id'] = filter_input(INPUT_POST, 'custom_canvas_course_id', FILTER_SANITIZE_NUMBER_INT);

// set session to invalid ONLY when we need to verify the LTI oauth or an existing valid session doesn't exist
if ( isset($post_input["oauth_consumer_key"]) || ! isset($_SESSION['valid'])) {
	$_SESSION['valid'] = false; // force BLTI verification
}

// Validate LTI and store Launch Params in session
if ($_SESSION['valid'] == false && $UDOIT_ENV == ENV_PROD) {
	require_once('../lib/ims-blti/blti.php');

	// Initialize, all secrets are 'secret', do not set session, and do not redirect
	$context = new BLTI($consumer_key, $shared_secret, false, false);

	if ( ! $context->valid) {
		Utils::exitWithPageError('Configuration problem, please ensure that your instance of UDOIT is configured correctly.');
	}

	$_SESSION['launch_params']['custom_canvas_user_id'] = $post_input['custom_canvas_user_id'];
	$_SESSION['launch_params']['custom_canvas_course_id'] = $post_input['custom_canvas_course_id'];
	$_SESSION['launch_params']['context_label'] = $post_input['context_label'];
	$_SESSION['launch_params']['context_title'] = $post_input['context_title'];
	$_SESSION['valid'] = true;
}

// get base_url from the LTI launch params or session variables
if ( ! empty($post_input['custom_canvas_api_domain'])) {
	$base_url = $_SESSION['base_url'] = "https://{$post_input['custom_canvas_api_domain']}/";
}
elseif ( ! empty($_SESSION['base_url'])) {
	$base_url = $_SESSION['base_url'];
}
elseif ($UDOIT_ENV == ENV_PROD) {
	// exit with an error when not in development
	Utils::exitWithPageError('No domain provided. Please ensure that your instance of UDOIT is installed to Canvas correctly.');
}

// By default, we'll be redirecting to the Oauth2 process, unless something below interrupts that redirect
$must_get_new_api_key = true;
$must_refresh_api_key = true;

// validate existing api key
if ( ! empty($_SESSION['api_key'])) {
	$valid = Utils::validate_api_key($_SESSION['launch_params']['custom_canvas_user_id'], $base_url, $_SESSION['api_key']);
	$must_refresh_api_key = !$valid;
	$must_get_new_api_key = false;
}

// refresh the api key
if ($must_refresh_api_key) {
	$must_get_new_api_key = true;

	// Pull the Refresh Token from the database
	$dbh = include('../lib/db.php');
	$sth = $dbh->prepare("SELECT api_key FROM {$db_user_table} WHERE id = :userid LIMIT 1");
	$sth->bindValue(':userid', $_SESSION['launch_params']['custom_canvas_user_id'], PDO::PARAM_INT);
	$sth->execute();

	if ($result = $sth->fetchObject()) {
		$_SESSION['refresh_token'] = $result->api_key;

		$token = Utils::refresh_api_key($oauth2_id, $oauth2_uri, $oauth2_key, $base_url, $_SESSION['refresh_token']);

		if ($token) {
			$_SESSION['api_key'] = $token;
			$must_get_new_api_key = false;
		}
	}
}

// if the redirect key was invalid or we didn't have a redirect key, start the oauth2 process
if ($must_get_new_api_key && $UDOIT_ENV == ENV_PROD) {
	header("Location: {$base_url}/login/oauth2/auth/?client_id={$oauth2_id}&response_type=code&redirect_uri={$oauth2_uri}");
	exit('nope');
}

// Invalidate the session so we start from scratch
$_SESSION['valid'] = false;

$render_arr = [
	'post_input'         => $post_input,
	'welcome_message'    => $udoit_welcome_message,
	'disclaimer_message' => $udoit_disclaimer_message,
	'launch_params'      => $_SESSION['launch_params'],
	'udoit_tests'        => $udoit_tests
];

$templates = new League\Plates\Engine('../templates');
echo($templates->render('index', $render_arr));
