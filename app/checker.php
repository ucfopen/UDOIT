<?php
	include_once('../config/localConfig.php');
	include_once('curlClass.php');
	require_once('../core/quail/quail.php');

	session_start();
	// print_r($_SESSION);

	$course_id = $_SESSION['launch_params']['custom_canvas_course_id'];
	$api_key = $_SESSION['api_key'];

	// because we can't scan what isn't selected
	if($_POST['content'] == 'none') {
		echo "<div class=\"alert alert-danger no-margin margin-top\"><span class=\"glyphicon glyphicon-exclamation-sign\"></span> Please select which course content you wish to scan above.</div>";
		exit();
	}

	session_write_close();
?>
<h1 class="center">Report for <?= $_SESSION['launch_params']['context_title'] ?></h1>

<p><a href="#" id="print" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-save"></span> Save report as PDF</a><p>

<div id="errorWrapper">
<?php
	if(in_array("announcements", $_POST["content"])) {
		$_SESSION["progress"] = 1;

		$assignmentsResults = [];

		$courseAnnouncements = get_course_content("Announcements", $base_url, $course_id, $api_key);

		foreach($courseAnnouncements['items'] as $r) {
			if($r['amount'] != 0)
				array_push($assignmentsResults, $r);
		}

		$courseAnnouncements['items'] = $assignmentsResults;

		parse_results("Announcements", $courseAnnouncements);
	}


	if(in_array("assignments", $_POST["content"])) {
		$_SESSION["progress"] = 2;

		$assignmentsResults = [];

		$courseAssignments = get_course_content("Assignments", $base_url, $course_id, $api_key);

		foreach($courseAssignments['items'] as $r) {
			if($r['amount'] != 0)
				array_push($assignmentsResults, $r);
		}

		$courseAssignments['items'] = $assignmentsResults;

		parse_results("Assignments", $courseAssignments);
	}

	if(in_array("discussions", $_POST["content"])) {
		$_SESSION["progress"] = 3;

		$discussionsResults = [];

		$courseDiscussions = get_course_content("Discussions", $base_url, $course_id, $api_key);

		foreach($courseDiscussions['items'] as $r) {
			if($r['amount'] != 0)
				array_push($discussionsResults, $r);
		}

		$courseDiscussions['items'] = $discussionsResults;

		parse_results("Discussions", $courseDiscussions);
	}

	if(in_array("files", $_POST["content"])) {
		$_SESSION["progress"] = 4;

		$filesResults = [];

		$courseFiles = get_course_content("Files", $base_url, $course_id, $api_key);

		foreach($courseFiles['items'] as $r) {
			if($r['amount'] != 0)
				array_push($filesResults, $r);
		}

		$courseFiles['items'] = $filesResults;

		parse_results("Files", $courseFiles);
	}

	if(in_array("pages", $_POST["content"])) {
		$_SESSION["progress"] = 5;

		$pagesResults = [];

		$coursePages = get_course_content("Pages", $base_url, $course_id, $api_key);

		foreach($coursePages['items'] as $r) {
			if($r['amount'] != 0)
				array_push($pagesResults, $r);
		}

		$coursePages['items'] = $pagesResults;

		parse_results("Pages", $coursePages);
	}

	// so the ajax call knows we're done
	$_SESSION["progress"] = "done";

	// this scans the course
	function get_course_content($content_type, $base_url, $course_id, $api_key) {
		$content_result = [
			'items' => [],
			'amount' => 0,
			'time' => microtime(true),
		];

		//TODO:  Check for pagination issues
		if($content_type == "Announcements") {
			$url = $base_url."/api/v1/courses/".$course_id."/discussion_topics?&only_announcements=true&access_token=".$api_key;
			$announcements = Curl::get($url, true, null, true);

			foreach($announcements['response'] as $announcement) {
				$url = $base_url."/api/v1/courses/".$course_id."/discussion_topics/".$announcement->id."?access_token=".$api_key;
				$announce = Curl::get($url, true, null, true);

				array_push($content_result['items'], array(
					'id' => $announce['response']->id,
					'content' => $announce['response']->message,
					'title' => $announce['response']->title,
					'url' => $announce['response']->html_url
					)
				);
			}
		}

		//TODO:  Check for pagination issues
		if($content_type == "Assignments") {
			$url = $base_url."/api/v1/courses/".$course_id."/assignments?&access_token=".$api_key;
			$assignments = Curl::get($url, true, null, true);

			foreach($assignments['response'] as $assignment) {
				$url = $base_url."/api/v1/courses/".$course_id."/assignments/".$assignment->id."?access_token=".$api_key;
				$assign = Curl::get($url, true, null, true);

				array_push($content_result['items'], array(
					'id' => $assign['response']->id,
					'content' => $assign['response']->description,
					'title' => $assign['response']->name,
					'url' => $assign['response']->html_url
					)
				);
			}
		}

		//TODO:  Check for pagination issues
		if($content_type == "Discussions") {
			$url = $base_url."/api/v1/courses/".$course_id."/discussion_topics?&access_token=".$api_key;
			$topics = Curl::get($url, true, null, true);

			foreach($topics['response'] as $topic) {
				$url = $base_url."/api/v1/courses/".$course_id."/discussion_topics/".$topic->id."?access_token=".$api_key;
				$topicOp = Curl::get($url, true, null, true);

				array_push($content_result['items'], array(
					'id' => $topicOp['response']->id,
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

			// Is anyone really going to have more than 10,000 files? I thought not.
			while($page_num < 100) {
				$url = $base_url."/api/v1/courses/".$course_id."/files?page=".$page_num."&per_page=".$per_page."&content_types[]=text/html&access_token=".$api_key;
				$files = Curl::get($url, true, null, true);

				// sizeof can return 0 for a variable that isn't set, so we check if the variable is set and not null
				if( (sizeof($files['response']) == 0) || !isset($files['response']) || is_null($files['response'])) {
					break;
				}

				if( isset($files['response']->errors) ){
					echo $files['response']->errors[0]->message . '(' . $files['response']->errors[0]->error_code . ')';
					break;
				}

				foreach($files['response'] as $file) {
					//don't capture them mac files, ._
					$mac_check = (substr($file->display_name, 0, 2));
					if($mac_check != "._") {
						array_push($content_result['items'], array(
							'id' => $file->id,
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
			$page_num = 1;
			$per_page = 100;

			// Is anyone really going to have more than 10,000 pages?  I thought not.
			while($page_num < 100) {
				$url = $base_url."/api/v1/courses/".$course_id."/pages?page=".$page_num."&per_page=".$per_page."&access_token=".$api_key;
				//using Kevin's curl class
				$pages = Curl::get($url, true, null, true);
				
				// sizeof can return 0 for a variable that isn't set, so we check if the variable is set and not null
				if( (sizeof($pages['response']) == 0) || !isset($pages['response']) || is_null($pages['response']) ) {
					break;
				}

				if( isset($pages['response']->errors) ){
					echo $pages['response']->errors[0]->message . '(' . $pages['response']->errors[0]->error_code . ')';
					break;
				}

				if(isset($pages['response']->status)) {
					error($pages['response']->status, $pages['response']->message);
				}

				foreach($pages['response'] as $page) {
					$url = $base_url."/api/v1/courses/".$course_id."/pages/".$page->url."?access_token=".$api_key;
					$wiki_page = Curl::get($url, true, null, true);

					array_push($content_result['items'], array(
						'id' => $wiki_page['response']->url,
						'content' => $wiki_page['response']->body,
						'title' => $wiki_page['response']->title,
						'url' => $base_url."/courses/".$course_id."/wiki/".$wiki_page['response']->url
						)
					);
				}

				$page_num++;
			}
		}

		$time_end = microtime(true);

		$content_result['items'] = generate_report($content_result['items']);
		$content_result['amount'] = count($content_result['items']);
		$content_result['time'] = round($time_end - $content_result['time'], 2);

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
			$report = [];
			$quail = new quail($html['content'], 'section508', 'string', 'static');

			$quail->runCheck();
			$result = $quail->getReport();
			$report = $result['report'];
			$severe = [];
			$warning = [];
			$suggestion = [];


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

			$final['id'] = $html['id'];
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
?>
<?php function parse_results($contentType, $result) { ?>
	<h2 class="content-title"><?= $contentType; ?> <small><?= count($result['items']) ?> results from <?= $result['amount'] ?> items in <?= $result['time'] ?> seconds</small></h2>
	<?php if(!$result['items']): ?>
		<div class="alert alert-success"><span class="glyphicon glyphicon-ok"></span> No problems were detected for this type of content!</div>
	<?php else: ?>
		<?php foreach($result['items'] as $report): ?>
			<?php if($report['amount'] > 0): ?>
				<div class="errorItem panel panel-default">
					<div class="panel-heading clearfix">
						<button class="btn btn-xs btn-default btn-toggle pull-left no-print margin-right-small"><span class="glyphicon glyphicon-plus"></span></button>

						<h3 class="plus pull-left"><?= $report['name']; ?> <small><a href="<?= $report['url']; ?>" class="no-print" title="Link to <?= $report['name']; ?>">(<?= $report['url']; ?>)</a></small></h3>

						<div class="pull-right">
							<span class="label label-danger <?php if(count($report['error']) == 0) { echo 'fade '; } if(count($report['error']) < 10) { echo 'single'; } else { echo 'double'; } ?>"><span class="glyphicon glyphicon-ban-circle"></span> <?= count($report['error']); ?></span>
							<span class="label label-warning <?php if(count($report['warning']) == 0) { echo 'fade '; } if(count($report['warning']) < 10) { echo 'single'; } else { echo 'double'; } ?>"><span class="glyphicon glyphicon-warning-sign"></span> <?= count($report['warning']); ?></span>
							<span class="label label-primary <?php if(count($report['suggestion']) == 0) { echo 'fade '; } if(count($report['suggestion']) < 10) { echo 'single'; } else { echo 'double'; } ?>"><span class="glyphicon glyphicon-list-alt"></span> <?= count($report['suggestion']); ?></span>
						</div>
					</div>

					<div class="errorSummary panel-body">
						<?php if(count($report['error']) > 0): ?>
							<div class="panel panel-danger">
								<div class="panel-heading">
									<h4 class="panel-title">Errors (<?= count($report['error']); ?>)</h4>
								</div>

								<ul class="list-group">
									<?php foreach($report['error'] as $item): ?>
										<li class="list-group-item">
											<div class="clearfix margin-bottom-small">
												<h5 class="error pull-left"><span class="glyphicon glyphicon-remove-sign"></span> <?= $item['title']; ?></h5>
											</div>

											<? if(isset($item['description'])): ?>
												<p><?= $item['description'] ?></p>
											<? endif; ?>

											<? if($item['html']): ?>
												<pre><code class="html"><strong>Line <?= $item['lineNo']; ?></strong>: <?= $item['html']; ?></code></pre>
											<? endif; ?>

											<? if($item['type'] = "cssTextHasContrast" || $item['type'] = "imgHasAlt" || $item['type'] = "tableDataShouldHaveTh" || $item['type'] = "tableThShouldHaveScope"): ?>
												<button class="fix-this btn btn-success">U FIX IT!</button>

												<form action="app/contentUpdater.php" method="post" class="form-horizontal hidden" role="form">
													<input type="hidden" name="contentid" value="<?= $report['id'] ?>">

													<div class="input-group">
														<input type="text" name="newcontent" class="form-control" placeholder="New value">
														<span class="input-group-btn">
															<button class="submit-content btn btn-default" type="submit">Submit</button>
														</span>
													</div><!-- /input-group -->
												</form>
											<? endif; ?>
										</li>
									<?php endforeach; ?>
								</ul>
							</div>
						<?php endif; ?>

						<?php if(count($report['warning']) > 0): ?>
							<div class="panel panel-warning">
								<div class="panel-heading">
									<h4 class="panel-title">Warnings (<?= count($report['warning']); ?>)</h4>
								</div>

								<ul class="list-group">
									<?php foreach($report['warning'] as $item): ?>
										<li class="list-group-item">
											<div class="clearfix margin-bottom-small">
												<h5 class="warning pull-left"><span class="glyphicon glyphicon-remove-sign"></span> <?= $item['title']; ?></h5>
											</div>

											<? if(isset($item['description'])): ?>
												<p><?= $item['description'] ?></p>
											<? endif; ?>

											<? if($item['html']): ?>
												<pre><code class="html"><strong>Line <?= $item['lineNo']; ?></strong>: <?= $item['html']; ?></code></pre>
											<? endif; ?>
										</li>
									<?php endforeach; ?>
								</ul>
							</div>
						<?php endif; ?>

						<?php if(count($report['suggestion']) > 0): ?>
							<div class="panel panel-info no-margin">
								<div class="panel-heading">
									<h4 class="panel-title">Suggestions (<?= count($report['suggestion']); ?>)</h4>
								</div>

								<ul class="list-group">
									<?php foreach($report['suggestion'] as $item): ?>
										<li class="list-group-item">
											<div class="clearfix margin-bottom-small">
												<h5 class="suggestion pull-left"><span class="glyphicon glyphicon-remove-sign"></span> <?= $item['title']; ?></h5>
											</div>

											<? if(isset($item['description'])): ?>
												<p><?= $item['description'] ?></p>
											<? endif; ?>

											<? if($item['html']): ?>
												<pre><code class="html"><strong>Line <?= $item['lineNo']; ?></strong>: <?= $item['html']; ?></code></pre>
											<? endif; ?>
										</li>
									<?php endforeach; ?>
								</ul>
							</div>
						<?php endif; ?>
					</div>
				</div>
			<?php endif; ?>
		<?php endforeach; ?>
	<?php endif; ?>
<?php } //end of function

	function strip_non_errors($items) {
		$stripped_items = [];

		foreach(generate_report($items) as $i) {
			if($i['amount'] != 0)
				array_push($stipped_items, $i);
		}

		return $stripped_items;
	}

?>
