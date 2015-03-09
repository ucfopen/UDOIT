<?php

require_once('mediaService.php');

/**
*  Media service for YouTube. This absracts out YouTube's API calls
*
*/
class youtubeService extends mediaService
{
	/**
	*	@var array An array of regular expressions to extract the YouTube item code
	*/
	var $regex = array(
	    '@youtube\.com/v/([^"\& ]+)@i',
	    '@youtube\.com/watch\?v=([^"\& ]+)@i',
	    '@youtube\.com/\?v=([^"\& ]+)@i',
		);

	/**
	*	@var string The service point to request caption data from YouTube
	*/
	var $search_url = 'http://gdata.youtube.com/feeds/api/videos?q=%s&caption&v=2';

	/**
	*	Checks to see if a video is missing caption information in YouTube
	*	@param string $link_url The URL to the video or video resource
	*	@return bool TRUE if captions are missing, FALSE if captions exists
	*/
	function captionsMissing($link_url)
	{
		if($code = $this->isYouTubeVideo($link_url)) {
			$result = file_get_contents(sprintf($this->search_url, $code));
			if(!$result) {
				return false;
			}
			if (strpos($result, 'video:'. $code) === false) {
				return true;
			}
		}
		return false;
	}

	/**
	*	Checks to see if the provided link URL is a YouTube video. If so, it returns
	*	the video code, if not, it returns null.
	*	@param string $link_url The URL to the video or video resource
	*	@return mixed FALSE if it's not a YouTube video, or a string video ID if it is
	*/
	private function isYouTubeVideo($link_url)
	{
		$matches = null;
		foreach($this->regex as $pattern) {
			if(preg_match($pattern, trim($link_url), $matches)) {
				return $matches[1];
			}
		}
		return false;
	}
}