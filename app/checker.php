<?php
	include_once('config/localConfig.php');
	include_once('app/curlClass.php');
	require_once('core/quail/quail.php');

	// because we can't scan what isn't selected
	if($_POST['content'] == 'none') {
		echo "<div class=\"alert alert-danger no-margin margin-top\"><span class=\"glyphicon glyphicon-exclamation-sign\"></span> Please select which course content you wish to scan above.</div>";
		exit();
	}

	$course_id = 1002791;
?>
<h2 class="center">Report for Dev_TRT0003_Colon_E_03</h2>
<p><a href="#" id="print" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-print"></span> Print this Report</a><p>
<div id="errorWrapper">
<?php
	if(in_array("announcements", $_POST["content"])) {
		session_start();
		$_SESSION["progress"] = 1;
		session_write_close();

		$courseAnnouncements = get_course_content("Announcements", $base_url, $course_id, $apikey);
		$announcmentsResults = generate_report($courseAnnouncements);
	}

	if(in_array("assignments", $_POST["content"])) {
		session_start();
		$_SESSION["progress"] = 2;
		session_write_close();

		$courseAssignments = get_course_content("Assignments", $base_url, $course_id, $apikey);
		$assignmentsResults = generate_report($courseAssignments);
	}

	if(in_array("discussions", $_POST["content"])) {
		session_start();
		$_SESSION["progress"] = 3;
		session_write_close();

		$courseDiscussions = get_course_content("Discussions", $base_url, $course_id, $apikey);
		$discussionsResults = generate_report($courseDiscussions);
	}

	if(in_array("files", $_POST["content"])) {
		session_start();
		$_SESSION["progress"] = 4;
		session_write_close();

		$courseFiles = get_course_content("Files", $base_url, $course_id, $apikey);
		$filesResults = generate_report($courseFiles);
	}

	if(in_array("pages", $_POST["content"])) {
		session_start();
		$_SESSION["progress"] = 5;
		session_write_close();

		$coursePages = get_course_content("Pages", $base_url, $course_id, $apikey);
		$pagesResults = generate_report($coursePages);
	}

	// so the ajax call knows we're done
	session_start();
	$_SESSION["progress"] = 'done';
	session_write_close();

	// this scans the course
	function get_course_content($content_type, $base_url, $course_id, $apikey) {
		$content_result = [];

		if($content_type == "Announcements") {
			$url = $base_url."/api/v1/courses/".$course_id."/discussion_topics?&only_announcements=true&access_token=".$apikey;
			$announcements = Curl::get($url, true, null, true);

			foreach($announcements['response'] as $announcement) {
				$url = $base_url."/api/v1/courses/".$course_id."/discussion_topics/".$announcement->id."?access_token=".$apikey;
				$announce = Curl::get($url, true, null, true);

				array_push($content_result, array(
					'content' => $announce['response']->message,
					'title' => $announce['response']->title,
					'url' => $announce['response']->html_url
					)
				);
			}
		}

		if($content_type == "Assignments") {
			$url = $base_url."/api/v1/courses/".$course_id."/assignments?&access_token=".$apikey;
			$assignments = Curl::get($url, true, null, true);

			foreach($assignments['response'] as $assignment) {
				$url = $base_url."/api/v1/courses/".$course_id."/assignments/".$assignment->id."?access_token=".$apikey;
				$assign = Curl::get($url, true, null, true);

				array_push($content_result, array(
					'content' => $assign['response']->description,
					'title' => $assign['response']->name,
					'url' => $assign['response']->html_url
					)
				);
			}
		}

		if($content_type == "Discussions") {
			$url = $base_url."/api/v1/courses/".$course_id."/discussion_topics?&access_token=".$apikey;
			$topics = Curl::get($url, true, null, true);

			foreach($topics['response'] as $topic) {
				$url = $base_url."/api/v1/courses/".$course_id."/discussion_topics/".$topic->id."?access_token=".$apikey;
				$topicOp = Curl::get($url, true, null, true);

				array_push($content_result, array(
					'content' => $topicOp['response']->message,
					'title' => $topicOp['response']->title,
					'url' => $topicOp['response']->html_url
					)
				);
			}
		}

		if($content_type == "Files") {
			$page_num = 1;
			$per_page = 100;

			while(true) {
				$url = $base_url."/api/v1/courses/".$course_id."/files?page=".$page_num."&per_page=".$per_page."&content_types[]=text/html&access_token=".$apikey;
				$files = Curl::get($url, true, null, true);

				if(sizeof($files['response']) == 0) {
					break;
				}

				foreach($files['response'] as $file) {
					//don't capture them mac files, ._
					$mac_check = (substr($file->display_name, 0, 2));
					if($mac_check != "._") {
						array_push($content_result, array(
							'content' => Curl::get($file->url, false, array(CURLOPT_FOLLOWLOCATION=>1)),
							'title' => $file->display_name,
							'url' => $file->url
							)
						);
					}
				}
				$page_num++;
			}
		}

		if($content_type == "Pages") {
			$pageNum = 1;
			$perPage = 100;

			while(true) {
				$url = $base_url."/api/v1/courses/".$course_id."/pages?page=".$pageNum."&per_page=".$perPage."&access_token=".$apikey;
				//using Kevin's curl class
				$pages = Curl::get($url, true, null, true);

				if(sizeof($pages['response']) == 0) {
					break;
				}

				if(isset($pages['response']->status)) {
					error($pages['response']->status, $pages['response']->message);
				}

				foreach($pages['response'] as $page) {
					$url = $base_url."/api/v1/courses/".$course_id."/pages/".$page->url."?access_token=".$apikey;
					$wikiPage = Curl::get($url, true, null, true);

					array_push($content_result, array(
						'content' => $wikiPage['response']->body,
						'title' => $wikiPage['response']->title,
						'url' => $base_url."/courses/".$course_id."/wiki/".$wikiPage['response']->url
						)
					);
				}
				$pageNum++;
			}
		}

		return $content_result;
	}

	function generate_report($scannedContent) {
		$contentReport = [];
		/* Runs each item in the test array through the Quail accessibility checker */
		foreach($scannedContent as $html) {
			if(strlen($html['content']) == 0) {
				break;
			}

			$error = 0;
			$report = array();
			$quail = new quail($html['content'], 'section508', 'string', 'static');

			$quail->runCheck();
			$result = $quail->getReport();
			$report = $result['report'];
			$severe = array();
			$warning = array();
			$suggestion = array();


			foreach($report as $value) {
				//  Some don't have a severity num, no clue why.
				if(!array_key_exists("severity_num", $value)) {
					continue;
				}
				if($value['severity_num'] == 1) {
					array_push($severe, $value);
				}
				else if($value['severity_num'] == 2) {
					array_push($warning, $value);
				}
				else if($value['severity_num'] == 3) {
					array_push($suggestion, $value);
				}
				if(count($value) > 0) $error++;
			}

			$final['name'] = $html['title'];
			$final['url'] = $html['url'];
			$final['amount'] = $error;
			$final['error'] = $severe;
			$final['warning'] = $warning;
			$final['suggestion'] = $suggestion;

			array_push($contentReport, $final);
		}
		return $contentReport;
	}

	// prints out the results of the scan
	if(in_array("announcements", $_POST["content"])) {
		parse_results("Announcements", $announcmentsResults);
	}

	if(in_array("assignments", $_POST["content"])) {
		parse_results("Assignments", $assignmentsResults);
	}

	if(in_array("discussions", $_POST["content"])) {
		parse_results("Discussions", $discussionsResults);
	}

	if(in_array("files", $_POST["content"])) {
		parse_results("Files", $filesResults);
	}

	if(in_array("pages", $_POST["content"])) {
		parse_results("Pages", $pagesResults);
	}

