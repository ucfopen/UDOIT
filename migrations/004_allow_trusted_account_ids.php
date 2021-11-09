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
            'sql' => 'ALTER TABLE users ALTER COLUMN id TYPE bigint',
        ],
        [
            'sql' => 'ALTER TABLE reports ALTER COLUMN user_id TYPE bigint',
        ],
    ];
}

if ('mysql' === $db_type) {
    // MYSQL
    $queries = [
        [
            'sql' => 'ALTER TABLE users CHANGE id id BIGINT(20) UNSIGNED NOT NULL',
        ],
        [
            'sql' => 'ALTER TABLE reports CHANGE user_id user_id BIGINT(20) UNSIGNED NOT NULL',
        ],
    ];
}

echo ("Updating `users` and `reports` tables to handle larger user IDs for Canvas trusted accounts.\r\n");

//  run every query
foreach ($queries as $query) {
    UdoitDB::query($query['sql']);
}
