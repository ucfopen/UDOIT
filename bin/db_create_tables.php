<?php

require_once(__DIR__.'/../config/settings.php');
$dbh = include(__DIR__.'/../lib/db.php');

if ($db_type == 'pgsql'){
    // POSTGRESQL
    $createReportsSQL = '
        CREATE TABLE IF NOT EXISTS reports (
          id SERIAL PRIMARY KEY,
          user_id integer,
          course_id integer,
          report_json text,
          date_run timestamp with time zone,
          errors integer,
          suggestions integer
        );';

    $createUsersSQL = '
        CREATE TABLE IF NOT EXISTS users (
          id integer CONSTRAINT users_pk PRIMARY KEY,
          api_key varchar(255),
          date_created timestamp with time zone
        );';
}
else{
    // MYSQL
    $createReportsSQL = '
        CREATE TABLE IF NOT EXISTS `reports` (
          `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
          `user_id` int(10) unsigned NOT NULL,
          `course_id` int(10) unsigned NOT NULL,
          `report_json` MEDIUMTEXT NOT NULL,
          `date_run` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          `errors` int(10) unsigned NOT NULL,
          `suggestions` int(10) unsigned NOT NULL,
          PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=latin1;';

    $createUsersSQL = '
        CREATE TABLE IF NOT EXISTS `users` (
          `id` int(10) unsigned NOT NULL,
          `api_key` varchar(255) NOT NULL,
          `date_created` date NOT NULL,
          PRIMARY KEY (`id`),
          UNIQUE KEY `id` (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=latin1;';
}

$dbh->query($createReportsSQL)->execute();
$dbh->query($createUsersSQL)->execute();
