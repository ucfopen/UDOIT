<?php

require_once('../config/settings.php');
session_start();

/**
 * Verify that .htaccess and .htpasswd files exist. Very basic security check, but it offers a reminder to the end user.
 */
function multitenant_check_security() {
    $secure = FALSE;

    if (file_exists('.htaccess')) {
        if (file_exists('.htpasswd')) {
            $secure = TRUE;
        }
    }

    return $secure;
}

function multitenant_handle_request() {
    $get_vars = filter_input_array(INPUT_GET, FILTER_SANITIZE_STRING);
    $action = isset($get_vars['action']) ? $get_vars['action'] : NULL;
    $domain = isset($get_vars['domain']) ? $get_vars['domain'] : NULL;

    if ($domain && $action) {
        switch ($action) {
            case 'delete':
                multitenant_institute_delete($domain);
                break;
            case 'insert':
                multitenant_institute_insert($domain);
                break;
        }

        header('Location: index.php');
        exit;
    }
}

function multitenant_get_institutes() {
    return UdoitDB::query('SELECT * FROM institutes')->fetchAll(PDO::FETCH_CLASS);
}

function multitenant_institute_delete($domain) {
    return UdoitDB::query('DELETE FROM institutes WHERE domain = "' . $domain . '"');
}

function multitenant_institute_insert($domain) {
    $exists = UdoitDB::query('SELECT domain FROM institutes WHERE domain = "' . $domain . '"')->fetchObject();

    if (!$exists) {
        $data = [
            'domain' => $domain,
            'consumer_key' => multitenant_generate_consumer_key($domain),
            'shared_secret' => multitenante_generate_shared_secret($domain),
        ];

        UdoitDB::prepare('INSERT INTO institutes (domain, consumer_key, shared_secret, date_created) VALUES (:domain, :consumer_key, :shared_secret, now())')
            ->execute($data);
    }
    else {
        $_SESSION['messages'][] = 'Domain already exists.';
    }
}

function multitenant_generate_consumer_key($domain) {
    return 'udoit.' . str_replace(['.instructure.com', '.instructure.edu'], '', $domain);
}

function multitenante_generate_shared_secret($domain) {
    return uniqid('udoit');
}

function multitenant_print_messages() {
    $out = '';

    foreach ($_SESSION['messages'] as $message) {
        $out .= '<div class="alert alert-info">' . $message . '</div>';
    }
    unset($_SESSION['messages']);

    return $out;
}