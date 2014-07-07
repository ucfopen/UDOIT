<?php
include_once('config/localConfig.php');
include_once('app/curlClass.php');
include_once('app/ims-blti/blti.php');

error_reporting(E_ALL & ~E_NOTICE);
ini_set("display_errors", 1);
session_start();
header('Content-Type: text/html; charset=utf-8');

// Initialize, all secrets are 'secret', do not set session, and do not redirect
$context = new BLTI($consumer_key, $shared_secret_key, false, false);
//if the oauth is valid
if($context->valid) {

     if(!isset($_SESSION['launch_params']['custom_canvas_user_id'])) {

        $_SESSION['launch_params']['custom_canvas_user_id'] = $_POST['custom_canvas_user_id'];
        $_SESSION['launch_params']['custom_canvas_course_id'] = $_POST['custom_canvas_course_id'];
        // echo "Session has been set";

    } else {
        //session was already set
    }

} else {
    echo '
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>UDOIT Accessibility Checker</title>
        <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css" />
        <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap-theme.min.css" />
    </head>
    <body>
        <div style="padding: 12px;">
            <div class="alert alert-danger">
                <span class="glyphicon glyphicon-exclamation-sign"></span> Authentication problem, please ensure that your instance of UDOIT is configured correctly.
            </div>
        </div>
    </body>
</html>
    ';
    die();
}
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>UDOIT Accessibility Checker</title>
        <link rel="icon" type="image/png" href="favicon.ico">
        <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css" />
        <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap-theme.min.css" />
        <link href='https://fonts.googleapis.com/css?family=Sonsie+One' rel='stylesheet' type='text/css'>
        <link href="assets/css/main.css" type="text/css" rel="stylesheet" media="screen" />
        <link href="assets/css/print.css" type="text/css" rel="stylesheet" media="print"/>
    </head>
    <body>
        <div class="container">
            <header id="mainHeader" class="navbar navbar-default center">
                <h1 class="logo">UDOIT</h1>
            </header>
            <main id="contentWrapper" role="main">
                <form id="udoitForm" method="post" class="form-horizontal no-print" action="app/checker.php" role="form">
                    <div class="form-group">
                        <span class="col-sm-2 control-label"><strong>Select content:</strong></span>
                        <div class="col-sm-10">
                            <div class="checkbox">
                                <label><input type="checkbox" value="all" id="allContent" class="content" name="content[]" checked> All</label>
                            </div>
                            <hr />
                            <div class="checkbox">
                                <label><input type="checkbox" value="announcements" class="content" name="content[]" checked> Announcements</label>
                            </div>
                            <div class="checkbox">
                                <label><input type="checkbox" value="assignments" class="content" name="content[]" checked> Assignments</label>
                            </div>
                            <div class="checkbox">
                                <label><input type="checkbox" value="discussions" class="content" class="content" name="content[]" checked> Discussions</label>
                            </div>
                            <div class="checkbox">
                                <label><input type="checkbox" value="files" class="content" name="content[]" checked> Files</label>
                            </div>
                            <div class="checkbox">
                                <label><input type="checkbox" value="pages" class="content" name="content[]" checked> Pages</label>
                            </div>
                        </div>
                    </div>
                    <input id="baseUrl" type="hidden" value="<? echo $base_url; ?>">
                    <input id="apiKey" type="hidden" value="<? echo $api_key; ?>">
                    <input id="instructor" type="hidden" value="<? echo $_POST['custom_canvas_user_id']; ?>">
                    <input id="course" type="hidden" value="<? echo $_POST['custom_canvas_course_id']; ?>">
                    <hr />
                    <button id="submit" type="submit" name="course_submit"  class="btn btn-block btn-lg btn-success">Run scanner</button>
                </form>
            </main>
        </div>
        <script type="text/javascript" src="assets/js/jquery.js"></script>
        <script type="text/javascript" src="assets/js/default.js"></script>
        <script type="text/javascript" src="assets/js/chooser.js"></script>
    </body>
</html>
