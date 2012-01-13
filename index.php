<?php

session_start();

if(isset($_GET['page'])) {
	include_once('app/'.$_GET['page'].'.php');
}
else if(isset($_SESSION['loggedIn'])) {
	include_once('app/chooser.php');
}
else {
	include_once('app/login.php');
}

?>