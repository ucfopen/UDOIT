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
	var $regex = '@vimeo\.com/[^0-9]*([0-9]{7,9})@i';

	/**
	*	@var string The service point to request caption data from Vimeo
	*/
	var $search_url = 'https://api.vimeo.com/videos/';

	/**
	*	Checks to see if a video is missing caption information in Vimeo
	*	@param string $link_url The URL to the video or video resource
	*   @return int 0 if captions are missing, 1 if video is private, 2 if captions exist or not a video
	*/
	function captionsMissing($link_url)
	{
		$url = $this->search_url;
		$api_key = constant( 'VIMEO_API_KEY' );

		// If the API key is blank, flag the video for manual inspection
		$key_trimmed = trim($api_key);
		if( empty($key_trimmed) ){
			return 1;
		}

		if( $vimeo_id = $this->isVimeoVideo($link_url) ) {
			$url = $url.$vimeo_id.'/texttracks';
			$response = UdoitUtils::instance()->checkApiCache($url, $link_url, $api_key);

			// Response header code is used to determine if video exists, doesn't exist, or is unaccessible
			// 400 means a video is private, 404 means a video doesn't exist, and 200 means the video exists
			if($response['code'] === 400 || $response['code'] === 404) {
				return 1;
			} else if(($response['code'] === 200) && $response['body']->total === 0) {
				return 0;
			}
		}

		return 2;
	}

	/**
	*	Checks to see if a video is missing caption information in YouTube
	*	@param string $link_url The URL to the video or video resource
	*	@param string $course_locale The locale/language of the Canvas course
	*	@return int 0 if captions are manual and wrong language, 1 if video is private, 2 if there are no captions or if manually generated and correct language
	*/
	function captionsLanguage($link_url, $course_locale)
	{
		$url = $this->search_url;
		$api_key = constant( 'VIMEO_API_KEY' );

		// If the API key is blank, flag the video for manual inspection
		$key_trimmed = trim($api_key);
		if( empty($key_trimmed) ){
			return 1;
		}
		// If for whatever reason course_locale is blank, set it to English
		if($course_locale === '') {
			$course_locale = 'en';
		}

		if( $vimeo_id = $this->isVimeoVideo($link_url) ) {
			$url = $url.$vimeo_id.'/texttracks';
			$response = UdoitUtils::instance()->checkApiCache($url, $link_url, $api_key);

			// Response header code is used to determine if video exists, doesn't exist, or is unaccessible
			// 400 means a video is private, 404 means a video doesn't exist, and 200 means the video exists
			if($response['code'] === 400 || $response['code'] === 404) {
				return 1;
			} else if(($response['code'] === 200) && $response['body']->total === 0) {
				return 2;
			}

			foreach ($response['body']->data as $track) {
				if( substr($track->language,0,2) === $course_locale ) {
					return 2;
				}
			}

			return 0;
		}

		return 2;
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
		if(preg_match($this->regex, trim($link_url), $matches)) {
			return $matches[1];
		}
		return false;
	}
}
