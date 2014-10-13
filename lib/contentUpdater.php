<?php

if (empty($_POST['newcontent'])) {
	echo 'Missing content';
	die();
}

include_once('../config/localConfig.php');
require '../vendor/autoload.php';

use Httpful\Request;

session_start();

$course_id = $_SESSION['launch_params']['custom_canvas_course_id'];
$api_key = $_SESSION['api_key'];

session_write_close();

$content_id = $_POST['contentid'];
$content_type = $_POST['contenttype'];
$error_html = str_replace(["\n", "\r"], '', $_POST['errorhtml']);
$error_type = $_POST['errortype'];
$new_content = $_POST['newcontent'];

$dom = new DOMDocument();
@$dom->loadHTML($error_html);

if ($error_type === "imgHasAlt" || $error_type === "imgNonDecorativeHasAlt") {
	$imgs = $dom->getElementsByTagName('img');

	foreach ($imgs as $img) {
		$img->setAttribute('alt', $new_content);
		$corrected_error = $dom->saveHTML($img);
	}
}

if ($error_type === "tableThShouldHaveScope") {
	if (!($new_content === "col" || $new_content === "row")) {
		echo 'Incorrect table scope';
		die();
	}

	$ths = $dom->getElementsByTagName('th');

	foreach ($ths as $th) {
		$th->setAttribute('scope', $new_content);
		$corrected_error = $dom->saveHTML($th);
	}
}

// Access page via Canvas API
switch ($content_type) {
    case "announcements":
        $url = $base_url."/api/v1/courses/".$course_id."/discussion_topics?&only_announcements=true/".$content_id."?&access_token=".$api_key;
        break;
    case "assignments":
        $url = $base_url."/api/v1/courses/".$course_id."/assignments?&access_token=".$api_key;
        break;
    case "discussions":
        $url = $base_url."/api/v1/courses/".$course_id."/discussion_topics/".$content_id."?&access_token=".$api_key;
        break;
    case "files":
        $url = $base_url."/api/v1/courses/".$course_id."/files/".$content_id."?access_token=".$api_key;
        break;
    case "pages":
        $url = $base_url."/api/v1/courses/".$course_id."/pages/".$content_id."?access_token=".$api_key;
		break;
}

$get_uri = $base_url."/api/v1/courses/".$course_id."/pages/".$content_id."?access_token=".$api_key;
$content = Request::get($get_uri)->send();
// html of the current wiki page
$html = $content->body->body;

$html = str_replace($error_html, $corrected_error, $html);

$put_uri = $base_url."/api/v1/courses/".$course_id."/pages/".$content_id."?wiki_page[body]=".urlencode($html)."&access_token=".$api_key;

Request::put($put_uri)->send();