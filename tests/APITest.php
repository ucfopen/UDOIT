<?php

require_once('../../config/localConfig.php');

class UfixitTest extends PHPUnit_Framework_TestCase
{

    public function setUp () {

        $_POST["main_action"]   = '';
        $_POST["content"]       = [];
        $_POST["course_id"]     = '';
        $_POST["context_label"] = 'UDOIT_TEST_COURSE';
        $_POST["context_title"] = 'UDOIT_TEST_COURSE';
        $_POST["test"]          = true;

        $_SESSION["valid"]      = false;
        $_SESSION["launch_params"] = [
            "custom_canvas_user_id"     => '0000000',
            "custom_canvas_course_id"   => '1234567',
            "context_label"             => 'UDOIT_TEST_COURSE',
            "context_title"             => 'UDOIT_TEST_COURSE'
        ];
        $_SESSION["api_key"]    = '';
        $_SESSION["progress"]   = '';

    }

    public function checkOutputBuffer() {
        $buffer         = ob_get_clean();
        $this->assertEquals('', $buffer);
    }

    public function testUdoitAPI_Pages () {

        $_POST['main_action']   = 'udoit';
        $_POST['content']       = ["pages"];

        ob_start();
        require('../../public/process.php');
        $this->checkOutputBuffer();

        $expected_errors        = ["imgHasAlt", "objectMustContainText", "cssTextHasContrast", "headersHaveText", "videosEmbeddedOrLinkedNeedCaptions"];
        $expected_warnings      = [];
        $expected_suggestions   = ["objectShouldHaveLongDescription", "objectInterfaceIsAccessible", "aSuspiciousLinkText"];        
        
        $actual_errors          = [];
        $actual_warnings        = [];
        $actual_suggestions     = [];

        foreach ($udoit_report->content->pages->items as $page) {
            foreach ($page->error as $error) {
                array_push($actual_errors, $error->type);
            }

            foreach ($page->warning as $warning) {
                array_push($actual_warnings, $warning->type);
            }

            foreach ($page->suggestion as $suggestion) {
                array_push($actual_suggestions, $suggestion->type);
            }
        }

        $diff_errors            = array_diff( $expected_errors, $actual_errors );
        $diff_warnings          = array_diff( $expected_warnings, $actual_warnings );
        $diff_suggestions       = array_diff( $expected_suggestions, $actual_suggestions );

        // Verify the correct number of page(s)/error(s)/warning(s)/suggestion(s) were found
        $this->assertCount(1, $udoit_report->content->pages->items);
        $this->assertEquals(5, $udoit_report->total_results->errors);
        $this->assertEquals(0, $udoit_report->total_results->warnings);
        $this->assertEquals(3, $udoit_report->total_results->suggestions);

        // Verify the actual error(s)/warning(s)/suggestion(s) match the programmed issues
        $this->assertCount(0, $diff_errors);
        $this->assertCount(0, $diff_warnings);
        $this->assertCount(0, $diff_suggestions);
    }


    public function tearDown () {
        unset($_POST);
        unset($_SESSION);
    }

}

?>