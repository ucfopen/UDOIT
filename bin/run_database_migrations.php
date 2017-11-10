<?php

require_once(__DIR__.'/../config/settings.php');
$migrations_dir = __DIR__.'/../migrations/';

$files = scandir($migrations_dir, SCANDIR_SORT_ASCENDING);
$files = array_diff($files, ['..', '.']);

foreach ($files as $file) {
    include($migrations_dir.DIRECTORY_SEPARATOR.$file);
}
