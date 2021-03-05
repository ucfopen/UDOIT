<?php

namespace App\Tests\Services;

use App\Services\HtmlService;
use PHPUnit\Framework\TestCase;

class HtmlServiceTest extends TestCase
{
    public function testSimpleCleanPass()
    {
        $html = $this->getSimpleHtml();
        $cleanHtml = HtmlService::clean($html);

        $this->assertStringContainsString('<img', $cleanHtml, 'Successfully cleaned HTML.');
        $this->assertNotEquals($cleanHtml, $html, 'Simple HTML was repaired.');        
    }

    public function testInvalidCleanPass()
    {
        $html = $this->getInvalidHtml();
        $cleanHtml = HtmlService::clean($html);

        $this->assertStringContainsString('<style', $cleanHtml, 'Style tags not removed.');
        $this->assertStringContainsString('<body', $cleanHtml, 'Body tag not removed.');
        $this->assertNotEquals($cleanHtml, $html, 'Invalid HTML was repaired.');
    }

    public function testScriptCleanPass()
    {
        $html = $this->getScriptHtml();
        $cleanHtml = HtmlService::clean($html);

        $this->assertStringContainsString('<script', $cleanHtml, 'Script tag not removed.');
        $this->assertNotEquals($cleanHtml, $html, 'Script HTML was repaired.');
    }

    public function testDomPass()
    {
        $html = $this->getSimpleHtml();
        $cleanHtml = HtmlService::dom($html);

        $this->assertStringContainsString('<img', $cleanHtml, 'Successfully cleaned HTML.');
    }

    public function testTidyPass()
    {
        $html = $this->getSimpleHtml();
        $cleanHtml = HtmlService::tidy($html);

        $this->assertStringContainsString('<img', $cleanHtml, 'Successfully cleaned HTML.');
    }

    protected function getSimpleHtml()
    {
        return '<p> <img src="/local_file.jpg" alt="Image alt goes here" /></p>
            <p><strong>This is an example of what a header shouldn\'t look like!</strong>';
    }

    protected function getInvalidHtml()
    {
        return file_get_contents('./tests/Services/invalid.html');
    }

    protected function getScriptHtml()
    {
        return '<div class="container-fluid"> <div class="row"> 
            <div class="col-12 banner-img"> <p> 
            <img src="https://cidilabs.d2l-partners.brightspace.com/shared/Course%20File%20Templates/Standard/pages/../_assets/img/banner_04.jpg" alt="banner"></p> </div> 
            <div class="col-sm-10 offset-sm-1"> <h1> Video Lecture</h1> <p> This is an example of a file created in Brightspace.</p> <p> <strong> The HTML editor is packed full of features...</strong></p> 
            <ul> <li> The "Insert Stuff" button gives you access to media and integrations.</li> <li> To add an image, use the "Insert Image" button, or just drag and drop.</li> <li> Click on the "Insert Quicklink" button to link content or activities.</li> <li> Click on the "Check Accessibility" button on the bottom right of the window to check for ADA compliancy.</li> </ul> 
            <p> The Video page layout includes an embedded YouTube video, which can scale in any browser or mobile device. Embedding videos in the page is a great way to present video content, while accompanying it with supporting context, explanations and activities.</p> <div class="video-wrapper"> <div class="embed-responsive embed-responsive-16by9"> 
            <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/sEYVxRPLioE?wmode=opaque" allowfullscreen="true"> </iframe></div> <div class="video-text"> <p> Direct Link: <a href="https://youtu.be/sEYVxRPLioE" class="new-window" target="_blank" id="new-window0" data-original-title="opens in new window/tab" data-toggle="tooltip" rel="noopener"> Create a File and Insert Stuff<span class="sr-only">(this link opens in a new window/tab)</span></a></p> </div> </div> 
            <h2> Replace Video</h2> <p> To replace the video,</p> <ol> <li> Delete the video, and leave the cursor in-place. To do so: <ol type="a"> <li> click on the video and pause it</li> <li> carefully click the area preceding (left of) the video within the colored video container</li> <li> hit the Delete key</li> </ol> </li> <li> Click the <strong> Insert Stuff</strong> icon</li> <li> Do one of the following: <ul> <li> Select <strong> YouTube</strong>, search for your video; or</li> <li> Select <strong> Enter Embed Code</strong>, paste in the YouTube video embed code</li> </ul> </li> </ol> </div> 
            <div class="col-12"> <footer> <p> <img src="https://cidilabs.d2l-partners.brightspace.com/shared/Course%20File%20Templates/Standard/pages/../_assets/img/logo.png" alt="logo"></p> </footer> </div> </div> </div> <script src="https://cidilabs.d2l-partners.brightspace.com/shared/Course%20File%20Templates/Standard/pages/../_assets/thirdpartylib/jquery/jquery-3.3.1.slim.min.js"></script>  
            <script src="https://cidilabs.d2l-partners.brightspace.com/shared/Course%20File%20Templates/Standard/pages/../_assets/thirdpartylib/popper-js/popper.min.js"></script>  
            <script src="https://cidilabs.d2l-partners.brightspace.com/shared/Course%20File%20Templates/Standard/pages/../_assets/thirdpartylib/bootstrap-4.3.1/js/bootstrap.min.js"></script> 
            <!-- Template JavaScript --> <script src="https://cidilabs.d2l-partners.brightspace.com/shared/Course%20File%20Templates/Standard/pages/../_assets/js/scripts.min.js"></script>';
    }
}
