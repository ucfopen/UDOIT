<?php

include_once('../config/localConfig.php');
include_once('curlClass.php');

session_start();

$course_id = $_SESSION['launch_params']['custom_canvas_course_id'];
$api_key = $_SESSION['api_key'];

session_write_close();

$content_id = $_POST['contentid'];
$new_content = $_POST['newcontent'];
$to_replace = "alt=\"\"" || "alt=\" \"";

// Replace selected words.
// Access page via Canvas API
$url = $base_url."/api/v1/courses/".$course_id."/pages/".$content_id."?access_token=".$api_key;
var_dump($url);
$content = Curl::get($url, true, null, true);
// html of the current wiki page
$html = $content["response"]->body;
var_dump($content);
die();
// For each index, replace the findtext with replace text
// The html is editted from last index to first index because the location of the words to be replaced
// might shift if the replace word is not the same length as the search word.
//echo "BEFORE<br />-----------<br />".convert_tags(substr_replace($html, "^", $current[$i], 0))."<br />";
// Replace the word at the current index with the correct word
$html = substr_replace($html, $new_content, $current[$i], strlen($to_replace));
//echo "AFTER<br />--------------<br />".convert_tags($html)."<br /><br />";
//echo $html;
Curl::put($url, array('wiki_page[body]' => $html), true, array(), false);