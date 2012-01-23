<?php
	include_once('config/localConfig.php');
	/* Runs through the desired driectory and returns how many items will be tested */
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

	echo count(find_directory($directory, $ignore));


?>