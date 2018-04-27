<?php
require_once(__DIR__.'/../../config/settings.php');

session_start();
header('Content-type: text/json');

function respond_and_die($data, $http_code = 200)
{
    http_response_code($http_code);
    die(json_encode($data));
}

function respond_with_error($http_code, $data)
{
    $response = [
        'success' => false,
        'data' => $data,
    ];
    respond_and_die($response, $http_code);
}

function respond_with_success($data)
{
    $response = [
        'success' => true,
        'data' => $data,
    ];
    respond_and_die($response);
}

// Verify we have the variables we need from the LTI launch
$expect = ['base_url', 'launch_params', 'is_admin'];
foreach ($expect as $key) {
    if (empty($_SESSION[$key])) {
        // Set response to 401 (Unauthorized)
        respond_with_error(401, "Missing LTI launch information. Please ensure that your instance of UDOIT is installed to Canvas correctly. Missing: {$key}");
    }
}

// If Administrator is not found in the user's list of roles, kick them out with an error
if (!$_SESSION['is_admin']) {
    // Set response to 403 (Forbidden)
    respond_with_error(403, 'Insufficient permissions to continue.  Please contact your LMS Administrator.');
}
