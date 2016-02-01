<?php

/**
*	An abstract class for any media service
*/
abstract class mediaService {

	/**
	*	Returns TRUE if a caption is missing, FALSE if a caption exists
	*/
	abstract function captionsMissing($link_url);

}