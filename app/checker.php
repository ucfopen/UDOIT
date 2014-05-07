<?php	
	// if(!isset($_SESSION['loggedIn'])) {
	// 	header('Location: ../');
	// }
	include_once('config/localConfig.php');
	include_once('app/curlClass.php');

	$courseID = $_POST['id'];

	// Gets pages from the instructors course
	$pageContent = get_pages_html($base_url, $courseID, $apikey);
	$discussionContent = get_discussions_html($base_url, $courseID, $apikey);
	$announcementContent = get_announcements_html($base_url, $courseID, $apikey);
	$filesContent = get_files_html($base_url, $courseID, $apikey);

	$courseContent = array();
	array_push($courseContent, $pageContent, $discussionContent, $announcementContent, $filesContent);

	$allContent = array();

	foreach($courseContent as $courseType => $typeContent) {
		foreach($typeContent as $theContent) {
			array_push($allContent, $theContent);
		}
	}

	function get_pages_html($base_url, $courseID, $apikey){
		$pageInfo = array();
		$pageNum = 1;
		$perPage = 100;

		while(true) {
			$url = $base_url."/api/v1/courses/".$courseID."/pages?page=".$pageNum."&per_page=".$perPage."&access_token=".$apikey;
			//using Kevin's curl class
			$pages = Curl::get($url, true, null, true);

			if(sizeof($pages['response']) == 0) {
				break;
			}

			if(isset($pages['response']->status))
				error($pages['response']->status, $pages['response']->message);

			foreach($pages['response'] as $page){
				$url = $base_url."/api/v1/courses/".$courseID."/pages/".$page->url."?access_token=".$apikey;
				$wikiPage = Curl::get($url, true, null, true);

				array_push($pageInfo, array(
					'content' => $wikiPage['response']->body,
					'title' => $wikiPage['response']->title,
					'url' => $wikiPage['response']->url
					)
				);
			}
			$pageNum++;
		}
		return $pageInfo;
	}

	function get_discussions_html($base_url, $courseID, $apikey){
		$discussionsHtml = [];

		$url = $base_url."/api/v1/courses/".$courseID."/discussion_topics?&access_token=".$apikey;
		$topics = Curl::get($url, true, null, true);

		foreach($topics['response'] as $topic){
			$url = $base_url."/api/v1/courses/".$courseID."/discussion_topics/".$topic->id."?access_token=".$apikey;
			$topicOp = Curl::get($url, true, null, true);

			array_push($discussionsHtml, array(
				'content' => $topicOp['response']->message,
				'title' => $topicOp['response']->title,
				'url' => $topicOp['response']->html_url
				)
			);
		}
		return $discussionsHtml;
	}

	function get_announcements_html($base_url, $courseID, $apikey){
		$announcementsHTML = [];

		$url = $base_url."/api/v1/courses/".$courseID."/discussion_topics?&only_announcements=true&access_token=".$apikey;
		$announcements = Curl::get($url, true, null, true);

		foreach($announcements['response'] as $announcement){
			$url = $base_url."/api/v1/courses/".$courseID."/discussion_topics/".$announcement->id."?access_token=".$apikey;
			$announce = Curl::get($url, true, null, true);

			array_push($announcementsHTML, array(
				'content' => $announce['response']->message,
				'title' => $announce['response']->title,
				'url' => $announce['response']->html_url
				)
			);
		}
		return $announcementsHTML;
	}

	function get_files_html($base_url, $courseID, $apikey){
		$filesHTML = [];

		$url = $base_url."/api/v1/courses/".$courseID."/files/?content_types[]=text/html&access_token=".$apikey;
		$files = Curl::get($url, true, null, true);

		foreach($files['response'] as $file){
			array_push($filesHTML, array(
				'content' => $files['response']->message,
				'title' => $files['response']->display_name,
				'url' => $files['response']->url
				)
			);
		}
		return $filesHTML;
	}

	/**
	 * Runs through each directory and each subdirectory
	 * @param  string $dir    Directory to look through
	 * @param  array $ignore Files to ignore
	 * @return array          A array of the path to a directory and contents
	 */
	// function find_directory($dir, $ignore) {
	// 	$file_info = array();
	// 	$badFiles = array();
	// 	// Open a known directory, and proceed to read its contents
	// 	if (is_dir($dir)) {
	// 		if ($dh = opendir($dir)) {
	// 			while (($file = readdir($dh)) !== false) {
	// 				$info = pathinfo($file);
	// 				if($file != '.' && $file != '..' && $file[0] != '.' && (array_key_exists("extension", $info) && ($info['extension'] == 'html' || $info['extension'] == 'htm'))) {
	// 					array_push($file_info, array(
	// 						'path' => $dir.$file,
	// 						'text' => file_get_contents($dir . $file)
	// 						)
	// 					);
	// 				}
	// 				else if($file != '.' && $file != '..' && @filetype($dir . $file) == 'dir' && !in_array($file, $ignore)) 
	// 				{
	// 					$sub_file_info = find_directory($dir.$file."/", $ignore);
	// 					foreach($sub_file_info as $item) 
	// 					{
	// 						array_push($file_info, $item);
	// 					}
	// 				}
	// 			}
	// 			closedir($dh);
	// 		}
	// 	}
	// 	return $file_info;
	// }
	
	/**
	 * Filters a directory to find 
	 * @param  string $dir    Directory to look through
	 * @param  array  $ignore Files to ignore
	 * @return array          A array of the path to a directory and contents
	 */
	// function find_bad_files($dir) {
	// 	$badFiles = array();
	// 	// Open a known directory, and proceed to read its contents
	// 	if (is_dir($dir)) {
	// 		if ($dh = opendir($dir)) {
	// 			while (($file = readdir($dh)) !== false) {
	// 				$info = pathinfo($file);
	// 				if($file != '.' && $file != '..' && (array_key_exists("extension", $info) && ($info['extension'] == 'pdf' || $info['extension'] == 'doc' || $info['extension'] == 'docx' || $info['extension'] == 'ppt' || $info['extension'] == 'pptx')))			
	// 				{
	// 					array_push($badFiles, array(
	// 						'path' => $dir.$file,
	// 						'extension' => $info['extension'],
	// 						'filename' => $file,
	// 					));
	// 				}
	// 				else if($file != '.' && $file != '..' && @filetype($dir . $file) == 'dir') 
	// 				{
	// 					$sub_file_info = find_bad_files($dir.$file."/");
	// 					foreach($sub_file_info as $sub_item) 
	// 					{
	// 						array_push($badFiles, array(
	// 							'path' => $sub_item['path'],
	// 							'extension' => $sub_item['extension'],
	// 							'filename' => $sub_item['filename'],
	// 						));
	// 					}
	// 				}
	// 			}
	// 			closedir($dh);
	// 		}
	// 	}
	// 	return $badFiles;
	// }
	// Grab remote files here instead of this crap.
	$directory = $base;
	// /* appends each folder to the base so it knows where to start from */
	// foreach($_POST['folder'] as $folder) {
	// 	if($folder != 'default') {
	// 		$directory .= $folder."/";
	// 	}
	// }
	/* Grabs the ignores and filters them */
	// $ignore = $_POST['ignore'];
	// $result = find_directory($directory, $ignore);
	// $badFiles = find_bad_files($directory);
	// $test = $result;
	
	// $test['text'] = html of page;

	$fullReport = array();
	
	require_once('core/quail/quail.php');
	/* Runs each item in the test array through the Quail accessibility checker */
	foreach($allContent as $html) {
		$error = 0;
		$report = array();
		// var_dump($html);
		// die();
		$quail = new quail($html['content'], 'section508', 'string', 'static');
	
			
		$quail->runCheck();
		$result = $quail->getReport();
		$report = $result['report'];
		$severe = array();
		$warning = array();
		$suggestion = array();
		
		foreach($report as $value)
		{
			//  Some don't have a severity num, no clue why.
			if(!array_key_exists("severity_num", $value))
			{
				continue;
			}
			if($value['severity_num'] == 1)
			{
				array_push($severe, $value);
			}
			else if($value['severity_num'] == 2)
			{
				array_push($warning, $value);
			}
			else if($value['severity_num'] == 3)
			{
				array_push($suggestion, $value);
			}
			if(count($value) > 0) $error++;
		}
		$final['name'] = str_replace($directory, '', $html['title']);
		$final['url'] = $html['url'];
		$final['amount'] = $error;
		$final['error'] = $severe;
		$final['warning'] = $warning;
		$final['suggestion'] = $suggestion;

		array_push($fullReport, $final);
	}
	// Break at the spefied location
	// if($_POST['folder'][count($_POST['folder'])-1] == 'default')
	// {
	// 	$breakHere = $_POST['folder'][count($_POST['folder'])-2]."/";
	// }
	// else
	// {
	// 	$breakHere = $_POST['folder'][count($_POST['folder'])-1]."/";
	// }
