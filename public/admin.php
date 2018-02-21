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
$post_input = filter_input_array(INPUT_POST, FILTER_SANITIZE_STRING);
$post_input['custom_canvas_user_id'] = filter_input(INPUT_POST, 'custom_canvas_user_id', FILTER_SANITIZE_NUMBER_INT);

$expect = ['oauth_consumer_key', 'custom_canvas_api_domain', 'custom_canvas_user_id'];
foreach ($expect as $key) {
    if (empty($post_input[$key])) {
        UdoitUtils::instance()->exitWithPageError("Missing LTI launch information. Please ensure that your instance of UDOIT is installed to Canvas correctly. Missing: {$key}");
    }
}

// verify LTI launch
if (!UdoitUtils::instance()->verifyBasicLTILaunch()) {
    UdoitUtils::instance()->exitWithPageError('LTI/Oauth verification problem, please ensure that your instance of UDOIT is configured correctly.');
}

// store LTI launch variables
session_start();
$user_id                     = $post_input['custom_canvas_user_id'];
UdoitUtils::$canvas_base_url = rtrim("https://{$post_input['custom_canvas_api_domain']}", '/');
$_SESSION['base_url']        = UdoitUtils::$canvas_base_url;
$_SESSION['launch_params']   = [
    'custom_canvas_user_id'         => $post_input['custom_canvas_user_id'],
    'custom_canvas_user_login_id'   => $post_input['custom_canvas_user_login_id'],
    'context_title'                 => $post_input['context_title'],
];

//TODO: Log each user that accesses the admin interface

//TODO: Remember to do the PostMessage thing to change the height of the iFrame after everything is done loading

// display the admin page
$template_data = [
    'base_url'           => $_SESSION['base_url'],
    'launch_params'      => $_SESSION['launch_params'],
];

$templates = new League\Plates\Engine(__DIR__.'/../templates');
echo($templates->render('admin', $template_data));