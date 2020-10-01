<?php session_start();

require_once('mediaService.php');
// require_once('../config/localConfig.php');
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
		'@youtube\.com/embed/([0-9a-zA-Z_-]+)@i',
	    '@youtube\.com/v/([0-9a-zA-Z_-]+)@i',
	    '@youtube\.com/watch\?v=([0-9a-zA-Z_-]+)@i',
	    '@youtube\.com/\?v=([0-9a-zA-Z_-]+)@i',
	    '@youtu\.be/([0-9a-zA-Z_-]+)@i',
	    '@youtu\.be/v/([0-9a-zA-Z_-]+)@i',
	    '@youtu\.be/watch\?v=([0-9a-zA-Z_-]+)@i',
	    '@youtu\.be/\?v=([0-9a-zA-Z_-]+)@i',
		);

	/**
	*	@var string The service point to request caption data from YouTube
	*/
	var $search_url = 'https://www.googleapis.com/youtube/v3/captions?part=snippet&fields=items(snippet(trackKind,language))&videoId=';

	/**
	*	Checks to see if a video is missing caption information in YouTube
	*	@param string $link_url The URL to the video or video resource
	*	@return int 0 if captions are missing, 1 if video is private, 2 if captions exist or not a video
	*/
	function captionsMissing($link_url)
	{
		$url = $this->search_url;
		$api_key = constant( 'GOOGLE_API_KEY' );
		global $logger;

		// If the API key is blank, flag the video for manual inspection
		$key_trimmed = trim($api_key);
		if( empty($key_trimmed) ){
			return 1;
		}

		if( $youtube_id = $this->isYouTubeVideo($link_url) ) {
			$url = $url.$youtube_id.'&key='.$api_key;
			$response = UdoitUtils::instance()->checkApiCache($url, $link_url);

			// If the video was pulled due to copyright violations, is unlisted, or is unavailable, the reponse header will be 404
			if( $response['code'] === 404 ) {
				return 1;
			}

			// If the daily limit has been exceeded for our API key or there was some other error
			if( $response['code'] === 403 ) {
				global $logger;
				$logger->addError('YouTube API Error: '.$response->body->error->errors[0]->message);
			}

			// Looks through the captions and checks if any were not auto-generated
			foreach ( $response['body']->items as $track ) {
				if ( $track->snippet->trackKind != 'ASR' ) {
					return 2;
				}
			}

			return 0;
		}

		return 2;
	}

	/**
	*	Checks to see if a video is missing caption information in YouTube
	*	@param string $link_url The URL to the video or video resource
	*	@param string $course_locale The locale/language of the Canvas course
	*	@return int 0 if captions are manual and wrong language, 1 if video is private, 2 if captions are auto-generated or manually generated and correct language
	*/
	function captionsLanguage($link_url, $course_locale)
	{
		$url = $this->search_url;
		$api_key = constant( 'GOOGLE_API_KEY' );
		global $logger;

		$foundManual = false;

		// If the API key is blank, flag the video for manual inspection
		$key_trimmed = trim($api_key);
		if( empty($key_trimmed) ){
			return 1;
		}

		// If for whatever reason course_locale is blank, set it to English
		if($course_locale === '') {
			$course_locale = 'en';
		}

		if( $youtube_id = $this->isYouTubeVideo($link_url) ) {
			$url = $url.$youtube_id.'&key='.$api_key;
			$response = UdoitUtils::instance()->checkApiCache($url, $link_url);

			// If the video was pulled due to copyright violations, is unlisted, or is unavailable, the response header will be 404
			if( $response['code'] == 404) {
				return 1;
			}

			// If the daily limit has been exceeded for our API key or there was some other error
			if( $response['code'] === 403 ) {
				global $logger;
				$logger->addError('YouTube API Error: '.$response['body']->error->errors[0]->message);
			}

			// Looks through the captions and checks if they are of the correct language
			foreach ( $response['body']->items as $track) {
				//If the track was manually generated, set the flag to true
				if( $track->snippet->trackKind != 'ASR' ){
					$foundManual = true;
				}

				if( substr($track->snippet->language,0,2) == $course_locale && $track->snippet->trackKind != 'ASR' ) {
					return 2;
				}

			}

			//If we found any manual captions and have not returned, then none are the correct language
			if( $foundManual === true ){
				return 0;
			}
		}

			return 2;
	}

	/**
	*	Checks to see if a video is unlisted, deleted, or private
	*	@param string $link_url The URL to the video or video resource
	*	@return bool TRUE if video is unavailable, FALSE if available
	*/
	function videoUnavailable($link_url)
	{
		$url = $this->search_url;
		$api_key = constant( 'GOOGLE_API_KEY' );

		if( $youtube_id = $this->isYouTubeVideo($link_url) ) {
			$url = $url.$youtube_id.'&key='.$api_key;
			$response = UdoitUtils::instance()->checkApiCache($url, $link_url);

			if( !empty($response->body->error) || $response['code'] === 404) {
				return true;
			}

			return false;
		}

		return true;
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
			if( preg_match($pattern, trim($link_url), $matches) === 1) {
				return $matches[1];
			}
		}
		return false;
	}
}
