<?php	
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

	$ignore = array('Imported_Resources');
	$test = find_directory("../example/Webcourses/", $ignore);
	
	$fullReport = array();
	
	require_once('../lib/quail/quail/quail.php');
	
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
		$final['path'] = $html['path'];
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
			<title>Quail Doc</title>
			<style type="text/css">
			h2 {
				cursor: pointer;
			}
			.plus:before {
				content: "+ ";
			}
			.minus:before {
				content: "- ";
			}
			.severe, .warning, .suggestion {
				margin-left: 10px;
				padding-left: 28px;
				padding-top: 3px;
				min-height: 24px;
			}
			.severe {
				background: url('img/error.png') left top no-repeat;
			}
			.warning {
				background: url('img/warning.png') left top no-repeat;
			}
			.suggestion {
				background: url('img/suggestion.png') left top no-repeat;
			}
			ul {
				margin-left: 30px;
			}
			div {
				overflow: auto;
			}
			</style>
			<script src="http://code.jquery.com/jquery-latest.js"></script>
			<script type="text/javascript">
			$(document).ready(function() {
				$('h2').next().hide();
				$('h2').click(function() {
					var h2 = $(this)
					if ($(this).next().is(':visible')) {
						$(this).next().slideUp(function() {h2.removeClass('minus').addClass('plus');});
					}
					else {
						h2.removeClass('plus').addClass('minus');
						$(this).next().slideDown();
					}
				});
				
			});
			
			</script>
		</head>
		<body>

<h1>Results</h1>

<p>The following pages have errors.</p>

<?php foreach($fullReport as $report) {
	if($report['amount'] > 0) {
	
	 ?>
<h2 class="plus"><?php echo $report['path']; ?></h2>
<div>
<p>There were <?php echo $report['amount'] ?> issues found.</p>


<?php if(count($report['error']) > 0) { ?><h3>Errors</h3><?php } ?>
<?php
	foreach($report['error'] as $item)
	{
		echo '<h4 class="severe">'.$item['title'].'</h4>';	
		echo '<ul>';
		if($item['html']) { echo '<li>Line '.$item['lineNo'].': '.$item['html'].'</li>'; };	
		echo '</ul>';	
	}
?>

<?php if(count($report['warning']) > 0) { ?><h3>Warnings</h3><?php } ?>
<?php
	foreach($report['warning'] as $item)
	{
		echo '<h4 class="warning">'.$item['title'].'</h4>';		
		echo '<ul>';
		if($item['html']) { echo '<li>Line '.$item['lineNo'].': '.$item['html'].'</li>'; };	
		echo '</ul>';
	}
?>

<?php if(count($report['suggestion']) > 0) { ?><h3>Suggestions</h3><?php } ?>
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

 
