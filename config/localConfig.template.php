<?php

/* LTI App Oauth 1.0 Settings (For use when installing the app in Canvas) */
$consumer_key  = '';
$shared_secret = '';

/* Canvas Developer Key Oauth 2.0 Settings */
$oauth2_id  = ''; // Provided by your Canvas Admin
$oauth2_key = ''; // Provided by your Canvas Admin
$oauth2_uri = ''; // EX: https://udoit.my-org.edu/oauth2response.php or https://udoit.my-org.edu/udoit/public/oauth2response.php

/* Disable headings check character count */
$doc_length = '1500';

/* Unscannable Suggestion */
$unscannable_suggestion = 'Consider converting these documents to Pages, since they are easier to update, easier to view on mobile devices, and generally more accessible.';
$unscannable_suggestion_on = true;

/* Tool name for display in Canvas Navigation */
$canvas_nav_item_name = (getenv('CANVAS_NAV_ITEM_NAME')) ?: 'UDOIT';

/* File Scan Size Limit */
$file_scan_size_limit = getenv('SCAN_FILE_SIZE_LIMIT') ?: 52428800;

/* Alt Text Length Limit */
$alt_text_length_limit = getenv('ALT_TEXT_LENGTH_LIMIT') ?: 125;

/* Google/YouTube Data Api Key */
define('GOOGLE_API_KEY', '');

/* Google Analytics Tracking Code */
define('GA_TRACKING_CODE', '');

/* Database Config */
$db_type          = 'mysql'; // 'mysql' or 'pgsql'
$db_host          = ''; // localhost or some other domain/ip
$db_port          = '3306';
$db_user          = '';
$db_password      = '';
$db_name          = '';
$db_user_table    = 'users';
$db_reports_table = 'reports';
$dsn              = "{$db_type}:host={$db_host};port={$db_port};dbname={$db_name}";

$debug = false;

// added in v2.3.0
// Background worker Options (See Background Workers in Readme)
$background_worker_enabled = false;
$background_job_expire_time = 20; // after x Minutes, mark job as expired
$background_worker_sleep_seconds = 7;

// OVERRIDE the default of ENV_PROD
// $UDOIT_ENV = ENV_PROD;
// $UDOIT_ENV = ENV_DEV;
// $UDOIT_ENV = ENV_TEST;

// Sets CURLOPT_SSL_VERIFYPEER and CURLOPT_SSL_VERIFYHOST
// This should be true for production environments
$curl_ssl_verify = true;
