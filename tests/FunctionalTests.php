<?php
// TODO: Figure out a way to not load these here.  Tests should be self-contained.
// That requires rewriting and restructuring the project, so we're compromising for now.
include_once('lib/quail/quail/common/services/media/youtube.php');
include_once('config/settings.php');

class FunctionalTests extends PHPUnit_Framework_TestCase
{
    // public function setUp () {

    // }

    // public function tearDown () {

    // }

    // private function checkOutputBuffer() {
    //     $buffer         = ob_get_clean();
    //     $this->assertEquals('', $buffer);
    // }

    /* Tests the youtube api call to make sure a video with captions is detected as having captions */
    public function testYouTubeAPIHasCaptions() {
        $vid_url = 'https://www.youtube.com/watch?v=zo6aRvf-l_s';

        $yt_service = new youtubeService();
        $captions_missing = $yt_service->captionsMissing($vid_url);

        $this->assertFalse($captions_missing);
    }

    /* Tests the youtube api call to make sure a video without captions is detected as not having captions */
    public function testYouTubeAPINoCaptions() {
        $vid_url = 'https://www.youtube.com/watch?v=nBH89Y0Xj7c';

        $yt_service = new youtubeService();
        $captions_missing = $yt_service->captionsMissing($vid_url);

        $this->assertTrue($captions_missing);
    }
}