<?php	
	if(!isset($_SESSION['loggedIn'])) {
		header('Location: ../');
	}
	include_once('config/localConfig.php');
	function find_directory($dir, $ignore) {
		$file_info = array();
		// Open a known directory, and proceed to read its contents
		if (is_dir($dir)) {
			if ($dh = opendir($dir)) {
				while (($file = readdir($dh)) !== false) {
					$info = pathinfo($file);
					if($file != '.' && $file != '..' && $file[0] != '.' && ($info['extension'] == 'html' || $info['extension'] == 'htm')) {
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
	
	$directory = $base;
	foreach($_POST['folder'] as $folder) {
		if($folder != 'default') {
			$directory .= $folder."/";
		}
	}
	$ignore = $_POST['ignore'];
	$test = find_directory($directory, $ignore);
	
	$fullReport = array();
	
	require_once('core/quail/quail.php');
	
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
?>

<h2>Report for courses/<?php echo str_replace($base, '', $directory); ?></h2>

<p>The following pages have errors. </p>

<div id="errorWrapper">
<?php foreach($fullReport as $report) {
	if($report['amount'] > 0) { ?>
<div class="errorItem">
	<h3 class="plus"><?php echo $report['path']; ?></h3>
	<ul>
		<?php if(count($report['error']) > 0) { ?>
		<li class="errorCount <?php if(count($report['error']) < 10) { echo 'single'; } else { echo 'double'; } ?>"><?php echo count($report['error']); ?></li>
		<?php }
		if(count($report['warning']) > 0) { ?>
		<li class="warningCount <?php if(count($report['warning']) < 10) { echo 'single'; } else { echo 'double'; } ?>"><?php echo count($report['warning']); ?></li>
		<?php }
		if(count($report['suggestion']) > 0) { ?>
		<li class="suggestionCount <?php if(count($report['suggestion']) < 10) { echo 'single'; } else { echo 'double'; } ?>"><?php echo count($report['suggestion']); ?></li>
		<?php } ?>
	</ul>
</div>
<div class="errorSummary">

<?php if(count($report['error']) > 0) { ?><h4>Errors</h4><?php } ?>
<?php
	foreach($report['error'] as $item)
	{
		echo '<h5 class="severe">'.$item['title'].'</h5>';	
		echo '<ul>';
		if($item['html']) { echo '<li>Line '.$item['lineNo'].': '.$item['html'].'</li>'; };	
		echo '</ul>';
	}
?>

<?php if(count($report['warning']) > 0) { ?><h4>Warnings</h4><?php } ?>
<?php
	foreach($report['warning'] as $item)
	{
		echo '<h5 class="warning">'.$item['title'].'</h5>';		
		echo '<ul>';
		if($item['html']) { echo '<li>Line '.$item['lineNo'].': '.$item['html'].'</li>'; };	
		echo '</ul>';
	}
?>

<?php if(count($report['suggestion']) > 0) { ?><h4>Suggestions</h4><?php } ?>
<?php
	foreach($report['suggestion'] as $item)
	{
		echo '<h5 class="suggestion">'.$item['title'].'</h5>';		
		echo '<ul>';
		if($item['html']) { echo '<li>Line '.$item['lineNo'].': '.$item['html'].'</li>'; };	
		echo '</ul>';
	} ?>
</div>

<?php } #end if $report[amount]
}# End foreach ?>
</div>
