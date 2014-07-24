<?php
include_once('config/localConfig.php');
include_once('app/curlClass.php');
session_start();

function printError($msg){
	echo '
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title>UDOIT Accessibility Checker</title>
		<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css" />
		<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap-theme.min.css" />
	</head>
	<body>
		<div style="padding: 12px;">
			<div class="alert alert-danger">
				<span class="glyphicon glyphicon-exclamation-sign"></span> '.$msg.'
			</div>
		</div>
	</body>
</html>
	';
	die();
}

if( isset($_GET['code']) ){
	//Exchange code for API key
	$url = $base_url . '/login/oauth2/token';

	$postdata = array(
		'client_id' => $oauth2_id,
		'redirect_uri' => $oauth2_uri,
		'client_secret' => $oauth2_key,
		'code' => $_GET['code']
	);

	$resp = CURL::post($url, $postdata, true, array(), true);

	$_SESSION['api_key'] = $resp['response']->access_token;

	// Save API Key to DB
	$dsn = "mysql:dbname=$db_name;host=$db_host";

	try {
		$dbh = new PDO($dsn, $db_user, $db_password);
	} catch (PDOException $e) {
		echo 'Connection failed: ' . $e->getMessage();
	}

	$sth = $dbh->prepare("INSERT INTO $db_user_table (id, api_key, date_created) VALUES (:userid, :key, NOW()) ON DUPLICATE KEY UPDATE api_key=VALUES(api_key)");
	$sth->bindParam(':userid', $_SESSION['launch_params']['custom_canvas_user_id'], PDO::PARAM_INT);
	$sth->bindParam(':key', $_SESSION['api_key'], PDO::PARAM_STR);
	$sth->execute();
	
	session_write_close();
	header('Location:index.php');
}elseif( isset($_GET['error']) ){
	printError('Authentication problem:  Access Denied.');
}else{
	printError('Authentication problem, please ensure that your instance of UDOIT is configured correctly.');
}
