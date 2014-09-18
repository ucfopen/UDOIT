<?php
include_once('config/localConfig.php');
include_once('app/curlClass.php');
include_once('app/ims-blti/blti.php');

error_reporting(E_ALL & ~E_NOTICE);
ini_set("display_errors", 1);
session_start();
header('Content-Type: text/html; charset=utf-8');

if( !isset($_SESSION['valid']) ){
	$_SESSION['valid'] = false;
}

if( $_SESSION['valid'] === false ){
	// Initialize, all secrets are 'secret', do not set session, and do not redirect
	$context = new BLTI($consumer_key, $shared_secret, false, false);
	//if the oauth is valid
	if($context->valid) {
		$_SESSION['launch_params']['custom_canvas_user_id'] = $_POST['custom_canvas_user_id'];
		$_SESSION['launch_params']['custom_canvas_course_id'] = $_POST['custom_canvas_course_id'];
		$_SESSION['launch_params']['context_label'] = $_POST['context_label'];
		$_SESSION['launch_params']['context_title'] = $_POST['context_title'];
		$_SESSION['valid'] = true;
	} else {
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

// Pull the API key from the database
$dsn = "mysql:dbname=$db_name;host=$db_host";

try {
	$dbh = new PDO($dsn, $db_user, $db_password);
} catch (PDOException $e) {
	echo 'Connection failed: ' . $e->getMessage();
}

$sth = $dbh->prepare("SELECT * FROM $db_user_table WHERE id=:userid LIMIT 1");
$sth->bindParam(':userid', $_SESSION['launch_params']['custom_canvas_user_id'], PDO::PARAM_INT);
$sth->execute();

$result = $sth->fetchAll();

if( isset($result[0]) ){
	$_SESSION['api_key'] = $result[0]['api_key'];
}

// Do we have an API key?
if(isset($_SESSION['api_key'])){
	//If we do, test it out
	$url = $base_url.'/api/v1/users/'.$_SESSION['launch_params']['custom_canvas_user_id'].'/profile?access_token='.$_SESSION['api_key'];
	$resp = CURL::get($url, true, null, true);
	$redirect = !isset($resp['response']->id);
}else{
	//Otherwise, redirect to the oauth2 process
	$redirect = true;
}

// if the api key was invalid, or we didn't have an api key, start the oauth2 process
if( $redirect ){
	//Redirect user to oauth2 endpoint on the Canvas end
	session_write_close();
	header('Location: '.$base_url.'/login/oauth2/auth/?client_id='.$oauth2_id.'&response_type=code&redirect_uri='.$oauth2_uri);
}

// Invalidate the session so we start from scratch
$_SESSION['valid'] = false;

// print_r($_SESSION);
session_write_close();
?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<title>UDOIT Accessibility Checker</title>
		<link rel="icon" type="image/png" href="favicon.ico">
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap-theme.min.css">
		<link href='https://fonts.googleapis.com/css?family=Sonsie+One' rel='stylesheet' type='text/css'>
		<link href="assets/css/main.css" type="text/css" rel="stylesheet" media="screen">
		<link href="assets/css/print.css" type="text/css" rel="stylesheet" media="print">
	</head>
	<body>
		<div class="container">
			<header id="mainHeader" class="navbar navbar-default center">
				<h1 class="logo">UDOIT</h1>
			</header>
			<main id="contentWrapper" role="main">
				<form class="form-horizontal no-print" id="udoitForm" method="post" action="app/checker.php" role="form">
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
						</div>
					</div>
					<hr />
					<div id="waitMsg" class="alert alert-warning" style="display: none;">
						<p><span class="glyphicon glyphicon-warning-sign"></span> Please stay on this page while UDOIT scans your course content.</p>
					</div>
					<button id="submit" type="submit" name="course_submit"  class="btn btn-block btn-lg btn-success">Run scanner</button>
				</form>
				<div class="text-center margin-top">
					<a href="#udoitInfo" class="btn btn-sm btn-default no-print" data-toggle="modal" data-target="#udoitInfo">What does UDOIT look for?</a>
				</div>
				<div class="modal fade" id="udoitInfo" tabindex="-1" role="dialog" aria-labelledby="udoitModalLabel" aria-hidden="true">
					<div class="modal-dialog">
						<div class="modal-content">
							<div class="modal-header">
								<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
								<h4 class="modal-title" id="udoitModalLabel">What accessibility problems does UDOIT look for?</h4>
							</div>
							<div class="modal-body">
								<div class="errorItem panel panel-danger">
									<div class="panel-heading clearfix"><span class="glyphicon glyphicon-ban-circle"></span> Severe</div>

									<ul class="list-group no-margin">
										<li class="list-group-item">Images with missing alt text</li>
										<li class="list-group-item">Image alt text is the same as the filename or src attribute</li>
										<li class="list-group-item">Image alt text is too long</li>
										<li class="list-group-item">Non-decorative images don't alt text</li>
										<li class="list-group-item">Alt text used for images within inputs are placeholders</li>
										<li class="list-group-item">Alt text for all img elements used as source anchors are empty</li>
										<li class="list-group-item">Images that flicker</li>
										<li class="list-group-item">Applets that flicker</li>
										<li class="list-group-item">Objects that flicker</li>
										<li class="list-group-item">Tables do not contain table header (&lt;th&gt;) elements</li>
										<li class="list-group-item">Table header tags (&lt;th&gt;) do not have have a scope of "col" or "row"</li>
										<li class="list-group-item">Text input elements do not have a value</li>
										<li class="list-group-item">Select inputs do not have an associated label</li>
										<li class="list-group-item">Password inputs do not have an associated label</li>
										<li class="list-group-item">Checkbox inputs do not have an associated label</li>
										<li class="list-group-item">All color and background elements have sufficient contrast</li>
										<li class="list-group-item">File inputs do not have an associated label</li>
										<li class="list-group-item">Radio inputs do not have an associated label</li>
										<li class="list-group-item">Frame elements are being used</li>
										<li class="list-group-item">Frames do not have a title attribute</li>
										<li class="list-group-item">Frame titles do not identify the purpose or function of the frame</li>
										<li class="list-group-item">The source for each frame is non-accessible content</li>
										<li class="list-group-item">Relationship between frames are not described</li>
										<li class="list-group-item">Framesets do not have a noframes section</li>
										<li class="list-group-item">Alt text for input images are the same as the filename</li>
										<li class="list-group-item">Alt text for input images are placeholders</li>
										<li class="list-group-item">Input elements with a type attribute value of "image" do not have an alt attribute</li>
										<li class="list-group-item">Text inputs do not have an associated label</li>
										<li class="list-group-item">Objects do not contain a text equivalent of the object</li>
										<li class="list-group-item">Headers do not have text content</li>
										<li class="list-group-item">The document auto-redirects</li>
									</ul>
								</div>

								<div class="panel panel-warning">
									<div class="panel-heading clearfix"><span class="glyphicon glyphicon-warning-sign"></span> Moderate</div>

									<ul class="list-group no-margin">
										<li class="list-group-item">Iframes are being used</li>
										<li class="list-group-item">Applets do not contain a text equivalent in the body of the applet</li>
									</ul>
								</div>

								<div class="panel panel-info no-margin">
									<div class="panel-heading clearfix"><span class="glyphicon glyphicon-info-sign"></span> Suggestions</div>

									<ul class="list-group">
										<li class="list-group-item">Text equivalents for objects aren't updated if the objects change</li>
										<li class="list-group-item">Objects that link to multimedia files do not have text transcripts</li>
										<li class="list-group-item">Videos are not accessible</li>
										<li class="list-group-item">Links to multimedia do not have a text transcript.</li>
										<li class="list-group-item">Img elements contain an ismap attribute</li>
										<li class="list-group-item">Applet user interface are not accessible</li>
										<li class="list-group-item">Alt text for input images contain over 100 characters</li>
										<li class="list-group-item">Meta refresh is not used with a time-out</li>
										<li class="list-group-item">Headers do not have text content</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
		<script src="assets/js/jquery.js"></script>
		<script src="assets/js/jspdf.min.js"></script>
		<script src="assets/js/default.js"></script>
		<script src="assets/js/chooser.js"></script>
		<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js"></script>
	</body>
</html>
