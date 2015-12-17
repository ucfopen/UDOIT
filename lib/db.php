<?php

try {
	switch(Config::DB_TYPE){
		case 'pgsql':
			return new PDO(Config::DSN);
		case 'mysql':
			return new PDO(Config::DSN, Config::DB_USER, Config::DB_PASSWORD);
		default:
			throw new \RuntimeException("Database type Config::DB_TYPE not supported.");
	}
} catch (\RuntimeException $e) {
    echo 'Connection failed: ' . $e->getMessage();
}
