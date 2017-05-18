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

$post_input = filter_input_array(INPUT_POST, FILTER_SANITIZE_STRING); // Sanitize $_POST global

if ( ! isset($post_input['path'])) {
	$post_input['path'] = '';
}

$templates  = new League\Plates\Engine('../templates');

// Load the test report in test/dev mode and no other report is selected
if ($UDOIT_ENV !== ENV_PROD && !isset($post_input['cached_id'])) {
	$post_input['cached_id'] = 'TEST'; // TEST is the id of the test report
}

if (isset($post_input['cached_id'])) {

	if ($post_input['cached_id'] == 'TEST') {
		$file = 'reports/test.json';
	}
	else {
		$dbh = include('../lib/db.php');

		$sth = $dbh->prepare("SELECT * FROM {$db_reports_table} WHERE id=:cachedid");

		$sth->bindValue(':cachedid', $post_input['cached_id'], PDO::PARAM_INT);

		if ( ! $sth->execute()) {
			error_log(print_r($sth->errorInfo(), true));
			Utils::exitWithPartialError('Error searching for report');
		}

		$file = $sth->fetch(PDO::FETCH_OBJ)->file_path;
	}

	$json         = file_get_contents($file);
	$udoit_report = json_decode($json);

	if (is_null($udoit_report)) {
		$json_error = json_last_error_msg();
		Utils::exitWithPartialError("Cannot parse this report. JSON error $json_error.");
	}

} elseif ($post_input['main_action'] === "cached") {
	Utils::exitWithPartialError('Cannot parse this report. JSON file not found.');
}
$issue_count = 0;

$results = [
	'course'              => $udoit_report->course,
	'error_count'         => $udoit_report->total_results->errors,
	'suggestion_count'    => $udoit_report->total_results->suggestions,
	'report_groups'       => $udoit_report->content,
	'post_path'           => $post_input['path'],
	'fixable_error_types' => ["cssTextHasContrast", "imgNonDecorativeHasAlt", "tableDataShouldHaveTh", "tableThShouldHaveScope", "headersHaveText", "aMustContainText", "imgAltIsDifferent", "imgAltIsTooLong"],
	'fixable_suggestions' => ["aSuspiciousLinkText", "imgHasAlt", "aLinkTextDoesNotBeginWithRedundantWord", "cssTextStyleEmphasize"]
];

echo($templates->render('partials/results', $results));
