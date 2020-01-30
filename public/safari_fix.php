<?php
header('P3P: CP="CAO PSA OUR"');

function createCookie($options)
{
    $name = $options['name'];
    $value = $options['value'];
    $expire = isset($options['expire']) ? $options['expire'] : 0;
    $path = isset($options['path']) ? $options['path'] : '/';
    $domain = isset($options['domain']) ? $options['domain'] : null;
    $secure = isset($options['secure']) ? $options['secure'] : true;
    $httponly = isset($options['httponly']) ? $options['httponly'] : false;
    if (PHP_VERSION_ID < 70300) {
        setcookie($name, $value, $expire, "$path; samesite=None", $domain, $secure, $httponly);
    } else {
        setcookie($name, $value, [
            'expires' => $expire,
            'path' => $path,
            'domain' => $domain,
            'samesite' => 'None',
            'secure' => $secure,
            'httponly' => $httponly,
        ]);
    }
}

$get = filter_input_array(INPUT_GET);
if (isset($get['redirect'])) {
    createCookie([
        'name' => 'safari_cookie_fix',
        'value' => 'fixed',
    ]);

    print "<script>window.history.back(2); </script>";
    exit;
}
?>
<!DOCTYPE html>
<html>
<body>
    <style type="text/css">
        .wrapper {
            text-align: center;
            margin: 50px;
        }

        .button {
            margin: 10px;
            padding: 10px 20px;
            border: 1px solid #AAA;
            border-radius: 5px;
            color: #333;
            font-size: 1.4em;
            text-decoration: none;
        }
    </style>
    <div class="wrapper">
        <img src="assets/img/udoit_logo.png" width="200" alt="UDOIT logo" />
        <h2>Welcome to U<strong>DO</strong>IT on Safari</h2>
        <p>Please click the button below to refresh this page, so we can overcome some minor issues Safari has with embedded LTI tools.</p>
        <p>&nbsp;</p>
        <a href="safari_fix.php?redirect=true" target="_parent" class="button">
            Launch U<strong>DO</strong>IT
        </a>
    </div>
</body>
</html>
