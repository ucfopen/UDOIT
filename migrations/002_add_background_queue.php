<?php

global $db_type;

if ('sqlite' === $db_type || 'test' === $db_type) {
    // SQLITE (mostly for testing)
    $queries = [
        '
            CREATE TABLE IF NOT EXISTS job_queue (
                id integer PRIMARY KEY AUTOINCREMENT,
                job_group varchar(255),
                user_id integer,
                job_type varchar(255),
                data text,
                results text,
                status varchar(255),
                date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
                date_completed timestamp with time zone,
                report_id integer
            );
        ',
    ];
}

if ('pgsql' === $db_type) {
    // POSTGRESQL
    $queries = [
        '
            CREATE TABLE IF NOT EXISTS job_queue (
                id SERIAL PRIMARY KEY,
                job_group varchar(255),
                user_id integer,
                job_type varchar(255),
                data text,
                results text,
                status varchar(255),
                date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
                date_completed timestamp with time zone,
                report_id integer
            );
        ',
    ];
}

if ('mysql' === $db_type) {
    // MYSQL
    $queries = [
        '
            CREATE TABLE IF NOT EXISTS `job_queue` (
                `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
                `job_group` varchar(255) NOT NULL,
                `user_id` int(10) unsigned NOT NULL,
                `job_type` varchar(255) NOT NULL,
                `data` text,
                `results` mediumtext,
                `status` varchar(255) NOT NULL DEFAULT "new",
                `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `date_completed` timestamp,
                report_id int(10),
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
        ',
    ];
}

//  run every query
foreach ($queries as $sql) {
    UdoitDB::query($sql);
}
