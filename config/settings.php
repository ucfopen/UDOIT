<?php
define('ENV_TEST', 'test');
define('ENV_PROD', 'prod');
define('ENV_DEV', 'dev');

define('UDOIT_VERSION', '2.8.2');

// SET UP AUTOLOADER (uses autoload rules from composer)
require_once(__DIR__.'/../vendor/autoload.php');

// Initialize db_options. This may be overridden in the local config
$db_options = [];

// LOAD LOCAL, TEST or HEROKU CONFIG
$local_config = getenv('USE_HEROKU_CONFIG') ? 'herokuConfig.php' : 'localConfig.php';
$local_config = getenv('UNITTEST') ? 'localConfig.test.php' : $local_config;
require_once($local_config);

// ADD A DEFAULT LOG HANDLER
// !! override by creating $log_handler in your config
if (!isset($log_handler)) {
    $log_handler = new \Monolog\Handler\StreamHandler(__DIR__.'/log.log', \Monolog\Logger::DEBUG);
    $log_handler->setFormatter(new \Monolog\Formatter\LineFormatter(null, null, true, true));
}

// SET UP LOGGER
$logger = new \Monolog\Logger('udoit');
$logger->pushHandler($log_handler);
\Monolog\ErrorHandler::register($logger);

// SET UP PHP SESSION COOKIE SAMESITE SESSIONS
$lifetime = isset($session_cookie_options['lifetime']) ? $session_cookie_options['lifetime'] : 0;
$path = isset($session_cookie_options['path']) ? $session_cookie_options['path'] : '/';
$domain = isset($session_cookie_options['domain']) ? $session_cookie_options['domain'] : null;
$secure = isset($session_cookie_options['secure']) ? $session_cookie_options['secure'] : true;
$httponly = isset($session_cookie_options['httponly']) ? $session_cookie_options['httponly'] : false;

if (PHP_VERSION_ID < 70300) {
    session_set_cookie_params($lifetime, "$path; samesite=None", $domain, $secure, $httponly);
} else {
    session_set_cookie_params([
        'lifetime' => $lifetime,
        'path' => $path,
        'domain' => $domain,
        'samesite' => 'None',
        'secure' => $secure,
        'httponly' => $httponly,
    ]);
}

// SET DEFAULT ENVIRONMENT
isset($UDOIT_ENV) || $UDOIT_ENV = ENV_PROD; // !! override in your localConfig.php

// SET UP ERROR REPORTING
error_reporting(E_ALL & ~E_NOTICE);
ini_set("display_errors", ($UDOIT_ENV == ENV_PROD ? 0 : 1));

// CHECK FOR SAFARI
if (!UdoitUtils::isLoadingXMLSettings()) {
    UdoitUtils::checkSafari();
}


// SET UP OAUTH
$oauth2_scopes = [
    // assigments
    'url:GET|/api/v1/courses/:course_id/assignments',
    'url:GET|/api/v1/courses/:course_id/assignments/:id',
    'url:PUT|/api/v1/courses/:course_id/assignments/:id',
    // courses
    'url:PUT|/api/v1/courses/:id',
    'url:GET|/api/v1/courses/:id',
    'url:POST|/api/v1/courses/:course_id/files',
    // discussion topics
    'url:GET|/api/v1/courses/:course_id/discussion_topics',
    'url:GET|/api/v1/courses/:course_id/discussion_topics/:topic_id',
    'url:PUT|/api/v1/courses/:course_id/discussion_topics/:topic_id',
    // files
    'url:GET|/api/v1/courses/:course_id/files',
    'url:GET|/api/v1/courses/:course_id/folders/:id',
    'url:GET|/api/v1/folders/:id/folders',
    'url:GET|/api/v1/folders/:id/files',
    // modules
    'url:GET|/api/v1/courses/:course_id/modules',
    'url:GET|/api/v1/courses/:course_id/modules/:module_id/items',
    // pages
    'url:GET|/api/v1/courses/:course_id/pages',
    'url:GET|/api/v1/courses/:course_id/pages/:url',
    'url:PUT|/api/v1/courses/:course_id/pages/:url',
    // users
    'url:GET|/api/v1/users/:user_id/profile',
];
UdoitUtils::setupOauth($oauth2_id, $oauth2_key, $oauth2_uri, $consumer_key, $shared_secret, $curl_ssl_verify, $oauth2_enforce_scopes, $oauth2_scopes);

// SET UP DATABASE
UdoitDB::setup($db_type, $dsn, $db_user, $db_password, $db_options);

// BACKGROUND WORKER
if (isset($background_worker_enabled)) {
    UdoitJob::$background_worker_enabled = $background_worker_enabled;
}

// Prevent Caching on the client
header("Cache-Control: no-cache, no-store, must-revalidate"); // HTTP 1.1.
header("Pragma: no-cache"); // HTTP 1.0.
header("Expires: 0"); // Proxies.

// Messages
$udoit_welcome_message = 'The Universal Design Online content Inspection Tool (U<strong>DO</strong>IT) was created by the Center for Distributed Learning at the University of Central Florida. U<strong>DO</strong>IT will scan your course content, generate a report and provide instructions on how to correct accessibility issues. Funding for U<strong>DO</strong>IT was provided by a Canvas Grant awarded in 2014.';

$udoit_disclaimer_message = 'Please Note: This tool is meant to be used as a guide, not a certification. It only checks for common accessibility issues, and is not comprehensive; a clean report in U<strong>DO</strong>IT does not necessarily mean that your course is fully accessible. Likewise, the tool may indicate a possible accessibility issue where one does not exist.';
