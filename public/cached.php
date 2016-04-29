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

$dbh = include('../lib/db.php');
// saves the report to the database
$sth = $dbh->prepare("
    SELECT * FROM
        $db_reports_table
    WHERE
		course_id=:courseid
	ORDER BY
		date_run DESC
");

session_start();

$sth->bindParam(':courseid', $_SESSION['launch_params']['custom_canvas_course_id'], PDO::PARAM_INT);

session_write_close();

if (!$sth->execute()) {
	echo '<div class="alert alert-danger no-margin"><span class="glyphicon glyphicon-exclamation-sign"></span> Could not complete database query</div>';
    die();
}

$reports = $sth->fetchAll();

// Helper function to quickly escape HTML output
function esc_attr($s) {
    echo htmlspecialchars($s, ENT_QUOTES, 'utf-8');
}

?>
<div id="resultsTable" class="table-responsive">
	<table class="table table-bordered table-hover no-margin">
		<caption>Saved reports for this course</caption>
		<thead>
			<tr>
				<th scope="col">Date &amp; Time</th>
				<th scope="col">Errors</th>
				<th scope="col">Suggestions</th>
			</tr>
		</thead>

		<tbody>
			<?php foreach ($reports as $report): ?>
				<tr id="<?php esc_attr($report['id']); ?>">
					<td><?php esc_attr($report['date_run']); ?></td>
					<td><?php esc_attr($report['errors']); ?></td>
					<td><?php esc_attr($report['suggestions']); ?></td>
				</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
</div>
