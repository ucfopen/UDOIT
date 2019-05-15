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

session_start();
header('Content-Type: text/html; charset=utf-8');

// verify we have the variables we need from the LTI launch
$expect = ['base_url', 'launch_params', ];
foreach ($expect as $key) {
    if (empty($_SESSION[$key])) {
        UdoitUtils::instance()->exitWithPageError("Missing Session information. Please refresh the page. Missing: {$key}");
    }
}
// If the feature has been disabled, deny access.
if (!$admin_panel_enabled) {
    UdoitUtils::instance()->exitWithPageError("This feature has been disabled. Please contact your UDOIT administrator.");
}

// If Administrator is not found in the user's list of roles, kick them out with an error
if (!$_SESSION['is_admin']) {
    UdoitUtils::instance()->exitWithPageError("Insufficient permissions to continue.  Please contact your LMS Administrator.");
}

//TODO: Log each user that accesses the admin interface

//TODO: Remember to do the PostMessage thing to change the height of the iFrame after everything is done loading

// display the admin page
$template_data = [
    'base_url'           => $_SESSION['base_url'],
    'launch_params'      => $_SESSION['launch_params'],
];

$templates = new League\Plates\Engine(__DIR__.'/../templates');
echo($templates->render('admin', $template_data));
