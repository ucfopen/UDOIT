<?php

require_once('mediaService.php');
// require_once('../config/localConfig.php');
use Httpful\Request;

/**
*  Media service for Vimeo. This absracts out Vimeo's API calls
*
*/

class vimeoService extends mediaService
{
	/**
	*	@var array An array of regular expressions to extract the Vimeo item code
	*/
	var $regex = array(
		'@vimeo\.com/video/([^"\&\? ]+)@i', 
		'@vimeo\.com/([^"\&\? ]+)@i',
		);

	/**
	*	@var string The service point to request caption data from Vimeo
	*/
	var $search_url = 'https://api.vimeo.com/videos/';

	/**
	*	Checks to see if a video is missing caption information in Vimeo
	*	@param string $link_url The URL to the video or video resource
	*	@return bool TRUE if captions are missing, FALSE if captions exists
	*/
	function captionsMissing($link_url)
	{
		$url = $this->search_url;
		$api_key = constant( 'VIMEO_API_KEY' );

		if( $vimeo_id = $this->isVimeoVideo($link_url) ) {
			$url = $url.$vimeo_id.'/texttracks';
			$response = Request::get($url)->addHeader('Authorization', "Bearer $api_key")->send();

			if ( isset($response->body->total) ) {
				if ($response->body->total > 0) {
					return false;
				}
			}
		}

		return true;
	}

	/**
	*	Checks to see if the provided link URL is a Vimeo video. If so, it returns
	*	the video code, if not, it returns null.
	*	@param string $link_url The URL to the video or video resource
	*	@return mixed FALSE if it's not a Vimeo video, or a string video ID if it is
	*/
	private function isVimeoVideo($link_url)
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
