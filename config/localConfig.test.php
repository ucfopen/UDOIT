<?php

/* Oauth 1.0 Settings (For use when installing the app in Canvas) */
$consumer_key = 'test_consumer_key';
$shared_secret = 'test_secret';

/* Oauth 2.0 Settings (Provided by Instructure) */
$oauth2_id = 'test_oauth2_id';
$oauth2_key = 'test_oauth2_key';
$oauth2_uri = 'test_oauth2_uri';

/* Disable headings check character count */
$doc_length = '1500';

/* Tool name for display in Canvas Navigation */
$canvas_nav_item_name = 'test udoit';

/* Google/YouTube Data Api Key */
define('GOOGLE_API_KEY', 'TEST_API_KEY');

/* Google Analytics Tracking Code */
define('GA_TRACKING_CODE', 'TEST_GA_TRACKING');

/* Database Config */
$db_type          = 'test'; // 'mysql' or 'pgsql'
$db_host          = ''; // localhost or ip
$db_port          = '';
$db_user          = '';
$db_password      = '';
$db_name          = '';
$db_user_table    = 'users';
$db_reports_table = 'reports';
$dsn = "{$db_type}:host={$db_host};port={$db_port};dbname={$db_name}";

$debug = false;

// added in v2.3.0
// Background worker Options (See Background Workers in Readme)
$background_worker_enabled = false;
$background_job_expire_time = 20; // after x Minutes, mark job as expired
$background_worker_sleep_seconds = 1;

// Sets CURLOPT_SSL_VERIFYPEER and CURLOPT_SSL_VERIFYHOST
// This should be true for production environments
$curl_ssl_verify = true;

// send logs into the phpunit output
$log_handler = new \Monolog\Handler\TestHandler(null, \Monolog\Logger::WARNING);
$log_handler->setFormatter(new \Monolog\Formatter\LineFormatter(null, null, true, true));
