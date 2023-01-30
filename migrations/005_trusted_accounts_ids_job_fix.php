<?php

global $db_type;

if ('sqlite' === $db_type || 'test' === $db_type) {
    // SQLITE (mostly for testing)
    $queries = [
    ];
}

if ('pgsql' === $db_type) {
    // POSTGRESQL
    $queries = [
        [
            'sql' => 'ALTER TABLE job_queue ALTER COLUMN user_id TYPE bigint',
        ],
    ];
}

if ('mysql' === $db_type) {
    // MYSQL
    $queries = [
        [
            'sql' => 'ALTER TABLE job_queue CHANGE id id BIGINT(20) UNSIGNED NOT NULL',
        ],
    ];
}

echo ("Updating `job_queue table to handle larger user IDs for Canvas trusted accounts.\r\n");

//  run every query
foreach ($queries as $query) {
    UdoitDB::query($query['sql']);
}
