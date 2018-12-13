<?php
/**
*   Copyright (C) 2014 University of Central Florida, created by Jacob Bates, Eric Colon, Fenel Joseph, and Emily Sachs.
*
*   This program is free software: you can redistribute it and/or modify
*   it under the terms of the GNU General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.
*
*   This program is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU General Public License for more details.
*
*   You should have received a copy of the GNU General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
*   Primary Author Contact:  Jacob Bates <jacob.bates@ucf.edu>
*/



// TODO: Figure out a way to not load these here.  Tests should be self-contained.
// That requires rewriting and restructuring the project, so we're compromising for now.
require_once('lib/quail/quail/common/services/media/youtube.php');

class FunctionalTests extends PHPUnit_Framework_TestCase
{
    /**
    * @group functional
    * Tests the youtube api call to make sure a video with captions is detected as having captions
    */
    public function testYouTubeAPIHasCaptions()
    {
        $vid_url = 'https://www.youtube.com/watch?v=zo6aRvf-l_s';

        $yt_service = new youtubeService();
        $captions_missing = $yt_service->captionsMissing($vid_url);

        $this->assertFalse($captions_missing);
    }

    /**
    * @group functional
    * Tests the youtube api call to make sure a video without captions is detected as not having captions
    */
    public function testYouTubeAPINoCaptions()
    {
        $vid_url = 'https://www.youtube.com/watch?v=nBH89Y0Xj7c';

        $yt_service = new youtubeService();
        $captions_missing = $yt_service->captionsMissing($vid_url);

        $this->assertTrue($captions_missing);
    }

    /**
    * @group functional
    * Tests the Vimeo API call to make sure the API key is valid and working
    */
    public function testVimeoAPIKey()
    {
        $url = 'https://api.vimeo.com/videos/27246366/texttracks';
        $response = Request::get($url)->addHeader('Authorization', 'Bearer '.constant('VIMEO_API_KEY'))->send();
        $this->assertSame($response->code, 200);
    }

    /**
    * @group functional
    * Tests the YouTube API call to make sure the API key is valid and working
    */
    public function testYouTubeAPIKey()
    {
        $url = 'https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=YbJOTdZBX1g&key='.constant('GOOGLE_API_KEY');
        $response = Request::get($url)->send();
        $this->assertSame($response->code, 200);
    }
}
