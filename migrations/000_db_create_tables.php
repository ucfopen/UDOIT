<?php

global $db_type;

if ('sqlite' === $db_type || 'test' === $db_type) {
    // SQLITE (mostly for testing)
    $tables = [
        '
            CREATE TABLE IF NOT EXISTS reports (
                id integer PRIMARY KEY AUTOINCREMENT,
                user_id integer,
                course_id integer,
                report_json text,
                date_run timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
                errors integer,
                suggestions integer
            );
        ',

        '
            CREATE TABLE IF NOT EXISTS users (
                id integer CONSTRAINT users_pk PRIMARY KEY AUTOINCREMENT,
                api_key varchar(255),
                refresh_token varchar(255),
                canvas_url varchar(255),
                date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP
            );
        ',
    ];
}

if ('pgsql' === $db_type) {
    // POSTGRESQL
    $tables = [
        '
            CREATE TABLE IF NOT EXISTS reports (
                id SERIAL PRIMARY KEY,
                user_id integer,
                course_id integer,
                report_json text,
                date_run timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
                errors integer,
                suggestions integer
            );
        ',

        '
            CREATE TABLE IF NOT EXISTS users (
                id integer CONSTRAINT users_pk PRIMARY KEY,
                api_key varchar(255),
                refresh_token varchar(255),
                canvas_url varchar(255),
                date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP
            );
        ',
    ];
}

if ('mysql' === $db_type) {
    // MYSQL
    $tables = [
        '
            CREATE TABLE IF NOT EXISTS `reports` (
                `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
                `user_id` int(10) unsigned NOT NULL,
                `course_id` int(10) unsigned NOT NULL,
                `report_json` MEDIUMTEXT NOT NULL,
                `date_run` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                `errors` int(10) unsigned NOT NULL,
                `suggestions` int(10) unsigned NOT NULL,
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
        ',

        '
            CREATE TABLE IF NOT EXISTS `users` (
                `id` int(10) unsigned NOT NULL,
                `api_key` varchar(255) NOT NULL,
                `refresh_token` varchar(255) NOT NULL,
                `canvas_url` varchar(255) NOT NULL,
                `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`),
                UNIQUE KEY `id` (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
        ',
    ];
}

//  run every query
foreach ($tables as $sql) {
    UdoitDB::query($sql);
}
