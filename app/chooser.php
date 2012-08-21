<?php
	include_once('config/localConfig.php');
	$dir = $base;
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

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>Choose a Class</title>
<link rel="icon" type="image/png" href="favicon.ico">
<link href='https://fonts.googleapis.com/css?family=Sonsie+One' rel='stylesheet' type='text/css'>
<link href="assets/css/main.css" type="text/css" rel="stylesheet" media="screen"  />
<link href="assets/css/print.css" type="text/css" rel="stylesheet" media="print"/>
<script src="https://code.jquery.com/jquery-1.7.2.js"></script>
<script type="text/javascript" src="assets/js/default.js"></script>
<script type="text/javascript" src="assets/js/chooser.js"></script>
</head>

<body>
<?php require_once('header.php'); ?>
<div id="bodyWrapper">
	<div id="chooserWrapper">
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
		</select></li>
		<li><input type="submit" name="course_submit" id="submit" value="Run Checker" /></li>
		</ul>
		</form>
	</div>
</div>
</body>
</html>