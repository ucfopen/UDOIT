<?php	
	if(!isset($_SESSION['loggedIn'])) {
		header('Location: ../');
	}
	include_once('config/localConfig.php');
	/**
	 * Runs through each directory and each subdirectory
	 * @param  string $dir    Directory to look through
	 * @param  array $ignore Files to ignore
	 * @return array          A array of the path to a directory and contents
	 */
	function find_directory($dir, $ignore) {
		$file_info = array();
		$badFiles = array();
		// Open a known directory, and proceed to read its contents
		if (is_dir($dir)) {
			if ($dh = opendir($dir)) {
				while (($file = readdir($dh)) !== false) {
					$info = pathinfo($file);
					if($file != '.' && $file != '..' && $file[0] != '.' && (array_key_exists("extension", $info) && ($info['extension'] == 'html' || $info['extension'] == 'htm'))) {
						array_push($file_info, array(
							'path' => $dir.$file,
							'text' => file_get_contents($dir . $file)
							)
						);
					}
					else if($file != '.' && $file != '..' && @filetype($dir . $file) == 'dir' && !in_array($file, $ignore)) 
					{
						$sub_file_info = find_directory($dir.$file."/", $ignore);
						foreach($sub_file_info as $item) 
						{
							array_push($file_info, $item);
						}
					}
				}
				closedir($dh);
			}
		}
		return $file_info;
	}
	
	/**
	 * Filters a directory to find 
	 * @param  string $dir    Directory to look through
	 * @param  array  $ignore Files to ignore
	 * @return array          A array of the path to a directory and contents
	 */
	function find_bad_files($dir, $ignore) {
		$badFiles = array();
		// Open a known directory, and proceed to read its contents
		if (is_dir($dir)) {
			if ($dh = opendir($dir)) {
				while (($file = readdir($dh)) !== false) {
					$info = pathinfo($file);
					if($file != '.' && $file != '..' && (array_key_exists("extension", $info) && ($info['extension'] == 'pdf' || $info['extension'] == 'doc' || $info['extension'] == 'docx' || $info['extension'] == 'ppt' || $info['extension'] == 'pptx')))			
					{
						array_push($badFiles, array(
							'path' => $dir.$file,
							'extension' => $info['extension'],
							'filename' => $file,
						));
					}
					else if($file != '.' && $file != '..' && @filetype($dir . $file) == 'dir' && !in_array($file, $ignore)) 
					{
						$sub_file_info = find_bad_files($dir.$file."/", $ignore);
						foreach($sub_file_info as $sub_item) 
						{
							array_push($badFiles, array(
								'path' => $sub_item['path'],
								'extension' => $sub_item['extension'],
								'filename' => $sub_item['filename'],
							));
						}
					}
				}
				closedir($dh);
			}
		}
		return $badFiles;
	}

	$directory = $base;
	/* appends each folder to the base so it knows where to start from */
	foreach($_POST['folder'] as $folder) {
		if($folder != 'default') {
			$directory .= $folder."/";
		}
	}
	/* Grabs the ignores and filters them */
	$ignore = $_POST['ignore'];
	$result = find_directory($directory, $ignore);
	$badFiles = find_bad_files($directory, $ignore);
	$test = $result;
	
	$fullReport = array();
	
	require_once('core/quail/quail.php');
	/* Runs each item in the test array through the Quail accessibility checker */
	foreach($test as $html) {
		$error = 0;
		$report = array();
		$quail = new quail($html['text'], 'section508', 'string', 'static');
	
			
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
		$final['path'] = str_replace($directory, '', $html['path']);
		$final['amount'] = $error;
		$final['error'] = $severe;
		$final['warning'] = $warning;
		$final['suggestion'] = $suggestion;

		array_push($fullReport, $final);
	}
	// Break at the spefied location
	if($_POST['folder'][count($_POST['folder'])-1] == 'default')
	{
		$breakHere = $_POST['folder'][count($_POST['folder'])-2]."/";
	}
	else
	{
		$breakHere = $_POST['folder'][count($_POST['folder'])-1]."/";
	}
?>

<h2>Report for courses/<?php echo str_replace($base, '', $directory); ?></h2>
<p><a href="#" id="print">Print this Report</a><p>

