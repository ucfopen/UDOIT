<?php

require_once('mediaService.php');
use Httpful\Request;

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
	    '@youtu\.be/([^"\& ]+)@i',
	    '@youtu\.be/v/([^"\& ]+)@i',
	    '@youtu\.be/watch\?v=([^"\& ]+)@i',
	    '@youtu\.be/\?v=([^"\& ]+)@i',
		);

	/**
	*	@var string The service point to request caption data from YouTube
	*/
	var $search_url = 'https://www.googleapis.com/youtube/v3/videos?part=contentDetails&key=AIzaSyCwO6Tun63CCe-iLiQV0BrJdulvdpb2veQ&id=';

	/**
	*	Checks to see if a video is missing caption information in YouTube
	*	@param string $link_url The URL to the video or video resource
	*	@return bool TRUE if captions are missing, FALSE if captions exists
	*/
	function captionsMissing($link_url)
	{
		$url = 'https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=';

		$youtube_id = youtubeID($link_url);
		$url = $url.$youtube_id.'&key='.$google_api_key;
		$response = Request::get($url)->send();

		return $response->body->items[0]->contentDetails->caption;
	}

	/**
	*	Checks to see if the provided link URL is a YouTube video. If so, it returns
	*	the video code, if not, it returns null.
	*	@param string $link_url The URL to the video or video resource
	*	@return mixed FALSE if it's not a YouTube video, or a string video ID if it is
	*/
	private function youtubeID($link_url)
	{
		$pattern = '/(?:youtube.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu.be/)([^"&?/ ]{11})/i';
		preg_match($pattern, $link_url, $matches);

		return isset($matches[1]) ? $matches[1] : false;
	}

	/**
	*	Gets YouTube 
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