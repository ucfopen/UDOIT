<?php

session_start();

// If they're trying to get to a certain page, let them
if(isset($_GET['page'])) {
	include_once('app/'.$_GET['page'].'.php');
}

// If they're accessing the index, go to the chooser if they're logged in
else {
	include_once('app/chooser.php');
}
?>
