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

global $db_reports_table;
global $db_type;
$col_to_add = 'report_json';

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

// if 'file_path' col is missing, there's nothing to do
if (!$check_for_column($db_reports_table, 'file_path')) {
    if (!getenv('UNITTEST')) {
        echo("It looks like this script doesnt need to be run");
    }

    return;
}

// add the column if it's missing
if (!$check_for_column($db_reports_table, $col_to_add)) {
    // Quick hack to add report column since we dont have migrations yet
    $column_type = $db_type == 'mysql' ? 'MEDIUMTEXT' : 'TEXT';
    UdoitDB::query("ALTER TABLE {$db_reports_table} ADD {$col_to_add} {$column_type}");
}

// exit with warning if the column is still missing
if (!check_for_column($dbh, $db_reports_table, $col_to_add)) {
    if (!getenv('UNITTEST')) {
        echo("The migration script failed to create a ${col_to_add} column");
    }

    return;
}

// Grab all rows from the reports table
if ($rows = UdoidDB::query('SELECT * FROM reports')) {
    $rows = $rows->fetchAll();
}

// now move the reports from the report files into the database
$sth = UdoitDB::prepare("UPDATE {$db_reports_table} set {$col_to_add} = :report_json WHERE id = :id");
$count_moved = 0;

foreach ($rows as $row) {
    if (empty($row['file_path'])) {
        continue;
    }

    $file = __DIR__.'/'.$row['file_path'];
    if (!file_exists($file)) {
        echo("Json file not found {$file} for report id: {$row['id']}\n");
        continue;
    }

    $json = file_get_contents($file);

    if (empty($json)) {
        continue;
    }

    $sth->bindValue(':report_json', $json, PDO::PARAM_STR);
    $sth->bindValue(':id', $row['id'], PDO::PARAM_INT);
    $res = $sth->execute();

    if (!$res) {
        print_r($sth->errorInfo());
        echo("Failed inserting report for {$row['id']}\n");
        continue;
    }

    $count_moved++;
}

UdoitDB::query("ALTER TABLE {$db_reports_table} DROP COLUMN file_path");
echo("Moved {$count_moved} reports from disk to the database. Feel free to delete the reports directory\n");
