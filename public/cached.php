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

$dbh = include('../lib/db.php');
// saves the report to the database
$sth = $dbh->prepare(" SELECT * FROM {$db_reports_table} WHERE course_id = :courseid ORDER BY date_run DESC");

session_start();

$sth->bindParam(':courseid', $_SESSION['launch_params']['custom_canvas_course_id'], PDO::PARAM_INT);

session_write_close();

if (!$sth->execute()) {
	Utils::exitWithError('Could not complete database query');
}

$reports = $sth->fetchAll();

// Add the test report if not in production mode
if ($UDOIT_ENV != ENV_PROD){
	$reports[] = [
		'id' => 'TEST',
		'user_id' => 0,
		'course_id' => 'TEST',
		'file_path' => 'reports/test.json',
		'date_run' => 'TEST: 1998 (when section 508 was ammended)',
		'errors'   => 64,
		'suggestions' => 32
	];
}

$templates = new League\Plates\Engine('../templates');
echo $templates->render('saved_reports', ['reports' => $reports]);
