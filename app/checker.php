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
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
	<html>
		<head>
			<title>Results</title>
			<link href="assets/css/main.css" type="text/css" rel="stylesheet" />
			<script src="http://code.jquery.com/jquery-latest.js"></script>
			<script type="text/javascript" src="assets/js/script.js"></script>
		</head>
		<body>

<?php require_once('header.php'); ?>

<h2>Report for <?php echo str_replace($base, '', $directory); ?></h2>

<p>The following pages have errors. <a href="./">Run another report.</a></p>

<?php foreach($fullReport as $report) {
	if($report['amount'] > 0) {
	
	 ?>
<h3 class="plus"><?php echo "(".$report['amount'].") ".$report['path']; ?></h3>
<div>

<?php if(count($report['error']) > 0) { ?><h4>Errors</h4><?php } ?>
<?php
	foreach($report['error'] as $item)
	{
		echo '<h4 class="severe">'.$item['title'].'</h4>';	
		echo '<ul>';
		if($item['html']) { echo '<li>Line '.$item['lineNo'].': '.$item['html'].'</li>'; };	
		echo '</ul>';	
	}
?>

<?php if(count($report['warning']) > 0) { ?><h4>Warnings</h4><?php } ?>
<?php
	foreach($report['warning'] as $item)
	{
		echo '<h4 class="warning">'.$item['title'].'</h4>';		
		echo '<ul>';
		if($item['html']) { echo '<li>Line '.$item['lineNo'].': '.$item['html'].'</li>'; };	
		echo '</ul>';
	}
?>

<?php if(count($report['suggestion']) > 0) { ?><h4>Suggestions</h4><?php } ?>
<?php
	foreach($report['suggestion'] as $item)
	{
		echo '<h4 class="suggestion">'.$item['title'].'</h4>';		
		echo '<ul>';
		if($item['html']) { echo '<li>Line '.$item['lineNo'].': '.$item['html'].'</li>'; };	
		echo '</ul>';
	} ?>
</div>

<?php } #end if $report[amount]
}# End foreach ?>
</body>
</html>

 