<div id="errorWrapper">
<?php foreach($fullReport as $report) {
	if($report['amount'] > 0) { ?>
<div class="errorItem">
	<h3 class="plus"><?php echo $report['path']; ?></h3>
	<ul>
		<li class="errorCount <?php if(count($report['error']) == 0) { echo 'fade '; } if(count($report['error']) < 10) { echo 'single'; } else { echo 'double'; } ?>"><?php echo count($report['error']); ?></li>
		<li class="warningCount <?php if(count($report['warning']) == 0) { echo 'fade '; } if(count($report['warning']) < 10) { echo 'single'; } else { echo 'double'; } ?>"><?php echo count($report['warning']); ?></li>
		<li class="suggestionCount <?php if(count($report['suggestion']) == 0) { echo 'fade '; } if(count($report['suggestion']) < 10) { echo 'single'; } else { echo 'double'; } ?>"><?php echo count($report['suggestion']); ?></li>
	</ul>
</div>
<ul class="inline no_print">
	<li><a href="#" class="delete_parent">Delete</a></li>
</ul>
<div class="errorSummary">

<?php if(count($report['error']) > 0) { ?><h4>Errors</h4>
<div class="list">
<?php
	foreach($report['error'] as $item)
	{
		echo '<h5 class="error">'.$item['title'].'</h5>';	
		echo '<ul class="inline no_print">';
		echo '<li><a href="#" class="delete_parent">Delete</a></li>';
		echo '</ul>';
		echo '<ul>';
		if($item['html']) { echo '<li>Line '.$item['lineNo'].': '.$item['html'].'</li>'; };	
		echo '</ul>';
	}
?>
</div>
<?php } ?>
<?php if(count($report['warning']) > 0) { ?><h4>Warnings</h4>
<div class="list">
<?php
	foreach($report['warning'] as $item)
	{
		echo '<h5 class="warning">'.$item['title'].'</h5>';		
		echo '<ul class="inline no_print">';
		echo '<li><a href="#" class="delete_parent">Delete</a></li>';
		echo '</ul>';
		echo '<ul>';
		if($item['html']) { echo '<li>Line '.$item['lineNo'].': '.$item['html'].'</li>'; };	
		echo '</ul>';
	}
?>
</div>
<?php } ?>
<?php if(count($report['suggestion']) > 0) { ?><h4>Suggestions</h4>
<div class="list">
<?php
	foreach($report['suggestion'] as $item)
	{
		echo '<h5 class="suggestion">'.$item['title'].'</h5>';		
		echo '<ul class="inline no_print">';
		echo '<li><a href="#" class="delete_parent">Delete</a></li>';
		echo '</ul>';
		echo '<ul>';
		if($item['html']) { echo '<li>Line '.$item['lineNo'].': '.$item['html'].'</li>'; };	
		echo '</ul>';
	} ?>
</div>
<?php } ?>
</div>

<?php } #end if $report[amount]
}# End foreach ?>
<?php if(count($badFiles) > 0) {?>
<div class="errorItem">
	<h3 class="plus">The Following Files May Contain Accessibility Issues</h3>
	<ul>
		<li class="errorCount fade single">0</li>
		<li class="warningCount <?php if(count($badFiles) < 10) { echo 'single'; } else { echo 'double'; } ?>"><?php echo count($badFiles); ?></li>
		<li class="suggestionCount fade single">0</li>
	</ul>
</div>
<ul class="inline no_print">
	<li><a href="#" class="delete_parent">Delete</a></li>
</ul>
<div class="errorSummary">
<h4>Warnings</h4>
	<p>The following files were unable to be checked for accessiblity issues by Mal:
	<?php 
		$docs = array();
		$pdfs = array();
		$ppts = array();
		foreach($badFiles as $badFile) { 
			if($badFile['extension'] == 'doc' || $badFile['extension'] == 'docx') {
				$docs[] = $badFile;
			}
			else if($badFile['extension'] == 'pdf') {
				$pdfs[] = $badFile;
			}
			else if($badFile['extension'] == 'ppt' || $badFile['extension'] == 'pptx') {
				$ppts[] = $badFile;
			}
		} // end foreach ?>
	<?php if(count($docs > 0)) { ?>
	<div class="list">
		<h5 class="warning">Word Documents (.doc and .docx)</h5>
		<ul class="inline no_print">
			<li><a href="#" class="delete_h5">Delete</a></li>
		</ul>
		<ul class="li_border">
			<?php foreach($docs as $doc) { 
				$path = explode($breakHere,$doc['path']);
			?>
			<li><?php echo end($path); ?> <a href="#" class="delete_li">Delete</a></li>
			<?php } ?>
		</ul>
	</div>
	<?php } #end if
	if(count($pdfs > 0)) { ?>
	<div class="list">
		<h5 class="warning">PDF Documents</h5>
		<ul class="inline no_print">
			<li><a href="#" class="delete_h5">Delete</a></li>
		</ul>
		<ul class="li_border">
			<?php foreach($pdfs as $pdf) { 
				$path = explode($breakHere,$pdf['path']);
			?>
			<li><?php echo end($path); ?> <a href="#" class="delete_li">Delete</a></li>
			<?php } ?>
		</ul>
	</div>
	<?php } #end if
	if(count($ppts > 0)) { ?>
	<div class="list">
		<h5 class="warning">Powerpoint Documents</h5>
		<ul class="inline no_print">
			<li><a href="#" class="delete_h5">Delete</a></li>
		</ul>
		<ul class="li_border">
			<?php foreach($ppts as $ppt) { 
				$path = explode($breakHere,$ppt['path']);
			?>
			<li><?php echo end($path); ?> <a href="#" class="delete_li">Delete</a></li>
			<?php } ?>
		</ul>
	</div>
	<?php } #end if ?>
</div>

</div>

<?	} ?>
