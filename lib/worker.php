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

if (php_sapi_name() !== "cli") {
    $msg = 'This worker can only be run on the command line.';
    $logger->addError($msg);
    echo($msg);
}

while (true) {
    // run the next job
    UdoitJob::runNextJob();

    // take a nap if there's no more work to do
    if (UdoitJob::countJobsRemaining() < 1) {
        UdoitDB::disconnect(); // allow the db to disconnect
        sleep($worker_sleep_seconds);
    } else {
        sleep(1);
    }
}
