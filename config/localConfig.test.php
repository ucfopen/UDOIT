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

/* Assigning which file types won't be scanned */
$unscannable_file_types = ['pdf', 'doc', 'docx', 'ppt', 'pptx'];

/* Tool name for display in Canvas Navigation */
$canvas_nav_item_name = 'test udoit';

/* File Scan Size Limit */
$file_scan_size_limit = getenv('SCAN_FILE_SIZE_LIMIT') ?: 52428800;

/* Alt Text Length Limit */
$alt_text_length_limit = getenv('ALT_TEXT_LENGTH_LIMIT') ?: 125;

/* Google/YouTube Data Api Key */
define('GOOGLE_API_KEY', 'TEST_API_KEY');

/* Google Analytics Tracking Code */
define('GA_TRACKING_CODE', 'TEST_GA_TRACKING');

/* Vimeo API Key */
define('VIMEO_API_KEY', 'TEST_VIMEO_KEY');

/* Course Language */
define('COURSE_LANGUAGE', 'TEST_COURSE_LANGUAGE');

/* Flag for API Caching */
define('USE_API_CACHING', 'false');

/* Database Config */
$db_type            = 'test'; // 'mysql' or 'pgsql'
$db_host            = ''; // localhost or ip
$db_port            = '';
$db_user            = '';
$db_password        = '';
$db_name            = '';
$db_user_table      = 'users';
$db_reports_table   = 'reports';
$db_job_queue_table = 'job_queue';

$dsn                = "{$db_type}:host={$db_host};port={$db_port};dbname={$db_name}";

$debug = false;

// added in v2.3.0
// Background worker Options (See Background Workers in Readme)
$background_worker_enabled = false;
$background_job_expire_time = 20; // after x Minutes, mark job as expired
$background_worker_sleep_seconds = 1;

// Sets CURLOPT_SSL_VERIFYPEER and CURLOPT_SSL_VERIFYHOST
// This should be true for production environments
$curl_ssl_verify = true;

$admin_panel_enabled = true;

// send logs into the phpunit output
$log_handler = new \Monolog\Handler\TestHandler(null, \Monolog\Logger::WARNING);
$log_handler->setFormatter(new \Monolog\Formatter\LineFormatter(null, null, true, true));
