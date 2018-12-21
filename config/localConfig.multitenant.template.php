<?php

/*
 * Multi-tenant localConfig is used by organizations that want to connect multiple Canvas instances to a single UDOIT.
 *
 * To use multi-tenant you will need to request a global developer key from Instructure.
 */

/*********************
 * REQUIRED SETTINGS
 *********************/

/*
 * Canvas Developer Key Oauth 2.0 Settings
 *
 * Multi-tenant instances will need a global Canvas developer ID and key
 */
$oauth2_id  = ''; // UDOIT global developer ID
$oauth2_key = ''; // UDOIT global developer Key
$oauth2_uri = ''; // EX: https://udoit.my-org.edu/oauth2response.php or https://udoit.my-org.edu/udoit/public/oauth2response.php

/* Google/YouTube Data Api Key */
define('GOOGLE_API_KEY', '');

/* Vimeo API Key */
define('VIMEO_API_KEY', '');

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
$db_institutes_table = 'institutes';
$dsn              = "{$db_type}:host={$db_host};port={$db_port};dbname={$db_name}";

$debug = false;

/* Set the Environment
 * Valid values are 'ENV_PROD', 'ENV_DEV' (default), or 'ENV_TEST'
 *
 * ENV_DEV and ENV_TEST behaviors:
 *  - set display errors to 1
 *  - add test reports to 'View Old Reports' page in UDOIT
 *  - No Canvas token validation
 *  - Returns "test-token" when getting refresh token for Canvas
 *  - Course Scanner doesn't scan, simply contains already loaded test reports
 */
$UDOIT_ENV = ENV_DEV; // default


/*********************
 * ADVANCED SETTINGS
 *
 * These are all set to a standard default that should not need to be changed in most cases.
 *
 *********************/

/*
 * The consumer key and shared secret will need to be generated per institute for multi-tenant instances.
 */
$consumer_key  = null;
$shared_secret = null;

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

/* Background worker Options (See Background Workers in Readme) */
$background_worker_enabled = false;
$background_job_expire_time = 20; // after x Minutes, mark job as expired
$background_worker_sleep_seconds = 7;

/* Ignore SSL Certificates */
// For use while developing with self-signed SSL Certificates
// Sets CURLOPT_SSL_VERIFYPEER and CURLOPT_SSL_VERIFYHOST
$curl_ssl_verify = true; // This should be true for production environments
