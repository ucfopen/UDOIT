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
require_once('../lib/ims-blti/blti.php');

use Httpful\Request;

error_reporting(E_ALL & ~E_NOTICE);
ini_set("display_errors", 1);
session_start();
header('Content-Type: text/html; charset=utf-8');

if ( isset($_SERVER['HTTP_REFERER']) ) {
	if ( preg_match(Config::REFERER_TEST, $_SERVER['HTTP_REFERER']) != 1) {
?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<title>UDOIT Accessibility Checker</title>
		<link rel="icon" type="image/png" href="favicon.ico">
		<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css">
		<link href='//fonts.googleapis.com/css?family=Sonsie+One' rel='stylesheet' type='text/css'>
		<link href="assets/css/main.css" type="text/css" rel="stylesheet" media="screen">
		<link href="assets/css/print.css" type="text/css" rel="stylesheet" media="print">
	</head>
	<body>
		<div class="container">
			<header id="mainHeader" class="navbar navbar-default center">
				<h1 class="logo">UDOIT</h1>
			</header>
			<div class="alert alert-danger">
				<p><?= $error_msg_wrong_referrer ?></p>
			</div>
		</div>
	</body>
</html>
<?php
		die();
	}
} else {
?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<title>UDOIT Accessibility Checker</title>
		<link rel="icon" type="image/png" href="favicon.ico">
		<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css">
		<link href='//fonts.googleapis.com/css?family=Sonsie+One' rel='stylesheet' type='text/css'>
		<link href="assets/css/main.css" type="text/css" rel="stylesheet" media="screen">
		<link href="assets/css/print.css" type="text/css" rel="stylesheet" media="print">
	</head>
	<body>
		<div class="container">
			<header id="mainHeader" class="navbar navbar-default center">
				<h1 class="logo">UDOIT</h1>
			</header>
			<div class="alert alert-danger">
				<p><?= $error_msg_no_referrer ?></p>
			</div>
		</div>
	</body>
</html>
<?php
	die();
}


if (!isset($_SESSION['valid'])) {
	$_SESSION['valid'] = false;
}

if ($_SESSION['valid'] === false) {
	// Initialize, all secrets are 'secret', do not set session, and do not redirect
	$context = new BLTI(Config::CONSUMER_KEY, Config::SHARED_SECRET, false, false);
	//if the oauth is valid
	if ($context->valid) {
		$_SESSION['launch_params']['custom_canvas_user_id'] = $_POST['custom_canvas_user_id'];
		$_SESSION['launch_params']['custom_canvas_course_id'] = $_POST['custom_canvas_course_id'];
		$_SESSION['launch_params']['context_label'] = $_POST['context_label'];
		$_SESSION['launch_params']['context_title'] = $_POST['context_title'];
		$_SESSION['valid'] = true;
	} else {
		error_log("BLTI not valid: our key: {Config::CONSUMER_KEY}");
		error_log($context->message);
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
							<span class="glyphicon glyphicon-exclamation-sign"></span> Configuration problem, please ensure that your instance of UDOIT is configured correctly.
						</div>
					</div>
				</body>
			</html>
		';
		die();
	}
}

$redirect = true;

$dbh = include('../lib/db.php');
$table = Config::DB_USER_TABLE;

// Pull the API key from the database
$sth = $dbh->prepare("SELECT * FROM $table WHERE id=:userid LIMIT 1");
$sth->bindParam(':userid', $_SESSION['launch_params']['custom_canvas_user_id'], PDO::PARAM_INT);
$sth->execute();

$result = $sth->fetchAll();

if (isset($result[0])) {
	$_SESSION['api_key'] = $result[0]['api_key'];
}

// Do we have an API key?
if (isset($_SESSION['api_key'])) {
	//If we do, test it out
	$url = Config::BASE_URL.'/api/v1/users/'.$_SESSION['launch_params']['custom_canvas_user_id'].'/profile?access_token='.$_SESSION['api_key'];
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
	header('Location: '.Config::BASE_URL.'/login/oauth2/auth/?client_id='.Config::OATH2_URI.'&response_type=code&redirect_uri='.Config::OATH2_URI);
}

// Invalidate the session so we start from scratch
$_SESSION['valid'] = false;

session_write_close();

