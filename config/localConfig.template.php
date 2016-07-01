<?php

class Config {
    /* This tests to see if the user came from something other than the URL of your LMS */
    const REFERER_TEST      = '';

    /* Set the path for the base directory (where the user will start choosing from) */
    const BASE_URL          = '';

    /* Oauth 1.0 Settings (For use when installing the app in Canvas) */
    const CONSUMER_KEY      = '';
    const SHARED_SECRET     = '';

    /* Oauth 2.0 Settings (Provided by Instructure) */
    const OAUTH2_ID         = '';
    const OAUTH2_KEY        = '';
    const OAUTH2_URI        = '';

    /* Disable headings check character count */
    const DOC_LENGTH        = '1500';

    /* Google/YouTube Data Api Key */
    const GOOGLE_API_KEY    = '';

    /* Database Config */
    const DB_TYPE           = 'mysql'; // 'mysql' or 'pgsql'
    const DB_HOST           = ''; // localhost or some other domain/ip
    const DB_PORT           = '3306';
    const DB_USER           = '';
    const DB_PASSWORD       = '';
    const DB_NAME           = '';
    const DB_USER_TABLE     = 'users';
    const DB_REPORTS_TABLE  = 'reports';
    const DSN               = Config::DB_TYPE.":host=".Config::DB_HOST.";port=".Config::DB_PORT.";dbname=".Config::DB_NAME;

    // Environment Variable
    const UDOIT_ENVIRONMENT = 'PROD';
    //const UDOIT_ENVIRONMENT = 'TEST';
    //const UDOIT_ENVIRONMENT = 'DEV';
}

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
