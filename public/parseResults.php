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

$post_input = filter_input_array(INPUT_POST, FILTER_SANITIZE_STRING); // Sanitize $_POST global

$templates  = new League\Plates\Engine('../templates');

if (isset($post_input['cached_id'])) {
	$dbh = include('../lib/db.php');

	$sth = $dbh->prepare("
	    SELECT * FROM
	        $db_reports_table
	    WHERE
			id=:cachedid
	");

	$sth->bindParam(':cachedid', $post_input['cached_id'], PDO::PARAM_INT);

	if (!$sth->execute()) {
		$error = 'Error searching for report';
		echo $templates->render('partials/error', ['error' => $error]);
		error_log($error);
		error_log(print_r($sth->errorInfo(), true));
		exit();
	}

	$file         = $sth->fetch(PDO::FETCH_OBJ)->file_path;
	$the_json     = file_get_contents($file);
	$udoit_report = json_decode($the_json);

} elseif ($post_input['main_action'] === "cached") {
	$error = 'Cannot parse this report. JSON file not found.';
	echo $templates->render('partials/error', ['error' => $error]);
	error_log($error);
	exit();
}

$issue_count = 0;

$regex = array(
	'@youtube\.com/embed/([^"\& ]+)@i',
	'@youtube\.com/v/([^"\& ]+)@i',
	'@youtube\.com/watch\?v=([^"\& ]+)@i',
	'@youtube\.com/\?v=([^"\& ]+)@i',
	'@youtu\.be/([^"\& ]+)@i',
	'@youtu\.be/v/([^"\& ]+)@i',
	'@youtu\.be/watch\?v=([^"\& ]+)@i',
	'@youtu\.be/\?v=([^"\& ]+)@i',
	);

function isYouTubeVideo($link_url, $regex)
{
	$matches = null;
	foreach($regex as $pattern) {
		if(preg_match($pattern, $link_url, $matches)) {
			return $matches[1];
		}
	}
	return null;
}

$results = [
	'course' => $udoit_report->course,
	'error_count' => $udoit_report->total_results->errors,
	'suggestion_count' => $udoit_report->total_results->suggestions,
	'report_groups' => $udoit_report->content,
	'post_path' => $post_input['path'],
	'fixable_error_types' => ["cssTextHasContrast", "imgHasAlt", "imgNonDecorativeHasAlt", "tableDataShouldHaveTh", "tableThShouldHaveScope", "headersHaveText", "aMustContainText", "imgAltIsDifferent", "imgAltIsTooLong"],

];

echo $templates->render('partials/results', $results);
