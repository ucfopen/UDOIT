<?php

class Config {
    const DEBUG             = (getenv("DEBUG")) ?: false;

    /* Oauth 1.0 Settings (For use when installing the app in Canvas) */
    const CONSUMER_KEY      = getenv('CONSUMER_KEY');
    const SHARED_SECRET     = getenv('SHARED_SECRET');

    /* Oauth 2.0 Settings (Provided by Instructure) */
    const OAUTH2_ID         = getenv('OAUTH2_ID');
    const OAUTH2_KEY        = getenv('OAUTH2_KEY');
    const OAUTH2_URI        = getenv('OAUTH2_URI');

    /* Database Config */

    const DB_URL            = parse_url(getenv('DATABASE_URL'));
    const DB_TYPE           = 'pgsql';
    const DB_HOST           = $db_url['host'];
    const DB_PORT           = $db_url['port'];
    const DB_NAME           = substr($db_url['path'], 1);
    const DB_USER           = $db_url['user'];
    const DB_PASSWORD       = $db_url['pass'];
    const DB_USER_TABLE     = 'users';
    const DB_REPORTS_TABLE  = 'reports';

    const DSN = "pgsql:host={".$db_host."};dbname={".$db_name."};user={".$db_user."};port={".$db_port."};sslmode=require;password={".$db_password."}";


    /* Disable headings check character count */
    const DOC_LENGTH        = getenv('DOC_LENGTH')?:1500;

    /* Google/YouTube Data Api Key */
    const GOOGLE_API_KEY    = getenv('GOOGLE_API_KEY')?:'';
}