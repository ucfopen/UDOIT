<?php

$debug            = (getenv("DEBUG")) == 'true';

/* Oauth 1.0 Settings (For use when installing the app in Canvas) */
$consumer_key     = getenv('CONSUMER_KEY');
$shared_secret    = getenv('SHARED_SECRET');

/* Oauth 2.0 Settings (Provided by Instructure) */
$oauth2_id        = getenv('OAUTH2_ID');
$oauth2_key       = getenv('OAUTH2_KEY');
$oauth2_uri       = getenv('OAUTH2_URI');
$oauth2_enforce_scopes = (getenv('OAUTH2_ENFORCE_SCOPES')) == 'true';

/* Set session cookie options */
$session_cookie_options = [
    'expire' => getenv('SESSION_COOKIE_EXPIRE') ?: 0,
    'path' => getenv('SESSION_COOKIE_PATH') ?: '/',
    'domain' => getenv('SESSION_COOKIE_DOMAIN') ?: null,
    'secure' => getenv('SESSION_COOKIE_SECURE') ?: true,
    'httponly' => getenv('SESSION_COOKIE_HTTPONLY') ?: false,
];

/* Tool name for display in Canvas Navigation */
$canvas_nav_item_name = getenv('CANVAS_NAV_ITEM_NAME');

/* File Scan Size Limit */
$file_scan_size_limit = getenv('SCAN_FILE_SIZE_LIMIT') ?: 52428800;

/* Alt Text Length Limit */
$alt_text_length_limit = getenv('ALT_TEXT_LENGTH_LIMIT') ?: 125;

/* Database Config */

$db_url             = parse_url(getenv('DATABASE_URL'));
$db_type            = 'pgsql';
$db_host            = $db_url['host'];
$db_port            = $db_url['port'];
$db_name            = substr($db_url['path'], 1);
$db_user            = $db_url['user'];
$db_password        = $db_url['pass'];
$db_user_table      = 'users';
$db_reports_table   = 'reports';
$db_job_queue_table = 'job_queue';

$dsn                = "pgsql:host={$db_host};dbname={$db_name};user={$db_user};port={$db_port};sslmode=require;password={$db_password}";

/* Background worker Options */
$background_worker_enabled = (getenv("WORKER_ENABLED")) == 'true';
$background_worker_sleep_seconds = 7;

/* Disable headings check character count */
$doc_length = getenv('DOC_LENGTH')?:1500;

/*Unscannable Suggestion */
$unscannable_suggestion = 'Consider converting these documents to Pages, since they are easier to update and generally more accessible.';
$unscannable_suggestion_on = true;

/* Google/YouTube Data Api Key */
define('GOOGLE_API_KEY', getenv('GOOGLE_API_KEY')?:'');

/* Vimeo API Key */
define('VIMEO_API_KEY', getenv('VIMEO_API_KEY')?:'');

/* Google Analytics Tracking Code */
define('GA_TRACKING_CODE', getenv('GA_TRACKING_CODE')?:'');

/* Flag for API Caching */
define('USE_API_CACHING', getenv('USE_API_CACHING')?:'');

// Fix some issues caused by the heroku load balancer
// The OAUTH signature verification doesn't know it's using https w/o this
if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https') {
    $_SERVER['HTTPS'] = 'on';
}

// send logs into the heroku logs
$log_handler = new \Monolog\Handler\ErrorLogHandler();
$log_handler->setFormatter(new \Monolog\Formatter\LineFormatter(null, null, true, true));

// Sets CURLOPT_SSL_VERIFYPEER and CURLOPT_SSL_VERIFYHOST
// This should be true for production environments
$curl_ssl_verify = true;

// Admin panel.  False disables access and removes block from XML.
$admin_panel_enabled = (getenv("ADMIN_PANEL_ENABLED")) == 'true';

// Footer content.
$footer_enabled = (getenv('FOOTER_ENABLED')) == 'true';
$footer_youtube_tos_link = getenv('YOUTUBE_TOS_LINK') ?: 'https://www.youtube.com/t/terms';
$footer_google_privacy_policy_link = getenv('GOOGLE_PRIVACY_POLICY_LINK') ?: 'http://www.google.com/policies/privacy';