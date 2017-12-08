<?php

global $db_type;

$check_for_column = function ($table, $columnName) {
    global $db_type;

    if ('test' === $db_type) {
        return false;
    }

    $sql =  "SELECT column_name
        FROM information_schema.columns
        WHERE table_name='{$table}'
        AND column_name='{$columnName}'";

    if ($rows = UdoitDB::query($sql)) {
        $rows = $rows->fetchAll();
    }

    return isset($rows[0]['column_name']);
};


// used to determine if each item in the $query array with the same index needs to be run
$queryRequired = [];

if ('sqlite' === $db_type || 'test' === $db_type) {
    // SQLITE (mostly for testing)
    $queries = [
        [
            'isRequired' => !$check_for_column('users', 'refresh_token'),
            'sql' => 'ALTER TABLE users ADD refresh_token VARCHAR(255)',
        ],
        [
            'isRequired' => !$check_for_column('users', 'canvas_url'),
            'sql' => 'ALTER TABLE users ADD canvas_url VARCHAR(255)',
        ],
    ];
}

if ('pgsql' === $db_type) {
    // POSTGRESQL
    $queries = [
        [
            'isRequired' => $check_for_column('users', 'refresh_token'),
            'sql' => 'ALTER TABLE users ADD refresh_token VARCHAR(255)',
        ],
        [
            'isRequired' => $check_for_column('users', 'canvas_url'),
            'sql' => 'ALTER TABLE users ADD canvas_url VARCHAR(255)',
        ],
    ];
}

if ('mysql' === $db_type) {
    // MYSQL
    $queries = [
        [
            'isRequired' => !$check_for_column('users', 'refresh_token'),
            'sql' => 'ALTER TABLE users ADD refresh_token VARCHAR(255) NOT NULL',
        ],
        [
            'isRequired' => !$check_for_column('users', 'canvas_url'),
            'sql' => 'ALTER TABLE users ADD canvas_url VARCHAR(255) NOT NULL',
        ],
    ];
}

//  run every query
foreach ($queries as $query) {
    if ($query['isRequired']) {
        UdoitDB::query($query['sql']);
    }
}
