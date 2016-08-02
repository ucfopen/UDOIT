<?php

$debug            = (getenv("DEBUG")) ?: false;

/* Oauth 1.0 Settings (For use when installing the app in Canvas) */
$consumer_key     = getenv('CONSUMER_KEY');
$shared_secret    = getenv('SHARED_SECRET');

/* Oauth 2.0 Settings (Provided by Instructure) */
$oauth2_id        = getenv('OAUTH2_ID');
$oauth2_key       = getenv('OAUTH2_KEY');
$oauth2_uri       = getenv('OAUTH2_URI');

/* Tool name for display in Canvas Navigation */
$canvas_nav_item_name = getenv('CANVAS_NAV_ITEM_NAME');

/* Database Config */

$db_url           = parse_url(getenv('DATABASE_URL'));
$db_type          = 'pgsql';
$db_host          = $db_url['host'];
$db_port          = $db_url['port'];
$db_name          = substr($db_url['path'], 1);
$db_user          = $db_url['user'];
$db_password      = $db_url['pass'];
$db_user_table    = 'users';
$db_reports_table = 'reports';

$dsn = "pgsql:host={$db_host};dbname={$db_name};user={$db_user};port={$db_port};sslmode=require;password={$db_password}";


/* Disable headings check character count */
$doc_length       = getenv('DOC_LENGTH')?:1500;

/* Google/YouTube Data Api Key */
define( 'GOOGLE_API_KEY', getenv('GOOGLE_API_KEY')?:'');

/* Google Analytics Tracking Code */
define( 'GA_TRACKING_CODE', '');
