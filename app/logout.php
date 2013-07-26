<?php 

// Logs the user out.

session_start();
session_destroy();
header('Location: ./');

?>