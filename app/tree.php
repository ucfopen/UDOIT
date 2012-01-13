<?php
	include_once('config/localConfig.php');
	$dir = $base.$_POST['folder'].'/';
	$folders = array();
		if (is_dir($dir)) {
			if ($dh = opendir($dir)) {
				while (($file = readdir($dh)) !== false) {
					$info = pathinfo($file);
					if($file != '.' && $file != '..' && $file[0] != '.' && @filetype($dir . $file) == 'dir') {
						if(!in_array($info['filename'], $ignore)) { 
							array_push($folders, $info['filename']);
						}
					}
				}
				closedir($dh);
			}
		}

	sort($folders);
	
	echo json_encode($folders);
?>