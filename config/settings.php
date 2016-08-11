<?php
define('ENV_TEST', 'test');
define('ENV_PROD', 'prod');
define('ENV_DEV', 'dev');

// default to production
$UDOIT_ENV = ENV_PROD; // change value in your localConfig.php

if (getenv('USE_HEROKU_CONFIG'))
{
    require_once('herokuConfig.php');
    if ( ! empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https') {
        $_SERVER['HTTPS'] = 'on';
    }
}
else
{
    require_once('localConfig.php');
}

error_reporting(E_ALL & ~E_NOTICE);
ini_set("display_errors", ($UDOIT_ENV == ENV_PROD ? 0 : 1));

require_once(__DIR__.'/../vendor/autoload.php');
require_once('tests.php');

/* Prevent Caching */
header("Cache-Control: no-cache, no-store, must-revalidate"); // HTTP 1.1.
header("Pragma: no-cache"); // HTTP 1.0.
header("Expires: 0"); // Proxies.

/* Messages */
$udoit_welcome_message = 'The Universal Design Online content Inspection Tool (U<strong>DO</strong>IT) was created by the Center for Distributed Learning at the University of Central Florida. U<strong>DO</strong>IT will scan your course content, generate a report and provide instructions on how to correct accessibility issues. Funding for U<strong>DO</strong>IT was provided by a Canvas Grant awarded in 2014.';

$udoit_disclaimer_message = 'Please Note: This tool is meant to be used as a guide, not a certification. It only checks for common accessibility issues, and is not comprehensive; a clean report in U<strong>DO</strong>IT does not necessarily mean that your course is fully accessible. Likewise, the tool may indicate a possible accessibility issue where one does not exist.';

