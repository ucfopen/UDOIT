<?php
/**
*   Copyright (C) 2014 University of Central Florida, created by Jacob Bates, Eric Colon, Fenel Joseph, and Emily Sachs.
*
*   This program is free software: you can redistribute it and/or modify
*   it under the terms of the GNU General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.
*
*   This program is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU General Public License for more details.
*
*   You should have received a copy of the GNU General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
*   Primary Author Contact:  Jacob Bates <jacob.bates@ucf.edu>
*/

header('Content-Type: application/json');

require_once('../config/settings.php');
use Httpful\Request;

global $logger;

// lti server
$server_link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https:" : "http:").'//'.$_SERVER['HTTP_HOST'].dirname($_SERVER['PHP_SELF']);

//canvas url
$sth = UdoitDB::prepare("SELECT canvas_url from users limit 1;");
$sth->execute();
$url = $sth->fetch();
$canvas_url = $url[0];

$status['tool'] = "UDOIT";
$status['url'] = $server_link;
$status['base_url'] = $canvas_url;

$statusCheck['index'] = false;
$statusCheck['xml'] = false;
$statusCheck['dev_key'] = false;
$statusCheck['db'] = false;
$statusCheck['youtube_api'] = false;
$statusCheck['vimeo_api'] = false;

//index
try {
    $index = \Httpful\Request::get($server_link.'/index.php')->send();
    if (strpos($index->body, 'Missing LTI launch information') !== false) {
        $statusCheck['index'] = true;
    }
} catch (Exception $e) {
    $logger->addError('Status Page: Index check failed');
}

//xml
try {
    $xml = Httpful\Request::get($server_link.'/udoit.xml.php')->send();
    if (strpos($xml->body, 'UDOIT') !== false) {
        $statusCheck['xml'] = true;
    }
} catch (Exception $e) {
    $logger->addError('Status Page: XML check failed');
}


//check db connection
try {
    $udb = UdoitDB::prepare("SELECT 1")->execute();
    if ($udb) {
        $statusCheck['db'] = true;
    }
} catch (Exception $e) {
    $logger->addError('Status Page: Database connection check failed');
}

//check dev key
try {
    $dev_key_url = $canvas_url."/login/oauth2/auth?client_id=".$oauth2_id."&response_type=code&redirect_uri=".$oauth2_uri;
     $dev = Httpful\Request::get($dev_key_url)->send();
    if ($dev->code < 400) {
        $statusCheck['dev_key'] = true;
    }
} catch (Exception $e) {
    $logger->addError('Status Page: Dev Key check failed');
}

//check YouTube API Key
try {
    $url = 'https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=YbJOTdZBX1g&key='.constant('GOOGLE_API_KEY');
    $response = Httpful\Request::get($url)->send();
    if ($response->code == 200) {
        $statusCheck['youtube_api'] = true;
    }
} catch (Exception $e) {
    $logger->addError('Status Page: YouTube API Key check failed');
}

//check Vimeo APi key
try {
    $url = 'https://api.vimeo.com/videos/27246366/texttracks';
    $response = Httpful\Request::get($url)->addHeader('Authorization', 'Bearer '.constant('VIMEO_API_KEY'))->send();
    if ($response->code == 200) {
        $statusCheck['vimeo_api'] = true;
    }
} catch (Exception $e) {
    $logger->addError('Status Page: Vimeo API Key check failed');
}


//Return false if false is anywhere in the health checks. True argument is strict typing
$status['healthy'] = !in_array(false, $statusCheck, true);

$status['checks'] = $statusCheck;

$statusJSON = json_encode($status);
echo $statusJSON;
