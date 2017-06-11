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
$unscannable_suggestion = 'Consider converting these documents to Pages, since they are easier to update and generally more accessible.';
$unscannable_suggestion_on = true;

/* Tool name for display in Canvas Navigation */
$canvas_nav_item_name = getenv('CANVAS_NAV_ITEM_NAME');

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

/* Background worker Options (See Background Workers in Readme) */
$background_worker_enabled = false;
$worker_sleep_seconds = 10;

// OVERRIDE the default of ENV_PROD
// $UDOIT_ENV = ENV_PROD;
// $UDOIT_ENV = ENV_DEV;
// $UDOIT_ENV = ENV_TEST;
