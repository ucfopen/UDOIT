<?php
define('ENV_TEST', 'test');
define('ENV_PROD', 'prod');
define('ENV_DEV', 'dev');

define('UDOIT_VERSION', '2.5.0');

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

// SET UP ERROR REPORTING
error_reporting(E_ALL & ~E_NOTICE);
ini_set("display_errors", ($UDOIT_ENV == ENV_PROD ? 0 : 1));

// SET DEFAULT ENVIRONMENT
isset($UDOIT_ENV) || $UDOIT_ENV = ENV_PROD; // !! override in your localConfig.php

// SET UP OAUTH
UdoitUtils::setupOauth($oauth2_id, $oauth2_key, $oauth2_uri, $consumer_key, $shared_secret, $curl_ssl_verify);

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
$udoit_welcome_message = 'Is this thing on?';

$udoit_disclaimer_message = 'No';
