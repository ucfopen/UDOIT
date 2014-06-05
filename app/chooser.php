<?php
	include_once('config/localConfig.php');
	include_once('app/curlClass.php');
	$dir = $base;

	// $testVar = get_course_names($base_url, $instructorID, $apikey);

	/* Grabs a list of courses for the dropdown menu */
	// function get_course_names($base_url, $instructorID, $apikey) {
	// 	$instructorCourses = [];
	// 	$url = $base_url."/api/v1/users/".$instructorID."/enrollments?type=TeacherEnrollment&access_token=".$apikey;
	// 	$courses = Curl::get($url, true, null, true);
	// 	foreach($courses['response'] as $course) {
	// 		$url = $base_url."/api/v1/courses/".$course->course_id."/?access_token=".$apikey;
	// 		$class = Curl::get($url, true, null, true);
	// 		array_push($instructorCourses, array(
	// 			'name' => $class['response']->name,
	// 			'id' => $class['response']->id
	// 			)
	// 		);
	// 	}
	// 	return $instructorCourses;
	// }
?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title>UDOIT Accessibility Checker</title>
		<link rel="icon" type="image/png" href="favicon.ico">
		<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css" />
		<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap-theme.min.css" />
		<link href='https://fonts.googleapis.com/css?family=Sonsie+One' rel='stylesheet' type='text/css'>
		<link href="assets/css/main.css" type="text/css" rel="stylesheet" media="screen" />
		<link href="assets/css/print.css" type="text/css" rel="stylesheet" media="print"/>
	</head>
	<body>
		<div class="container">
			<?php require_once('header.php'); ?>
			<main id="contentWrapper" role="main">
				<form id="udoitForm" method="post" class="form-horizontal no-print" action="./?page=checker" role="form">
					<div class="form-group">
						<span class="col-sm-2 control-label"><strong>Select content:</strong></span>
						<div class="col-sm-10">
							<div class="checkbox">
								<label><input type="checkbox" value="all" id="allContent" class="content" name="content[]" checked> All</label>
							</div>
							<hr />
							<div class="checkbox">
								<label><input type="checkbox" value="announcements" class="content" name="content[]" checked> Announcements</label>
							</div>
							<div class="checkbox">
								<label><input type="checkbox" value="assignments" class="content" name="content[]" checked> Assignments</label>
							</div>
							<div class="checkbox">
								<label><input type="checkbox" value="discussions" class="content" class="content" name="content[]" checked> Discussions</label>
							</div>
							<div class="checkbox">
								<label><input type="checkbox" value="files" class="content" name="content[]" checked> Files</label>
							</div>
							<div class="checkbox">
								<label><input type="checkbox" value="pages" class="content" name="content[]" checked> Pages</label>
							</div>
						</div>
					</div>
					<hr />
					<button id="submit" type="submit" name="course_submit"  class="btn btn-block btn-lg btn-success">Run scanner</button>
				</form>
			</main>
		</div>
		<script type="text/javascript" src="assets/js/jquery.js"></script>
		<script type="text/javascript" src="assets/js/default.js"></script>
		<script type="text/javascript" src="assets/js/chooser.js"></script>
	</body>
</html>
