<?php

/* Oauth 1.0 Settings (For use when installing the app in Canvas) */
$consumer_key  = '';
$shared_secret = '';

/* Oauth 2.0 Settings (Provided by Instructure) */
$oauth2_id  = '';
$oauth2_key = '';
$oauth2_uri = '';

/* Disable headings check character count */
$doc_length = '1500';

/* Google/YouTube Data Api Key */
define( 'GOOGLE_API_KEY', '');

/* Google Analytics Tracking Code */
define( 'GA_TRACKING_CODE', '');

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

// OVERRIDE the default of PROD
// $UDOIT_ENV = ENV_TEST;
// $UDOIT_ENV = ENV_PROD;
// $UDOIT_ENV = ENV_DEV;
