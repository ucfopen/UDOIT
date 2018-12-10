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
	*	@var string A regular expression to extract the Vimeo item code
	*/
	var $regex = '@vimeo\.com/.*([0-9]{9})@i';

	/**
	*	@var string The service point to request caption data from Vimeo
	*/
	var $search_url = 'https://api.vimeo.com/videos/';

	/**
	*	Checks to see if a video is missing caption information in Vimeo
	*	@param string $link_url The URL to the video or video resource
	*	@return bool TRUE if captions are missing, FALSE if captions exists or not a video
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
		} else {
			return false;
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
		error_log("Verifying link {$link_url} is a valid video...");
		if(preg_match($this->regex, trim($link_url), $matches)) {
			error_log('Matched regex!');
			$respose = Request::head($link_url)->send();
			error_log("Response code is ".(string)$response->code);
			if($response->code === 200) {
				return $matches[1];
			}
		}
		return false;
	}
}
