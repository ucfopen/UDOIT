<?php

global $db_type;
global $consumer_key;
global $shared_secret;

if ('sqlite' === $db_type || 'test' === $db_type) {
    // SQLITE (mostly for testing)
    $tables[] = '
        CREATE TABLE IF NOT EXISTS institutes (
            domain varchar(255),
            consumer_key varchar(255),
            shared_secret varchar(255),
            date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP
            developer_id varchar(255) NOT NULL,
            developer_key varchar(255) NOT NULL,
            data text NOT NULL,
        );
    ';
}

if ('pgsql' === $db_type) {
    // POSTGRESQL
    echo("Setting up institutes table in PostgreSQL\r\n");
    $tables[] = '
        CREATE TABLE IF NOT EXISTS institutes (
            domain varchar(255),
            consumer_key varchar(255),
            shared_secret varchar(255),
            developer_id varchar(255) NOT NULL,
            developer_key varchar(255) NOT NULL,
            data text NOT NULL,
            date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP
        );
    ';
}

if ('mysql' === $db_type) {
    // MYSQL
    echo("Setting up institutes table in MySQL\r\n");
    $tables[] = '
        CREATE TABLE IF NOT EXISTS institutes (
            `domain` varchar(255) NOT NULL,
            `consumer_key` varchar(255) NOT NULL,
            `shared_secret` varchar(255) NOT NULL,
            `developer_id` varchar(255) NOT NULL,
            `developer_key` varchar(255) NOT NULL,
            `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `data` text NOT NULL,
            UNIQUE KEY `domain_key` (`domain`, `consumer_key`)
        ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
    ';
}

//  run every query
foreach ($tables as $sql) {
    UdoitDB::query($sql);
}
