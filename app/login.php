
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>

<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>Mal - Document Accessibility Checker</title>
<link rel="icon" type="image/png" href="favicon.ico">
<link href='http://fonts.googleapis.com/css?family=Sonsie+One' rel='stylesheet' type='text/css'>
<link href="assets/css/main.css" type="text/css" rel="stylesheet" />
</head>

<body>
<?php require_once('header.php');
 if(isset($_GET['error'])) { ?>
	<p><?php echo $_GET['error']; ?></p>
<?php } ?>
<form action="?page=verify" method="post" id="loginForm">
<h2 class="center">Login</h2>
<p><label for="user">Username:</label> <input type="text" name="nidLoginName" id="user" /></p>
<p><label for="pass">Password:</label> <input type="password" name="nidPassword" id="pass" /></p>
<p id="loginSubmit"><input type="submit" name="submit" value="Login" /></p>
</form>
</body>
</html>