?>
<?php function parse_results($contentType, $result) { ?>
	<h3 class="content-title"><?php echo $contentType; ?></h3>
	<?php if(sizeof($result) == 0) { ?>
		<div class="alert alert-success"><span class="glyphicon glyphicon-ok"></span> No problems were detected for this type of content!</div>
	<?php } else { ?>
		<?php foreach($result as $report) { ?>
			<?php if($report['amount'] > 0) { ?>
				<div class="errorItem panel panel-default">
					<div class="panel-heading clearfix">
						<button class="btn btn-xs btn-default btn-toggle pull-left no-print margin-right-small"><span class="glyphicon glyphicon-plus"></span></button>
						<h3 class="plus pull-left"><?php echo $report['name']; ?> <small><a href="<?php echo $report['url']; ?>" class="no-print" title="Link to <?php echo $report['name']; ?>">(<?php echo $report['url']; ?>)</a></small></h3>
						<div class="btn-toolbar pull-right">
							<div class="btn-group">
								<button class="btn btn-xs btn-danger <?php if(count($report['error']) == 0) { echo 'fade '; } if(count($report['error']) < 10) { echo 'single'; } else { echo 'double'; } ?>"><span class="glyphicon glyphicon-ban-circle"></span> <?php echo count($report['error']); ?></button>
							</div>
							<div class="btn-group">
								<button class="btn btn-xs btn-warning <?php if(count($report['warning']) == 0) { echo 'fade '; } if(count($report['warning']) < 10) { echo 'single'; } else { echo 'double'; } ?>"><span class="glyphicon glyphicon-warning-sign"></span> <?php echo count($report['warning']); ?></button>
							</div>
							<div class="btn-group">
								<button class="btn btn-xs btn-primary <?php if(count($report['suggestion']) == 0) { echo 'fade '; } if(count($report['suggestion']) < 10) { echo 'single'; } else { echo 'double'; } ?>"><span class="glyphicon glyphicon-list-alt"></span> <?php echo count($report['suggestion']); ?></button>
							</div>
						</div>
					</div>
					<div class="errorSummary panel-body">
						<?php if(count($report['error']) > 0) { ?>
						<div class="panel panel-danger">
							<div class="panel-heading">
								<h4 class="panel-title">Errors (<?php echo count($report['error']); ?>)</h3>
							</div>
							<ul class="list-group">
								<?php
									foreach($report['error'] as $item) {
										echo '<li class="list-group-item">';
										echo '<div class="clearfix margin-bottom-small">';
										echo '<h5 class="error pull-left"><span class="glyphicon glyphicon-remove-sign"></span> '.$item['title'].'</h5>';
										echo '</div>';
										if(isset($item['description'])) { echo '<p>'.$item['description'].'</p>'; };
										if($item['html']) { echo '<pre><code class="html">Line '.$item['lineNo'].': '.$item['html'].'</code></pre>'; }
										echo '</li>';
									}
								?>
							</ul>
						</div>
						<?php } ?>
						<?php if(count($report['warning']) > 0) { ?>
						<div class="panel panel-warning">
							<div class="panel-heading">
								<h4 class="panel-title">Warnings (<?php echo count($report['warning']); ?>)</h3>
							</div>
							<ul class="list-group">
								<?php
									foreach($report['warning'] as $item) {
										echo '<li class="list-group-item">';
										echo '<div class="clearfix margin-bottom-small">';
										echo '<h5 class="warning"><span class="glyphicon glyphicon-warning-sign"></span> '.$item['title'].'</h5>';
										echo '</div>';
										if($item['html']) { echo '<pre><code class="html">Line '.$item['lineNo'].': '.$item['html'].'</code></pre>'; }
										echo '</li>';
									}
								?>
							</ul>
						</div>
						<?php } ?>
						<?php if(count($report['suggestion']) > 0) { ?>
						<div class="panel panel-info no-margin">
							<div class="panel-heading">
								<h4 class="panel-title">Suggestions (<?php echo count($report['suggestion']); ?>)</h3>
							</div>
							<ul class="list-group">
								<?php
									foreach($report['suggestion'] as $item) {
										echo '<li class="list-group-item">';
										echo '<div class="clearfix margin-bottom-small">';
										echo '<h5 class="suggestion"><span class="glyphicon glyphicon-list-alt"></span> '.$item['title'].'</h5>';
										echo '</div>';
										if($item['html']) { echo '<pre><code class="html">Line '.$item['lineNo'].': '.$item['html'].'</code></pre>'; }
										echo '</li>';
									}
								?>
							</ul>
						</div>
						<?php } ?>
					</div>
				</div>
			<?php } ?>
		<?php } ?>
	<?php } ?>
<?php } ?>
