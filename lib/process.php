<?php
require_once('../config/localConfig.php');
require_once('../core/quail/quail.php');
require('../vendor/autoload.php');
include 'UDoIt.php';
include 'UFixIt.php';

use Httpful\Request;

// check if course content is being scanned or fixed
switch ($_POST['main_action']) {
    case 'udoit':
        // for saving this report later
        session_start();
        $user_id = $_SESSION['launch_params']['custom_canvas_user_id'];
        session_write_close();

        // UDOIT can't scan what isn't selected
        if ($_POST['content'] === 'none') {
            die('<div class="alert alert-danger no-margin margin-top"><span class="glyphicon glyphicon-exclamation-sign"></span> Please select which course content you wish to scan above.</div>');
        }

        session_start();
        $data = [
            'api_key'       => $_SESSION['api_key'],
            'base_uri'      => $base_url,
            'content_types' => $_POST['content'],
            'course_id'     => $_SESSION['launch_params']['custom_canvas_course_id']
        ];
        session_write_close();

        $udoit = new UDoIt($data);
        $udoit->buildReport();

        $to_encode = [
            'course'        => $_SESSION['launch_params']['context_title'],
            'total_results' => $udoit->total_results,
            'content'       => $udoit->bad_content,
        ];
        $encoded_report   = json_encode($to_encode);
        $report_directory = '../reports/'.$user_id.'/'.$to_encode['course'];

        // rrmdir('../reports/'.$user_id);
        // die();

        if (!file_exists($report_directory)) {
            mkdir($report_directory, 0777, true);
            chmod('../reports/'.$user_id, 0777);
            chmod($report_directory, 0777);
        }

        $file = $report_directory.'/'.date('Y_m_d__g:i_a').'.json';

        file_put_contents($file, $encoded_report);
        chmod($file, 0777);

        // saves the report to the database
        $dsn = "mysql:dbname=$db_name;host=$db_host";

        try {
            $dbh = new PDO($dsn, $db_user, $db_password);
        } catch (PDOException $e) {
            echo 'Connection failed: ' . $e->getMessage();
        }

        $sth = $dbh->prepare("
            INSERT INTO
                $db_reports_table
            SET
                user_id=:userid,
                course_id=:courseid,
                file_path=:filepath,
                date_run=NOW(),
                errors=:errors,
                suggestions=:suggestions
        ");
        $sth->bindParam(':userid', $user_id, PDO::PARAM_INT);
        $sth->bindParam(':courseid', $data['course_id'], PDO::PARAM_INT);
        $sth->bindParam(':filepath', $file, PDO::PARAM_STR);
        $sth->bindParam(':errors', $udoit->total_results['errors'], PDO::PARAM_STR);
        $sth->bindParam(':suggestions', $udoit->total_results['suggestions'], PDO::PARAM_STR);

        if (!$sth->execute()) {
            die('Ya done goof\'d');
        }

        $udoit_report = json_decode($encoded_report);

        require 'parseResults.php';

        break;
    case 'ufixit':
        $annoying_entities    = ["\n", "\r", " &Acirc;&nbsp;"];
        $entitie_replacements = ["", "", "  "];

        $data = [
            'base_uri'     => $base_url,
            'content_id'   => $_POST['contentid'],
            'content_type' => $_POST['contenttype'],
            'error_html'   => str_replace($annoying_entities, $entitie_replacements, $_POST['errorhtml']),
            'error_colors' => isset($_POST['errorcolor']) ? $_POST['errorcolor'] : '',
            'error_type'   => $_POST['errortype'],
            'new_content'  => $_POST['newcontent']
        ];

        session_start();

        $data['course_id'] = $_SESSION['launch_params']['custom_canvas_course_id'];
        $data['api_key']   = $_SESSION['api_key'];

        session_write_close();

        $ufixit = new UFixIt($data);

        $submitting_again = false;

        // fixes content based on what the error is
        switch ($data['error_type']) {
            case 'cssTextHasContrast':
                $corrected_error = $ufixit->fixCss($data['error_colors'], $data['error_html'], $data['new_content'], $submitting_again);
                break;
            case 'imgHasAlt':
            case 'imgNonDecorativeHasAlt':
                $data['error_html'] = str_replace('alt=""', 'alt', $data['error_html']);
                $corrected_error    = $ufixit->fixAltText($data['error_html'], $data['new_content'], $submitting_again);
                break;
            case 'tableThShouldHaveScope':
                $corrected_error = $ufixit->fixTableThScopes($data['error_html'], $data['new_content'], $submitting_again);
                break;
        }

        // uploads the fixed content
        switch ($data['content_type']) {
            case 'announcements':
            case 'discussions':
                $ufixit->uploadFixedDiscussions($corrected_error, $data['error_html']);
                break;
            case 'assignments':
                $ufixit->uploadFixedAssignments($corrected_error, $data['error_html']);
                break;
            case 'files':
                break;
            case 'pages':
                $ufixit->uploadFixedPages($corrected_error, $data['error_html']);
                break;
            case 'syllabus':
                $ufixit->uploadFixedSyllabus($corrected_error, $data['error_html']);
                break;
        }

        break;
}

function rrmdir($dir) {
   if (is_dir($dir)) {
     $objects = scandir($dir);
     foreach ($objects as $object) {
       if ($object != "." && $object != "..") {
         if (filetype($dir."/".$object) == "dir") rrmdir($dir."/".$object); else unlink($dir."/".$object); 
       }
     }
     reset($objects);
     rmdir($dir);
   }
}