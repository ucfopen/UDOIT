<?php
	include_once('config/localConfig.php');
	include_once('app/curlClass.php');
	$dir = $base;
	$instructorID = "3790159";
	$courseID = "1002791";

	// Gets the instructor ID
	// ...

	// // Gets a list of the instructors course
	// $testVar = get_courses($base_url, $instructorID, $apikey);
	// Gets pages from the instructors course
	// $pageVar = get_pages($base_url, $courseID, $apikey);
	// // Discussion html
	// $discussionHtml = get_discussions($base_url, $courseID, $apikey);
	// // Announcement html
	// $announcementHtml = get_announcements($base_url, $courseID, $apikey);
	// // File html
	// $filesHtml = get_files($base_url, $courseID, $apikey);

	// function get_courses($base_url, $instructorID, $apikey) {
	// 	$instructorCourses = [];
	// 	$url = $base_url."/api/v1/users/".$instructorID."/enrollments?type=TeacherEnrollment&access_token=".$apikey;
	// 	$courses = Curl::get($url, true, null, true);
	// 	foreach($courses['response'] as $course) {
	// 		$url = $base_url."/api/v1/courses/".$course->course_id."/?access_token=".$apikey;
	// 		$class = Curl::get($url, true, null, true);
	// 		array_push($instructorCourses, $class['response']);
	// 	}
	// 	return $instructorCourses;
	// }

	// function get_pages($base_url, $courseID, $apikey){
	// 	$urls = [];
	// 	// $titles = array();
	// 	$pageNum = 1;
	// 	$perPage = 100;

	// 	while(true) {
	// 		$url = $base_url."/api/v1/courses/".$courseID."/pages?page=".$pageNum."&per_page=".$perPage."&access_token=".$apikey;
	// 		//using Kevin's curl class
	// 		$pages = Curl::get($url, true, null, true);

	// 		if(sizeof($pages['response']) == 0) {
	// 			break;
	// 		}

	// 		if(isset($pages['response']->status))
	// 			error($pages['response']->status, $pages['response']->message);

	// 		foreach($pages['response'] as $page){
	// 			$url = $base_url."/api/v1/courses/".$courseID."/pages/".$page->url."?access_token=".$apikey;
	// 			$wikiPage = Curl::get($url, true, null, true);

	// 			array_push($urls, $wikiPage['response']->body);
	// 		}
	// 		$pageNum++;
	// 	}
	// 	return $urls;
	// }

	// function get_discussions($base_url, $courseID, $apikey){
	// 	$courseDiscussions = [];

	// 	$url = $base_url."/api/v1/courses/".$courseID."/discussion_topics?&access_token=".$apikey;
	// 	$topics = Curl::get($url, true, null, true);

	// 	foreach($topics['response'] as $topic){
	// 		$url = $base_url."/api/v1/courses/".$courseID."/discussion_topics/".$topic->id."?access_token=".$apikey;
	// 		$topicOp = Curl::get($url, true, null, true);

	// 		array_push($courseDiscussions, $topicOp['response']->message);
	// 	}
	// 	return $courseDiscussions;
	// }

	// function get_announcements($base_url, $courseID, $apikey){
	// 	$courseAnnouncements = [];

	// 	$url = $base_url."/api/v1/courses/".$courseID."/discussion_topics?&only_announcements=true&access_token=".$apikey;
	// 	$announcements = Curl::get($url, true, null, true);

	// 	foreach($announcements['response'] as $announcement){
	// 		$url = $base_url."/api/v1/courses/".$courseID."/discussion_topics/".$announcement->id."?access_token=".$apikey;
	// 		$announce = Curl::get($url, true, null, true);

	// 		array_push($courseAnnouncements, $announce['response']->message);
	// 	}
	// 	return $courseAnnouncements;
	// }

	// function get_files($base_url, $courseID, $apikey){
	// 	$courseFiles = [];

	// 	$url = $base_url."/api/v1/courses/".$courseID."/files/?content_types[]=text/html&access_token=".$apikey;
	// 	$files = Curl::get($url, true, null, true);

	// 	foreach($files['response'] as $file){
	// 		array_push($courseFiles, $file->display_name);
	// 	}
	// 	return $courseFiles;
	// }


	/* Gets the initial directory to look through */
	$folders = array();
		if (is_dir($dir)) {
			if ($dh = opendir($dir)) {
				while (($file = readdir($dh)) !== false) {
					$info = pathinfo($file);
					if($file != '.' && $file != '..' && $file[0] != '.' && @filetype($dir . $file) == 'dir') {
						array_push($folders, $info['filename']);
					}
				}
				closedir($dh);
			}
		}

	sort($folders);
?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title>UDOIT Tool</title>
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
				<div id="chooserWrapper">
<!-- 					<form id="udoitForm" class="form-horizontal" role="form">
						<div class="form-group">
							<div class="step-number">1</div>
							<label for="courseSelect" class="col-sm-2 control-label">Select course to scan:</label>
							<div class="col-sm-10">
								<select id="courseSelect" class="form-control input-lg">
									<option>--------</option>
									<?php
									foreach($testVar as $tVar) {
										echo "<option>".$tVar->name."</option>";
									}
									?>
								</select>
							</div>
						</div>
						<div class="form-group">
							<span class="col-sm-2 control-label">Select course to scan:</span>
							<div class="col-sm-10">
								<div class="checkbox">
									<label><input type="checkbox"> Announcements</label>
								</div>
								<div class="checkbox">
									<label><input type="checkbox"> Assignments</label>
								</div>
								<div class="checkbox">
									<label><input type="checkbox"> Discussions</label>
								</div>
								<div class="checkbox">
									<label><input type="checkbox"> Pages</label>
								</div>
								<div class="checkbox">
									<label><input type="checkbox"> Files</label>
								</div>
								<hr />
								<div class="checkbox">
									<label><input type="checkbox"> All</label>
								</div>
							</div>
						</div>
						<hr />
						<button type="submit" class="btn btn-block btn-lg btn-success">Begin Scan</button>
					</form>
					<hr /> -->
					<h4>Old Mal form:</h4>
					<form method="post" action="./?page=checker">
						<p><strong>Ignore the following folders/files</strong></p>
						<ul class="nobullet">
							<li><input type="checkbox" name="ignore[]" class="ignore" value="_notes" checked="checked" /> _notes</li>
							<li><input type="checkbox" name="ignore[]" class="ignore" value="Imported_Resources" checked="checked" /> Imported_Resources</li>
							<li><input type="checkbox" name="ignore[]" class="ignore" value="Public Files" checked="checked" />Public Files</li>
							<li><input type="text" class="ignore" name="ignoreInput" /> <a href="#" class="add">Ignore This Folder</a></li>
						</ul>
						<p><strong>Choose your Folder:</strong></p>
						<ul id="folderChooser" class="nobullet">
							<li> courses/  
								<select name="folder[]" class="folder">
									<option value="default"></option>
									<?php foreach($folders as $folder) { ?>
									<option value="<?php echo $folder; ?>"><?php echo $folder; ?></option>
									<?php } #end foreach $folders ?>
								</select>
							</li>
							<li><input type="submit" name="course_submit" id="submit" value="Run Checker" /></li>
						</ul>
					</form>
				</div>
			</main>
		</div>
		<script type="text/javascript" src="assets/js/jquery.js"></script>
		<script type="text/javascript" src="assets/js/default.js"></script>
		<script type="text/javascript" src="assets/js/chooser.js"></script>
	</body>
</html>
