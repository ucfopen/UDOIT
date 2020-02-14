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

    exit("<script>window.history.back(2); </script>");
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>UDOIT on Safari</title>
    <script>
        window.onload = (event) => {
            let launchBtn = document.getElementById("launch-btn");
            launchBtn.onclick = (evt) => {
                //Display setup complete message
                let msg = document.getElementById("msg");
                msg.innerHTML = "Setup complete!  Please refresh this page to use U<strong>DO</strong>IT.";

                //Hide the setup button
                let launchBtn = document.getElementById("launch-btn");
                launchBtn.classList.add("hidden");
            }
        }
    </script>
</head>
<body>
    <style type="text/css">
        .wrapper {
            text-align: center;
            margin: 50px;
        }

        .msg {
            margin-bottom: 50px;
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

        .hidden {
            display: none;
            visibility: hidden;
        }
    </style>
    <div class="wrapper">
        <img src="assets/img/udoit_logo.png" width="200" alt="UDOIT logo" />
        <h2>Welcome to U<strong>DO</strong>IT on Safari</h2>
        <p id="msg" class="msg">Please click the button below to set up this tool for use with Safari.</p>
        <a id="launch-btn" href="safari_fix.php?redirect=true" target="_parent" class="button">
            Setup U<strong>DO</strong>IT
        </a>
    </div>
</body>
</html>