?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<title>UDOIT Accessibility Checker</title>
		<link rel="icon" type="image/png" href="favicon.ico">
		<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css">
		<link href='//fonts.googleapis.com/css?family=Sonsie+One' rel='stylesheet' type='text/css'>
		<link href="assets/css/main.css" type="text/css" rel="stylesheet" media="screen">
		<link href="assets/css/print.css" type="text/css" rel="stylesheet" media="print">
	</head>
	<body>
		<div class="container">
			<header id="mainHeader" class="navbar navbar-default center">
				<h1 class="logo">UDOIT</h1>
			</header>
			<div class="alert alert-warning">
				If you have any suggestions on how UDOIT can be improved, please <a href="https://jfe.qualtrics.com/form/SV_es0XFCNS0ymgcD3">leave feedback</a>
			</div>
			<ul class="nav nav-tabs nav-justified" role="tablist">
				<li role="presentation" class="active"><a href="#scanner" role="tab" data-toggle="tab">Scan Course</a></li>
				<li role="presentation"><a href="#cached" role="tab" data-toggle="tab">View Old Reports</a></li>
			</ul>
			<main id="contentWrapper" role="main">
				<div class="tab-content">
					<div class="tab-pane active" id="scanner" role="tabpanel">
						<div class="panel panel-default">
							<div class="panel-body">
								<h2>Welcome to <span style="font-weight: normal;">U</span><span style="font-weight: bold;">DO</span><span style="font-weight: normal;">IT</span>!</h2>

								<p><?php echo $udoit_welcome_message ?></p>

								<p class="no-margin"><a href="#udoitInfo" class="btn btn-sm btn-default no-print" data-toggle="modal" data-target="#udoitInfo">What does UDOIT look for?</a></p>
							</div>
						</div>
						<form class="form-horizontal no-print" id="udoitForm" method="post" action="lib/process.php" role="form">
							<input type="hidden" name="main_action" value="udoit">
							<input type="hidden" name="session_course_id" value="<?php echo $_SESSION['launch_params']['custom_canvas_course_id'] ?>">
							<input type="hidden" name="session_context_label" value="<?php echo $_SESSION['launch_params']['context_label'] ?>">
							<input type="hidden" name="session_context_title" value="<?php echo $_SESSION['launch_params']['context_title'] ?>">

							<div class="form-group">
								<span class="col-sm-2 control-label"><strong>Select content:</strong></span>

								<div class="col-sm-10">
									<div class="checkbox">
										<label><input id="allContent" type="checkbox" value="all" id="allContent" class="content" name="content[]" checked> All</label>
									</div>

									<hr />

									<div class="checkbox">
										<label><input id="courseAnnouncements" type="checkbox" value="announcements" class="content" name="content[]" checked> Announcements</label>
									</div>

									<div class="checkbox">
										<label><input id="courseAssignments" type="checkbox" value="assignments" class="content" name="content[]" checked> Assignments</label>
									</div>

									<div class="checkbox">
										<label><input id="courseDiscussions" type="checkbox" value="discussions" class="content" class="content" name="content[]" checked> Discussions</label>
									</div>

									<div class="checkbox">
										<label><input id="courseFiles" type="checkbox" value="files" class="content" name="content[]" checked> Files</label>
									</div>

									<div class="checkbox">
										<label><input id="coursePages" type="checkbox" value="pages" class="content" name="content[]" checked> Pages</label>
									</div>

									<div class="checkbox">
										<label><input id="courseSyllabus" type="checkbox" value="syllabus" class="content" name="content[]" checked> Syllabus</label>
									</div>

									<div class="checkbox">
										<label><input id="moduleUrls" type="checkbox" value="modules" class="content" name="content[]" checked> Module URLs</label>
									</div>
								</div>
							</div>

							<hr />

							<div id="waitMsg" class="alert alert-warning" style="display: none;">
								<p><span class="glyphicon glyphicon-warning-sign"></span> Please stay on this page while UDOIT scans your course content.</p>
							</div>

							<button id="submit" type="submit" name="course_submit"  class="btn btn-block btn-lg btn-success">Run scanner</button>

							<div class="alert alert-danger no-margin margin-top" id="failMsg" style="display: none;"><span class="glyphicon glyphicon-exclamation-sign"></span> UDOIT failed to scan this course.</div>
						</form>
					</div>
					<div class="tab-pane" id="cached" role="tabpanel">

					</div>
				</div>

				<div class="modal fade" id="udoitInfo" tabindex="-1" role="dialog" aria-labelledby="udoitModalLabel" aria-hidden="true">
					<div class="modal-dialog modal-lg">
						<div class="modal-content">
							<div class="modal-header">
								<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>

								<h4 class="modal-title" id="udoitModalLabel">What accessibility issues does UDOIT look for?</h4>
							</div>
							<div class="modal-body">
								<div class="errorItem panel panel-danger">
									<div class="panel-heading clearfix"><span class="glyphicon glyphicon-ban-circle"></span> Errors</div>

									<ul class="list-group no-margin">
										<?php foreach ($udoit_tests['severe'] as $severe): ?>
											<li class="list-group-item">
												<p class="list-group-item-text "><?= $severe['title'] ?> <button type="button" class="btn btn-xs btn-default" data-toggle="collapse" data-target="#<?= $severe['name'] ?>">More info</button></p>

												<div class="list-group-item-text collapse" id="<?= $severe['name'] ?>">
													<hr>

													<?= $severe['desc']; ?>

													<?php if ($severe['resources']) :?>
														<p>Resources:</p>
														<ul>
															<?php foreach ($severe['resources'] as $resource): ?>
																<li><?= $resource; ?></li>
															<?php endforeach; ?>
														</ul>
													<?php endif; ?>

													<?php if ($severe['example']): ?>
														<hr>
														<?= $severe['example']; ?>
													<?php endif; ?>
												</div>
											</li>
										<?php endforeach; ?>
									</ul>
								</div>

								<div class="panel panel-info no-margin">
									<div class="panel-heading clearfix"><span class="glyphicon glyphicon-info-sign"></span> Suggestions</div>

									<ul class="list-group">
										<?php foreach ($udoit_tests['suggestion'] as $suggestion): ?>
											<li class="list-group-item">
												<p class="list-group-item-text "><?= $suggestion['title'] ?> <button type="button" class="btn btn-xs btn-default" data-toggle="collapse" data-target="#<?= $suggestion['name'] ?>">More info</button></p>

												<div class="list-group-item-text collapse" id="<?= $suggestion['name'] ?>">
													<hr>

													<?= $suggestion['desc']; ?>

													<?php if ($suggestion['resources']) :?>
														<p>Resources:</p>
														<ul>
															<?php foreach ($suggestion['resources'] as $resource): ?>
																<li><?= $resource; ?></li>
															<?php endforeach; ?>
														</ul>
													<?php endif; ?>

													<?php if ($suggestion['example']): ?>
														<hr>
														<?= $suggestion['example']; ?>
													<?php endif; ?>
												</div>
											</li>
										<?php endforeach; ?>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>

		<script src="//code.jquery.com/jquery-2.1.1.min.js"></script>
		<script src="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js"></script>
		<script src="assets/js/jscolor/jscolor.js"></script>
		<script src="assets/js/default.js?c=0"></script>
	</body>
</html>
