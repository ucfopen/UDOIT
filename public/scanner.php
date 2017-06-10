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

// This page is the landing page for LTI launches from canvas
// It'll verify the launch data, and check to see if we have api keys for the current user
// if we have one, but it's invalid - it'll attempt to refresh it
// if refresh
// if it doesn't, it'll attempt to create them

require_once(__DIR__.'/../config/settings.php');

session_start();
header('Content-Type: text/html; charset=utf-8');

// Sanitize post parameters
$post_input = filter_input_array(INPUT_POST, FILTER_SANITIZE_STRING);
$post_input['custom_canvas_user_id'] = filter_input(INPUT_POST, 'custom_canvas_user_id', FILTER_SANITIZE_NUMBER_INT);
$post_input['custom_canvas_course_id'] = filter_input(INPUT_POST, 'custom_canvas_course_id', FILTER_SANITIZE_NUMBER_INT);

// verify we have the variables we need from the LTI launch
$expect = ['base_url','launch_params',];
foreach ($expect as $key) {
	if(empty($_SESSION[$key])){
		UdoitUtils::instance()->exitWithPageError("Missing Session information. Please refresh the page. Missing: {$key}");
	}
}

UdoitUtils::$canvas_base_url = $_SESSION['base_url'];

// display the scanner page
$template_data = [
	'base_url'           => $_SESSION['base_url'],
	'welcome_message'    => $udoit_welcome_message,
	'disclaimer_message' => $udoit_disclaimer_message,
	'launch_params'      => $_SESSION['launch_params'],
	'udoit_tests'        => include(__DIR__.'/../config/tests.php')
];

$templates = new League\Plates\Engine(__DIR__.'/../templates');
echo($templates->render('index', $template_data));
