<?php

/**
*	An abstract class for any media service
*/
abstract class mediaService {

	/**
	*	Returns TRUE if a caption is missing, FALSE if a caption exists
	*/
	abstract function captionsMissing($link_url);

	/**
	*	Returns TRUE if a video is unavailable for any reason (Copyright, Deleted, Private, etc.), FALSE if the video exists
	*/
	abstract function videoUnavailable($link_url);

}