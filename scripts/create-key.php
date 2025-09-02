<?php

// create a base64-encoded key using sodium (should usually be 44 characters long)
function createKey() {
    $key = sodium_crypto_secretbox_keygen();
    $final = base64_encode($key);

    return $final;
}

// modify an env file to include the new key
function updateEnvFile($envFile, $newKey) {
    $envContent = file_get_contents($envFile);

    // if DATABASE_ENCODE_KEY doesn't exist, then create the line and set it to the new key
    if (!preg_match('/^DATABASE_ENCODE_KEY=".*"$/m', $envContent)) {
        $envContent .= 'DATABASE_ENCODE_KEY="' . $newKey . '"' . PHP_EOL;
    }
    // otherwise, just replace DATABASE_ENCODE_KEY
    else {
        $envContent = preg_replace('/^DATABASE_ENCODE_KEY=".*"$/m', 'DATABASE_ENCODE_KEY="' . $newKey . '"', $envContent);
    }
    
    file_put_contents($envFile, $envContent);

    print("Updated $envFile with new key.\n");
}

// first argument should be the env file we want to modify

if (!empty($argv[1])) {
    $envFile = $argv[1];
    if (strtolower(readline("Create new key? (Y/n): ")) == 'y') {
        $newKey = createKey();

        print("Created new key: $newKey\n");

        updateEnvFile($envFile, $newKey);
    }
}
else {
    print("Please specify the environment file to modify!\n");
}

?>