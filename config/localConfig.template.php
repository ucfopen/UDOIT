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

/* Vimeo API Key */
define('VIMEO_API_KEY', '');

/* Google Analytics Tracking Code */
define('GA_TRACKING_CODE', '');

/* Database Config */
$db_type            = 'mysql'; // 'mysql' or 'pgsql'
$db_host            = ''; // localhost or some other domain/ip
$db_port            = '3306';
$db_user            = '';
$db_password        = '';
$db_name            = '';
$db_user_table      = 'users';
$db_reports_table   = 'reports';
$db_job_queue_table = 'job_queue';

$dsn                = "{$db_type}:host={$db_host};port={$db_port};dbname={$db_name}";

/* Add key/value options to passed directly to the PDO object */
$db_options = [];

$debug = false;

/* Background worker Options (See Background Workers in Readme) */
$background_worker_enabled = false;
$background_job_expire_time = 20; // after x Minutes, mark job as expired
$background_worker_sleep_seconds = 7;

/* Set the Environment (default value is 'ENV_DEV' */
// Valid values are 'ENV_PROD', 'ENV_DEV', or 'ENV_TEST'
// If '$UDOIT_ENV' is not 'ENV_PROD' UDOIT is loaded with
    // set display errors to 1
    // add test reports to 'View Old Reports' page in UDOIT
    // doesn't validate Canvas tokens
    // returns "test-token" when getting refresh token for Canvas
    // Course Scanner doesn't scan, simply contains already loaded test reports
// $UDOIT_ENV = ENV_PROD; // default

/* Ignore SSL Certificates */
// For use while developing with self-signed SSL Certificates
// Sets CURLOPT_SSL_VERIFYPEER and CURLOPT_SSL_VERIFYHOST
$curl_ssl_verify = true; // This should be true for production environments


/* Admin Panel
 * 
 * True adds a Admin Navigation placement to the XML. Allows for generating
 * statistics about usage of UDOIT. Also allows for user administration.
 * 
 * False disables access and removes block from XML. Use this setting if you
 * are in a multitenant environment, as the 2.5.0 release of UDOIT does not
 * separate data between instances of Canvas.
 * 
 * Default false
 */
$admin_panel_enabled = false;
