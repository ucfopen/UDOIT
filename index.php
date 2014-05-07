<?php

session_start();

// If they're trying to get to a certain page, let them
if(isset($_GET['page'])) {
	include_once('app/'.$_GET['page'].'.php');
}
else {
	include_once('app/chooser.php');
}

?>
