<?php
	session_start();
	echo $_SESSION["progress"] != '0' ? $_SESSION["progress"] : '0';
	session_write_close();
?>
