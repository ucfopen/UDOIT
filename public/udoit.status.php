<?php
header('Content-Type: application/json');

require_once('../config/settings.php');
use Httpful\Request;


$options = ['verify' => false];

$server_link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https:" : "http:") . '//'.$_SERVER['HTTP_HOST'].dirname($_SERVER['PHP_SELF']);

$status['tool'] = "UDOIT";
$status['url'] = $server_link;
$status['base_url'] = $api_uri;

$statusCheck['index'] = false;
$statusCheck['xml'] = false;
$statusCheck['dev_key'] = false;

$index = \Httpful\Request::get($server_link / "/index.php")->send();
print_r($index);

//index
try {
	//$index = Requests::get($server_link . "/index.php", array(), $options);
	$index = \Httpful\Request::get($server_link / "/index.php")->send();
	print_r($index);
	// if (strpos($index->body, 'Zapt') !== false) {
 //    		$statusCheck['index'] = true;
	// }
} catch (Exception $e) {
	error_log("Index check failed");
}

//xml
try {
	$xml = Requests::get($server_link . "/zapt.xml.php", array(), $options);
	if (strpos($xml->body, 'Zapt DOCX/HTML Import') !== false) {
    		$statusCheck['xml'] = true;
	}
} catch (Exception $e) {
	error_log("XML check failed");
}

//API KEY
try {
	$url = $api_uri . '/api/v1/users/self/?access_token=' . $api_key;
	$api = Requests::get($url, array(), $options);
	if ( ($api->success) && (strpos($api->body, 'Invalid access token.') !== true) ) {
    		$statusCheck['api_key'] = true;
	}
} catch (Exception $e) {
	error_log("API Key check failed");
}

//Return false if false is anywhere in the health checks. True argument is strict typing
$status['healthy'] = !in_array(false, $statusCheck, true);


$status['checks'] = $statusCheck;

$statusJSON = json_encode($status);
echo $statusJSON;
