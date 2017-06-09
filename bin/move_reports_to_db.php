<?php
/**
*   Copyright (C) 2014 University of Central Florida, created by Jacob Bates, Eric Colon, Fenel Joseph, and Emily Sachs.
*
*   This program is free software: you can redistribute it and/or modify
*   it under the terms of the GNU General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.
*
*   This program is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU General Public License for more details.
*
*   You should have received a copy of the GNU General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
*   Primary Author Contact:  Jacob Bates <jacob.bates@ucf.edu>
*/

require_once(__DIR__.'/../config/settings.php');
$dbh = include(__DIR__.'/../lib/db.php');

$rows = $dbh->query("SELECT * FROM {$db_reports_table}")->fetchAll();

if( ! isset($rows[0]['file_path']))
{
	exit("It looks like this script doesnt need to be run");
}

if( ! isset($rows[0]['report_json']))
{
	// Quick hack to add report column since we dont have migrations yet
	$column_type = $db_type == 'mysql' ? 'MEDIUMTEXT' : 'TEXT';
	$dbh->query("ALTER TABLE {$db_reports_table} ADD report_json {$column_type}");
}

$sth = $dbh->prepare("UPDATE {$db_reports_table} set report_json = :report_json WHERE id = :id");
$count_moved = 0;

foreach ($rows as $row)
{
	if(empty($row['file_path'])) continue;

	$file = __DIR__. '/'. $row['file_path'];
	if( ! file_exists($file)){
		echo("Json file not found {$file} for report id: {$row['id']}\n");
		continue;
	}

	$json = file_get_contents($file);

	if(empty($json)) continue;

	$sth->bindValue(':report_json', $json, PDO::PARAM_STR);
	$sth->bindValue(':id', $row['id'], PDO::PARAM_INT);
	$res = $sth->execute();

	if(!$res){
		echo("Failed inserting report for {$row['id']}");
		continue;
	}

	$count_moved++;
}

$dbh->query("ALTER TABLE {$db_reports_table} DROP COLUMN file_path");
echo("Moved {$count_moved} reports from disk to the database. Feel free to delete the reports directory");
