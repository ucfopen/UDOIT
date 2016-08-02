<?php
/**
*	Copyright (C) 2014 University of Central Florida, created by Jacob Bates, Eric Colon, Fenel Joseph, and Emily Sachs.
*
*	This program is free software: you can redistribute it and/or modify
*	it under the terms of the GNU General Public License as published by
*	the Free Software Foundation, either version 3 of the License, or
*	(at your option) any later version.
*
*	This program is distributed in the hope that it will be useful,
*	but WITHOUT ANY WARRANTY; without even the implied warranty of
*	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*	GNU General Public License for more details.
*
*	You should have received a copy of the GNU General Public License
*	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
*	Primary Author Contact:  Jacob Bates <jacob.bates@ucf.edu>
*/
$servername = 'https://' . $_SERVER['SERVER_NAME'];
$exploded = explode('/',$_SERVER['PHP_SELF']);
$scriptname= @end( $exploded );
$scriptpath=str_replace($scriptname,'',$_SERVER['PHP_SELF']);
$launch = $servername . $scriptpath;

// Get tool configuration values from the correct config file
if (getenv('USE_HEROKU_CONFIG'))
{
	require_once('../config/herokuConfig.php');
	if(!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https') {
		$_SERVER['HTTPS'] = 'on';
	}
}
else
{
	require_once('../config/localConfig.php');
}

header('Content-type: text/xml');
echo '<?xml version="1.0" encoding="UTF-8"?>';

?>
<cartridge_basiclti_link xmlns="http://www.imsglobal.org/xsd/imslticc_v1p0"
	xmlns:blti = "http://www.imsglobal.org/xsd/imsbasiclti_v1p0"
	xmlns:lticm ="http://www.imsglobal.org/xsd/imslticm_v1p0"
	xmlns:lticp ="http://www.imsglobal.org/xsd/imslticp_v1p0"
	xmlns:xsi = "http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation = "http://www.imsglobal.org/xsd/imslticc_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imslticc_v1p0.xsd
	http://www.imsglobal.org/xsd/imsbasiclti_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imsbasiclti_v1p0.xsd
	http://www.imsglobal.org/xsd/imslticm_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imslticm_v1p0.xsd
	http://www.imsglobal.org/xsd/imslticp_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imslticp_v1p0.xsd">
	<blti:title>UDOIT</blti:title>
	<blti:description>This tool allows you scan your courses and check for common accessibility issues.</blti:description>
	<blti:icon><?= $launch ?>assets/img/udoit_icon.png</blti:icon>
	<blti:launch_url><?= $launch ?></blti:launch_url>
	<blti:extensions platform="canvas.instructure.com">
		<lticm:property name="tool_id">udoit</lticm:property>
		<lticm:property name="privacy_level">public</lticm:property>
		<lticm:property name="domain"><?= $_SERVER['SERVER_NAME'] ?></lticm:property>
		<lticm:options name="custom_fields">
			<lticm:property name="canvas_api_domain">$Canvas.api.domain</lticm:property>
		</lticm:options>
		<lticm:options name="course_navigation">
			<lticm:property name="url"><?= $launch ?></lticm:property>
			<lticm:property name="default">enabled</lticm:property>
			<lticm:property name="visibility">admins</lticm:property>
			<lticm:property name="text"><?= $canvas_nav_item_name ? $canvas_nav_item_name : 'UDOIT' ?></lticm:property>
			<lticm:property name="enabled">true</lticm:property>
		</lticm:options>
	</blti:extensions>
	<cartridge_bundle identifierref="BLTI001_Bundle"/>
	<cartridge_icon identifierref="BLTI001_Icon"/>
</cartridge_basiclti_link>
