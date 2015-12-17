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