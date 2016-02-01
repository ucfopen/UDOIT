<?php
try {
    switch($db_type){
        case 'pgsql':
            return new PDO($dsn);
        case 'mysql':
            return new PDO($dsn, $db_user, $db_password);
        default:
            throw new \RuntimeException("Database type $db_type not supported.");
    }
} catch (\RuntimeException $e) {
    error_log("Database Connection Error");
    error_log($e->getMessage());
    echo 'Database Connection error';
}
