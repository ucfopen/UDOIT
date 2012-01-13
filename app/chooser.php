<?php
	include_once('config/localConfig.php');
	$dir = $base;
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
<link href="assets/css/main.css" type="text/css" rel="stylesheet" />
<script src="http://code.jquery.com/jquery-latest.js"></script>
<script type="text/javascript" src="assets/js/chooser.js"></script>
</head>

<body>
<?php require_once('header.php'); ?>
<form method="post" action="./?page=checker">
<p>Ignore the following folders/files</p>
<ul class="nobullet">
	<li><input type="checkbox" name="ignore[]" value="_notes" checked="checked" /> _notes</li>
	<li><input type="checkbox" name="ignore[]" value="_notes" checked="checked" /> Imported_Resources</li>
	<li><input type="text" name="ignore[]" /> <a href="#" class="add">Add Another Item</a></li>
</ul>
<p>Choose your Folder: 
<select name="folder[]" class="folder">
	<option value="default">-- Select a folder --</option>
	<?php foreach($folders as $folder) { ?>
	<option value="<?php echo $folder; ?>"><?php echo $folder; ?></option>
	<?php } #end foreach $folders ?>
</select></p>
<p><input type="submit" name="course_submit" id="submit" value="Run Checker" /></p>
</form>
</body>
</html>