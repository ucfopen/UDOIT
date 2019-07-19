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
require_once('../config/settings.php');
global $logger;

$logger->addInfo('Loading saved reports');

switch (UdoitDB::$type) {
    case 'sqlite':
    case 'test':
        $sth = UdoitDB::prepare("SELECT id, strftime('YYYY-MM-DDTHH:MM:SSZ', date_run) as date, errors, suggestions FROM {$db_reports_table} WHERE course_id = :courseid ORDER BY date_run DESC");
        break;

    case 'pgsql':
        $sth = UdoitDB::prepare("SELECT id, to_char(date_run, 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as date, errors, suggestions FROM {$db_reports_table} WHERE course_id = :courseid ORDER BY date_run DESC");
        break;

    case 'mysql':
        $sth = UdoitDB::prepare("SELECT id, DATE_FORMAT(date_run, \"%Y-%m-%dT%TZ\") as date, errors, suggestions FROM {$db_reports_table} WHERE course_id = :courseid ORDER BY date_run DESC");
        break;

    default:
        $logger->addError('Unable to load reports: No database type specified');
        UdoitUtils::instance()->exitWithPageError('Unable to load reports: No database type specified.');
        break;
}

session_start();
$sth->bindValue(':courseid', $_SESSION['launch_params']['custom_canvas_course_id'], PDO::PARAM_INT);
UdoitUtils::$canvas_base_url = $_SESSION['base_url'];
session_write_close();

if (!$sth->execute()) {
    $logger->addError('Error loading saved reports: '.$sth->errorInfo());
    UdoitUtils::instance()->exitWithPartialError('Could not complete database query');
}

$reports = $sth->fetchAll();

// Add the test report if not in production mode
if (ENV_PROD !== $UDOIT_ENV) {
    $reports[] = [
        'id' => 'TEST',
        'user_id' => 0,
        'course_id' => 'TEST',
        'file_path' => 'reports/test.json',
        'date_run' => 'TEST: 1998 (when section 508 was ammended)',
        'errors'   => 64,
        'suggestions' => 32,
    ];
}

$templates = new League\Plates\Engine(__DIR__.'/../templates');
echo($templates->render('saved_reports', ['reports' => $reports]));
