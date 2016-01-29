<?php
require_once('config/settings.php');

$reports_sql = "CREATE TABLE IF NOT EXISTS {$db_reports_table} (
  id SERIAL PRIMARY KEY,
  user_id integer,
  course_id integer,
  file_path text,
  date_run bigint,
  errors integer,
  suggestions integer
);";

$users_sql = "CREATE TABLE IF NOT EXISTS {$db_user_table} (
  id integer CONSTRAINT users_pk PRIMARY KEY,
  api_key varchar(255),
  date_created integer
);";

$dbh = include('lib/db.php');
$sth = $dbh->query($reports_sql);
$sth->execute();

$sth = $dbh->query($users_sql);
$sth->execute();
