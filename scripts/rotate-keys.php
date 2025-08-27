<?php

// decrypt encrypted data (e.g. API keys) using $encodedKey
function decryptKey($encodedKey, $encrypted) {
    $key = base64_decode($encodedKey);
    $decoded = base64_decode($encrypted);
    $nonce   = mb_substr($decoded, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES, '8bit');
    $encrypted_text = mb_substr($decoded, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES, NULL, '8bit');

    $decrypted = sodium_crypto_secretbox_open($encrypted_text, $nonce, $key);

    return $decrypted;
}

// encrypt raw data (e.g. API keys) using $encodedKey
function encryptKey($encodedKey, $data) {
        $key = base64_decode($encodedKey);
        $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
        $encrypted_data = sodium_crypto_secretbox($data, $nonce, $key);

        $final = base64_encode($nonce . $encrypted_data);

        return $final;
}

// create a base64-encoded key using sodium (should usually be 44 characters long)
function createKey() {
    $key = sodium_crypto_secretbox_keygen();
    $final = base64_encode($key);

    return $final;
}

function replaceKey($oldEncodedKey, $newEncodedKey, $table, $host, $username, $password, $database, $port) {
    // for the table "users", the column we want to change is called "api_key",
    // while in "institution" its called "api_client_secret"
    $keyColumn = ($table == "users") ? "api_key" : "api_client_secret";

    $dsn = "mysql:host=$host;port=$port;dbname=$database;charset=utf8mb4";
    try {
        $pdo = new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);

        $pdo->beginTransaction();

        $sql_select = "SELECT * FROM $table";
        $stmt = $pdo->query($sql_select);
        $rows = $stmt->fetchAll();

        if (count($rows) > 0) {
            foreach ($rows as $row) {
                if (!empty($row[$keyColumn])) {
                    print("\n_______\n\n");
                    print_r($row);

                    print("* Old " . $keyColumn . ": " . $row[$keyColumn] . "\n");

                    try {
                        $decryptedKey = decryptKey($oldEncodedKey, $row[$keyColumn]);
                    } catch (SodiumException $e) {
                        echo "\nAn error occured when trying to decrypt the key! The decryption key you entered might be incorrect. Ensure it is a base64-encoded string (usually 44 characters long).\n";
                        $decryptedKey = null;
                    }

                    if (empty($decryptedKey)) {
                        print("\nFailed to decrypt! Either the key in the database may not be encrypted or the decryption key you entered is incorrect. Skipping...\n");
                        continue;
                    }
                    print("\n* Decrypted " . $keyColumn . ": " . $decryptedKey . "\n\n");

                    $encryptedKey = encryptKey($newEncodedKey, $decryptedKey);
                    print("* New " . $keyColumn . ": " . $encryptedKey . "\n");

                    print("\n* Sanity Check (Decryption using new database key): " . decryptKey($newEncodedKey, $encryptedKey) . "\n");

                    print("_______\n\n");

                    $sql_update = "UPDATE $table SET $keyColumn = :encryptedKey WHERE id = :id";
                    // echo "\n" . $sql_update . "\n";

                    $updateStmt = $pdo->prepare($sql_update);
                    $updateStmt->execute([
                        ':encryptedKey' => $encryptedKey,
                        ':id' => $row['id'],
                    ]);
                } else {
                    print_r("No key found! Skipping...");
                }
            }
        }

        $valid = false;
        while ($valid == false) {
            $in = readline("\nFinished modifying " . $table . ". Commit changes? (Y/n) ");

            switch ($in) {
                case "Y":
                case "y":
                    echo "\nCommitting changes to your database...\n";
                    $pdo->commit();
                    $valid = true;
                    break;
                case "N":
                case "n":
                    $pdo->rollBack();
                    echo "\nNo changes have been made to your database.\n";
                    $valid = true;
                    break;
                default:
                    echo "\nUnknown option!\n";
                    break;
            }
        }

        $pdo = null;
    } catch (Exception $e) {
        print("Error: " . $e->getMessage() . "\n");
        return array();
    }
}

// database variables
$host;
$username;
$password;
$database;
$port;

$valid = false;
while ($valid == false) {
    // if running makefile and docker, we should have the HOST_ADDR env variable set to the ip address of the udoit3-db container
    $host = $argv[1];

    if (empty($host)) {
        $host = readline("Enter IP address of UDOIT: ");
    }
    else {
        echo "\nFound IP address of udoit3-db container: " . $host . "\n";
    }

    $username = readline('Enter admin username of UDOIT database (default is "root"): ');
    if (empty($username)) {
        $username = "root";
    }

    $password = readline('Enter admin password of UDOIT database (default is "root"): ');
    if (empty($password)) {
        $password = "root";
    }

    $database = readline('Enter database name (default is "udoit3"): ');
    if (empty($database)) {
        $database = "udoit3";
    }

    $port = readline('Enter UDOIT database port (default is "3306"): ');
    if (empty($port)) {
        $port = 3306;
    }

    echo "\n****************";
    echo "\nIP Address: " . $host;
    echo "\nUsername:   " . $username;
    echo "\nPassword:   " . $password;
    echo "\nDatabase:   " . $database;
    echo "\nPort:       " . $port;
    echo "\n****************\n\n";


    $in = readline("Is the database information correct? (Y/n): ");
    switch ($in) {
        case 'Y':
        case 'y':
            try {
                // test the database connection
                $dbTest = new PDO("mysql:host=$host;port=$port;dbname=$database;charset=utf8mb4", $username, $password);
                echo "\nSuccessfully connected to database!\n";
                $dbTest = null;
                $valid = true;
            }
            catch (PDOException $e) {
                echo "\nUnable to connect to database: " . $e->getMessage() . "\n\n";
                $valid = false;
            }
            break;
        default:
            break;
    }
    
}

$valid = false;
while ($valid == false) {
    $oldEncodeKey = readline("Enter old encryption key: ");

    echo "\nEntered: \n" . $oldEncodeKey . "\n";
    $in = readline("\nAre you sure this is correct? Make ABSOLUTELY sure it is, otherwise your keys may be lost forever! (Y/n) ");
    
    switch ($in) {
        case "Y":
        case "y":
            $valid = true;
            break;
        default:
            break;
    }
}

$newEncodeKey = createKey();

// creating new key to replace old one that was previously hardcoded...
echo "\n****************\n";
echo "CREATED NEW KEY:\n";
echo $newEncodeKey;
echo "\n****************\n\n";

// $keyFile = fopen("key.txt", "w") or die("Unable to write key to file!");
// fwrite($keyFile, $newEncodeKey);
// fclose($keyFile);

echo "Please save this key into your .env file now!\n";
echo "If not, UDOIT will not be able to properly decode your keys when you run this script.\n";
readline("Press enter to continue. ");

if (!empty($oldEncodeKey) && !empty($newEncodeKey)) {
    echo "\n****************\n";
    echo "WORKING ON institution TABLE";
    echo "\n****************\n";
    replaceKey($oldEncodeKey, $newEncodeKey, "institution", $host, $username, $password, $database, $port);

    echo "\n****************\n";
    echo "WORKING ON users TABLE";
    echo "\n****************\n";
    replaceKey($oldEncodeKey, $newEncodeKey, "users", $host, $username, $password, $database, $port);
}


?>