?>

<h2 class="center">Report for <?php echo $_POST['course']; ?></h2>
<p><a href="#" id="print" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-print"></span> Print this Report</a><p>

<div id="errorWrapper">
<?php foreach($fullReport as $report) {
	if($report['amount'] > 0) { ?>
<div class="errorItem panel panel-default">
	<div class="panel-heading clearfix">
		<button class="btn btn-xs btn-default pull-left margin-right-small"><span class="glyphicon glyphicon-plus"></span></button>
		<h3 class="plus pull-left"><?php echo $report['name']; ?> <small>(<a href="<?php echo $report['url']; ?>" title="Link to <?php echo $report['name']; ?>">Link</a>)</small></h3>
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
				<h3 class="panel-title">Errors (<?php echo count($report['error']); ?>)</h3>
			</div>
			<ul class="list-group no_print">
				<?php
					foreach($report['error'] as $item)
					{
						echo '<li class="list-group-item">';
						echo '<div class="clearfix margin-bottom-small">';
						echo '<h5 class="error pull-left"><span class="glyphicon glyphicon-remove-sign"></span> '.$item['title'].'</h5>';
						echo '</div>';
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
				<h3 class="panel-title">Warnings (<?php echo count($report['warning']); ?>)</h3>
			</div>
			<ul class="list-group no_print">
				<?php
					foreach($report['warning'] as $item)
					{
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
				<h3 class="panel-title">Suggestions (<?php echo count($report['suggestion']); ?>)</h3>
			</div>
			<ul class="list-group no_print">
				<?php
					foreach($report['suggestion'] as $item)
					{
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
<?php } #end if $report[amount]
} # End foreach ?>
