<?php

include_once('../config/localConfig.php');

// saves the report to the database
$dsn = "mysql:dbname=$db_name;host=$db_host";

try {
    $dbh = new PDO($dsn, $db_user, $db_password);
} catch (PDOException $e) {
    echo 'Connection failed: ' . $e->getMessage();
}

$sth = $dbh->prepare("
    SELECT * FROM
        $db_reports_table
    WHERE
		course_id=:courseid
");

session_start();

$sth->bindParam(':courseid', $_SESSION['launch_params']['custom_canvas_course_id'], PDO::PARAM_INT);

session_write_close();

if (!$sth->execute()) {
    die('Ya done goof\'d');
}

$reports = $sth->fetchAll();

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
				<tr id="<?= $report['id']; ?>">
					<td><?= $report['date_run']; ?></td>
					<td><?= $report['errors']; ?></td>
					<td><?= $report['suggestions']; ?></td>
				</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
</div>