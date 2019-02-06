<?php

global $db_type;
global $db_reports_table;

// Set the reports table name to a default value just in case it isn't configured yet.
empty($db_reports_table) ?: 'reports';

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
            'isRequired' => !$check_for_column($db_reports_table, 'term'),
            'sql' => "ALTER TABLE {$db_reports_table} ADD term integer",
        ],
    ];
}

if ('pgsql' === $db_type) {
    // POSTGRESQL
    echo("Adding refresh_token and canvas_url fields in PostgreSQL\r\n");
    $queries = [
        [
            'isRequired' => !$check_for_column($db_reports_table, 'term'),
            'sql' => "ALTER TABLE {$db_reports_table} ADD term integer",
        ],
    ];
}

if ('mysql' === $db_type) {
    // MYSQL
    echo("Adding refresh_token and canvas_url fields in MySQL\r\n");
    $queries = [
        [
            'isRequired' => !$check_for_column($db_reports_table, 'term'),
            'sql' => "ALTER TABLE {$db_reports_table} ADD term int(10) unsigned NOT NULL",
        ],
    ];
}

//  run every query
foreach ($queries as $query) {
    if ($query['isRequired']) {
        UdoitDB::query($query['sql']);
    }
}
