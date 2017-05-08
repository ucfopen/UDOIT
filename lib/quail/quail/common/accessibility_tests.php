<?php

// include_once('../config/localConfig.php');
	

/** 
*    QUAIL - QUAIL Accessibility Information Library
*    Copyright (C) 2009 Kevin Miller
*
*    This program is free software: you can redistribute it and/or modify
*    it under the terms of the GNU General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    (at your option) any later version.
*
*    This program is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU General Public License for more details.
*
*    You should have received a copy of the GNU General Public License
*    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*	@author Kevin Miller <kemiller@csumb.edu>
*/

/**
*	\defgroup tests Accessibility Tests
*/
/*@{*/


/**
*  Adjacent links with same resource must be combined.
*  If 2 adjacent links have the same destination then this error will be generated.
*/


/**
*  There are no adjacent text and image links having the same destination.
*  This objective of this technique is to avoid unnecessary duplication that occurs when adjacent text and iconic versions of a link are contained in a document.
*	@link http://quail-lib.org/test-info/aAdjacentWithSameResourceShouldBeCombined
*/
class aAdjacentWithSameResourceShouldBeCombined extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('a') as $a) {
			if ($this->propertyIsEqual($a->nextSibling, 'wholeText', '', true))
				$next = $a->nextSibling->nextSibling;
			else
				$next = $a->nextSibling;
			if ($this->propertyIsEqual($next, 'tagName', 'a')) {
				if ($a->getAttribute('href') == $next->getAttribute('href'))
					$this->addReport($a);
			}
		}
	}
}

/**
*  Alt text for all img elements used as source anchors is different from the link text.
*  If an image occurs within a link, the Alt text should be different from the link text.
*	@link http://quail-lib.org/test-info/aImgAltNotRepetative
*/
class aImgAltNotRepetative extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;


	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('a') as $a) {
			foreach ($a->childNodes as $child) {
				if ($this->propertyIsEqual($child, 'tagName', 'img')) {
					if (trim($a->nodeValue) == trim($child->getAttribute('alt')))
						$this->addReport($child);
				}
			}
		}
	}
}

/**
*  Link text does not begin with \"link to\"" or \""go to\"" (English)."
*  Alt text for images used as links should not begin with \"link to\"" or \""go to\""."
*	@link http://quail-lib.org/test-info/aLinkTextDoesNotBeginWithRedundantWord
*/
class aLinkTextDoesNotBeginWithRedundantWord extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var array $strings An array of strings, broken up by language domain
	*/
	var $strings = array('en' => array('link to', 'go to'),
						 'es' => array('enlaces a', 'ir a')
						);

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('a') as $a) {
			if (!$a->nodeValue) {
				if (property_exists($a, 'firstChild') && $this->propertyIsEqual($a->firstChild, 'tagName', 'img')) {
					$text = $a->firstChild->getAttribute('alt');
				}
			} else {
				$text = $a->nodeValue;

				foreach ($this->translation() as $word) {
					if (strpos(trim($text), $word) === 0) {
						$this->addReport($a);
					}
				}
			}
		}
	}
}

/**
*  Include non-link, printable characters (surrounded by spaces) between adjacent links.
*  Adjacent links must be separated by printable characters. [Editor's Note - Define adjacent link? Printable characters always?]
*	@link http://quail-lib.org/test-info/aLinksAreSeperatedByPrintableCharacters
*/
class aLinksAreSeperatedByPrintableCharacters extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('a') as $a) {
			if (property_exists($a, 'nextSibling')
			 	&& is_object($a->nextSibling)
			    && property_exists($a->nextSibling, 'nextSibling')
				&& $this->propertyIsEqual($a->nextSibling->nextSibling, 'tagName', 'a')
				&& ($this->propertyIsEqual($a->nextSibling, 'wholeText', '', true)
					|| !property_exists($a->nextSibling, 'wholeText')
					|| $this->propertyIsEqual($a->nextSibling, 'nodeValue', '', true)
					)
				) {
					$this->addReport($a);
			}
		}
	}
}

/**
*  Anchor should not open new window without warning.
*  a (anchor) element must not contain a target attribute unless the target attribute value is either _self, _top, or _parent.
*	@link http://quail-lib.org/test-info/aLinksDontOpenNewWindow
*/
class aLinksDontOpenNewWindow extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var array $allowed_targets A list of targest allowed that don't open a new window
	*/
	var $allowed_targets = array('_self', '_parent', '_top');

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('a') as $a) {
			if ($a->hasAttribute('target') && !in_array($a->getAttribute('target'), $this->allowed_targets)) {
				$this->addReport($a);
			}
		}
	}
}

/**
*  Link text is meaningful when read out of context.
*  All a (anchor) elements that contains any text will generate this error.
*	@link http://quail-lib.org/test-info/aLinksMakeSenseOutOfContext
*/
class aLinksMakeSenseOutOfContext extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('a') as $a) {
			if (strlen($a->nodeValue) > 1) {
				$this->addReport($a);
			}
		}
	}

}

/**
*  Links to multimedia require a text transcript.
*  a (anchor) element must not contain an href attribute value that ends with (case insensitive): .wmv, .mpg, .mov, .ram, .aif.
*	@link http://quail-lib.org/test-info/aLinksToMultiMediaRequireTranscript
*/
class aLinksToMultiMediaRequireTranscript extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var array $extensions A list of extensions that are considered links to multimedi
	*/
	var $extensions = ['wmv', 'mpg', 'mov', 'ram', 'aif'];

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('a') as $a) {
			if ($a->hasAttribute('href')) {
				$filename  = explode('.', $a->getAttribute('href'));
				$extension = array_pop($filename);

				if (in_array($extension, $this->extensions)) {
					$this->addReport($a);
				}
			}
		}
	}

}

/**
*  Sound file must have a text transcript.
*  a (anchor) element cannot contain an href attribute value that ends with any of the following (all case insensitive): .wav, .snd, .mp3, .iff, .svx, .sam, .smp, .vce, .vox, .pcm, .aif.
*	@link http://quail-lib.org/test-info/aLinksToSoundFilesNeedTranscripts
*/
class aLinksToSoundFilesNeedTranscripts extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var array $extensions A list of extensions that mean this file is a link to audio
	*/
	var $extensions = ['wav', 'snd', 'mp3', 'iff', 'svx', 'sam', 'smp', 'vce', 'vox', 'pcm', 'aif'];

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('a') as $a) {
			if ($a->hasAttribute('href')) {
				$filename  = explode('.', $a->getAttribute('href'));
				$extension = array_pop($filename);

				if (in_array($extension, $this->extensions)) {
					$this->addReport($a);
				}
			}
		}
	}
}

/**
*	Links to multimedia content should also link to alternate content
*	@link http://quail-lib.org/test-info/aMultimediaTextAlternative
*/
class aMultimediaTextAlternative extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var array $extensions An array of extensionst that mean this is multimedia
	*/
	var $extensions = ['wmv', 'wav',  'mpg', 'mov', 'ram', 'aif'];

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('a') as $a) {
			if ($a->hasAttribute('href')) {
				$extension = substr($a->getAttribute('href'), (strrpos($a->getAttribute('href'), '.') + 1), 4);

				if (in_array($extension, $this->extensions)) {
					$this->addReport($a);
				}
			}
		}
	}
}

/**
*  Each source anchor contains text.
*  a (anchor) element must contain text. The text may occur in the anchor text or in the title attribute of the anchor or in the Alt text of an image used within the anchor.
*	@link http://quail-lib.org/test-info/aMustContainText
*/
class aMustContainText extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('a') as $a) {
			if (!$this->elementContainsReadableText($a) && ($a->hasAttribute('href'))) {
				$this->addReport($a);
			}
		}
	}

	/**
	*	Returns if a link is not a candidate to be an anchor (which does
	*	not need text)
	*	@param object The element link in question
	*	@return bool Whether is is a link (TRUE) or an anchor (FALSE)
	*/
	function isNotAnchor($a) {
		return (!($a->hasAttribute('name') && !$a->hasAttribute('href')));
	}
}

/**
*  Anchor element must have a title attribute.
*  Each source a (anchor) element must have a title attribute.
*	@link http://quail-lib.org/test-info/aMustHaveTitle
*/
class aMustHaveTitle extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('a') as $a) {
			if (!$a->hasAttribute('title'))
				$this->addReport($a);
		}

	}
}

/**
*  Anchor must not use Javascript URL protocol.
*  Anchor elements must not have an href attribute value that starts with "javascript:".
*	@link http://quail-lib.org/test-info/aMustNotHaveJavascriptHref
*/
class aMustNotHaveJavascriptHref extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('a') as $a) {
			if (substr(trim($a->getAttribute('href')), 0, 11) == 'javascript:') {
				$this->addReport($a);
			}
		}
	}
}

/**
*  Suspicious link text.
*  a (anchor) element cannot contain any of the following text (English): \"click here\""
*	@link http://quail-lib.org/test-info/aSuspiciousLinkText
*/
class aSuspiciousLinkText extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var array $strings An array of strings, broken up by language domain
	*/
	var $strings = array('en' => array('click here', 'click', 'more', 'here'),
		'es' => array('clic aqu&iacute;', 'clic', 'haga clic', 'm&aacute;s', 'aqu&iacute;'));

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('a') as $a) {
			if (in_array(strtolower(trim($a->nodeValue)), $this->translation()) || $a->nodeValue == $a->getAttribute('href'))
				$this->addReport($a);
		}
	}
}

/**
*  The title attribute of all source a (anchor) elements describes the link destination.
*  Each source a (anchor) element must have a title attribute that describes the link destination.
*	@link http://quail-lib.org/test-info/aTitleDescribesDestination
*/
class aTitleDescribesDestination extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('a') as $a) {
			if ($a->hasAttribute('title')) {
				$this->addReport($a);
			}
		}
	}
}

/**
*  Content must have an address for author.
*  address element must be present.
*	@link http://quail-lib.org/test-info/addressForAuthor
*/
class addressForAuthor extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('address') as $address) {
			foreach ($address->childNodes as $child) {
				if ($this->propertyIsEqual($child, 'tagName', 'a')) {
					return true;
				}
			}
		}

		$this->addReport(null, null, false);
	}

}

/**
*  address of page author must be valid.
*  This error will be generated for each address element. [Editor's Note: What is a valid address?]
*	@link http://quail-lib.org/test-info/addressForAuthorMustBeValid
*/
class addressForAuthorMustBeValid extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('address') as $address) {
			if ($this->validateEmailAddress($address->nodeValue, array('check_domain' => $this->checkDomain))) {
				return true;
			}

			foreach ($address->childNodes as $child) {
				if ($this->propertyIsEqual($child, 'tagName', 'a')
				   && substr(strtolower($child->getAttribute('href')), 0, 7) == 'mailto:') {
					if ($this->validateEmailAddress(trim(str_replace('mailto:', '', $child->getAttribute('href'))), ['check_domain' => $this->checkDomain])) {
						return true;
					}
				}
			}
		}

		$this->addReport(null, null, false);
	}


	function validateEmailAddress($email)
	{
		// First, we check that there's one @ symbol,
		// and that the lengths are right.
		if (!ereg("^[^@]{1,64}@[^@]{1,255}$", $email)) {
			// Email invalid because wrong number of characters
			// in one section or wrong number of @ symbols.
			return false;
		}

		// Split it into sections to make life easier
		$email_array = explode("@", $email);
		$local_array = explode(".", $email_array[0]);

		for ($i = 0; $i < sizeof($local_array); $i++) {
			if (!ereg("^(([A-Za-z0-9!#$%&'*+/=?^_`{|}~-][A-Za-z0-9!#$%&'*+/=?^_`{|}~\.-]{0,63})|(\"[^(\\|\")]{0,62}\"))$", $local_array[$i])) {
				return false;
			}
		}

		// Check if domain is IP. If not,
		// it should be valid domain name
		if (!ereg("^\[?[0-9\.]+\]?$", $email_array[1])) {
	    	$domain_array = explode(".", $email_array[1]);
	    	if (sizeof($domain_array) < 2) {
	        	return false; // Not enough parts to domain
	    	}
	    	for ($i = 0; $i < sizeof($domain_array); $i++) {
	      		if (!ereg("^(([A-Za-z0-9][A-Za-z0-9-]{0,61}[A-Za-z0-9])|([A-Za-z0-9]+))$", $domain_array[$i])) {
	      			return false;
				}
			}
		}

		return true;
	}
}

/**
*  applet contains a text equivalent in the body of the applet.
*  This error is generated for all applet elements.
*	@link http://quail-lib.org/test-info/appletContainsTextEquivalent
*/
class appletContainsTextEquivalent extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('applet') as $applet) {
			if (trim($applet->nodeValue) == '' || !$applet->nodeValue) {
				$this->addReport($applet);
			}
		}
	}
}

/**
*  applet contains a text equivalent in the body of the applet.
*  This error is generated for all applet elements.
*	@link http://quail-lib.org/test-info/appletContainsTextEquivalentInAlt
*/
class appletContainsTextEquivalentInAlt extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('applet') as $applet) {
			if (!$applet->hasAttribute('alt') || $applet->getAttribute('alt') == '') {
				$this->addReport($applet);
			}
		}
	}
}

/**
*  applet provides a keyboard mechanism to return focus to the parent window.
*  Ensure that keyboard users do not become trapped in a subset of the content that can only be exited using a mouse or pointing device.
*	@link http://quail-lib.org/test-info/appletProvidesMechanismToReturnToParent
*/
class appletProvidesMechanismToReturnToParent extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;


	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'applet';
}

/**
*  applet text equivalnets are updated as well if the applet content is updated
*	@link http://quail-lib.org/test-info/appletTextEquivalentsGetUpdated
*/
class appletTextEquivalentsGetUpdated extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'applet';

}

/**
*  applet user interface must be accessible.
*  This error is generated for all applet elements.
*	@link http://quail-lib.org/test-info/appletUIMustBeAccessible
*/
class appletUIMustBeAccessible extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'applet';
}

/**
*  All applets do not flicker.
*  This error is generated for all applet elements.
*	@link http://quail-lib.org/test-info/appletsDoNotFlicker
*/
class appletsDoNotFlicker extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'applet';

}

/**
*  applet should not use color alone.
*  This error is generated for all applet elements.
*	@link http://quail-lib.org/test-info/appletsDoneUseColorAlone
*/
class appletsDoneUseColorAlone extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'applet';
}

/**
*  Alt text for all area elements identifies the link destination.
*  Alt text for area element must describe the link destination.
*	@link http://quail-lib.org/test-info/areaAltIdentifiesDestination
*/
class areaAltIdentifiesDestination extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'area';

}

/**
*  Alt text for all area elements contains all non decorative text in the image area.
*  This error is generated for all area elements.
*	@link http://quail-lib.org/test-info/areaAltRefersToText
*/
class areaAltRefersToText extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'area';
}

/**
*  area should not open new window without warning.
*  area element, target attribute values must contain any one of (case insensitive) _self, _top, _parent.
*	@link http://quail-lib.org/test-info/areaDontOpenNewWindow
*/
class areaDontOpenNewWindow extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var array $allowed_targets A list of targets which are allowed
	*/
	var $allowed_targets = array('_self', '_parent', '_top');

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('area') as $area) {
			if ($area->hasAttribute('target') && !in_array($area->getAttribute('target'), $this->allowed_targets)) {
				$this->addReport($area);
			}
		}
	}
}

/**
*  All area elements have an alt attribute.
*  area elements must contain a alt attribute.
*	@link http://quail-lib.org/test-info/areaHasAltValue
*/
class areaHasAltValue extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('area') as $area) {
			if (!$area->hasAttribute('alt')) {
				$this->addReport($area);
			}
		}
	}

}

/**
*  area link to sound file must have text transcript.
*  area elements must not contain href attribute values that end with (all case insensitive) .wav, .snd, .mp3, .iff, .svx, .sam, .smp, .vce, .vox, .pcm, .aif
*	@link http://quail-lib.org/test-info/areaLinksToSoundFile
*/
class areaLinksToSoundFile extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var array $extensions An array of extensions which menas this is a sound file
	*/
	var $extensions = ['wav', 'snd', 'mp3', 'iff', 'svx', 'sam', 'smp', 'vce', 'vox', 'pcm', 'aif'];

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('area') as $area) {
			if ($area->hasAttribute('href')) {
				$filename  = explode('.', $area->getAttribute('href'));
				$extension = array_pop($filename);

				if (in_array($extension, $this->extensions)) {
					$this->addReport($area);
				}
			}
		}
	}

}

/**
*  basefont must not be used.
*  This error is generated for all basefont elements.
*	@link http://quail-lib.org/test-info/basefontIsNotUsed
*/
class basefontIsNotUsed extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'basefont';
}

/**
*  blink element is not used.
*  This error is generated for all blink elements.
*	@link http://quail-lib.org/test-info/blinkIsNotUsed
*/
class blinkIsNotUsed extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'blink';

}

/**
*  blockquote must not be used for indentation.
*  This error is generated if any blockquote element is missing a cite attribute.
*	@link http://quail-lib.org/test-info/blockquoteNotUsedForIndentation
*/
class blockquoteNotUsedForIndentation extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('blockquote') as $blockquote) {
			if (!$blockquote->hasAttribute('cite'))
				$this->addReport($blockquote);
		}
	}
}

/**
*  Use the blockquote element to mark up block quotations.
*  If body element content is greater than 10 characters (English) then this error will be generated.
*	@link http://quail-lib.org/test-info/blockquoteUseForQuotations
*/
class blockquoteUseForQuotations extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('p') as $paragraph) {
			if (in_array(substr(trim($paragraph->nodeValue), 0, 1), array('"', "'")) &&
			   in_array(substr(trim($paragraph->nodeValue), -1, 1), array('"', "'"))) {
				$this->addReport($paragraph);
			}
		}
	}

}

/**
*  The luminosity contrast ratio between active link text and background color is at least 5:1.
*  The luminosity contrast ratio between active link text and background color is at least 5:1
*	@link http://quail-lib.org/test-info/bodyActiveLinkColorContrast
*/
class bodyActiveLinkColorContrast extends bodyColorContrast
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	@var string $foreground The type of item that should be checked for contrast in the foreground
	*/
	var $foreground = 'alink';
}

/**
*  The luminosity contrast ratio between link text and background color is at least 5:1.
*  The luminosity contrast ratio between link text and background color is at least 5:1
*	@link http://quail-lib.org/test-info/bodyLinkColorContrast
*/
class bodyLinkColorContrast extends bodyColorContrast
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	@var string $foreground The type of item that should be checked for contrast in the foreground
	*/
	var $foreground = 'link';
}

/**
*  Do not use background images.
*  The body element must not contain a background attribute.
*	@link http://quail-lib.org/test-info/bodyMustNotHaveBackground
*/
class bodyMustNotHaveBackground extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		$body = $this->getAllElements('body');
		if (!$body)
			return false;
		$body = $body[0];
		if ($body->hasAttribute('background'))
			$this->addReport(null, null, false);
	}
}

/**
*  The luminosity contrast ratio between visited link text and background color is at least 5:1.
*  The luminosity contrast ratio between visited link text and background color is at least 5:1
*	@link http://quail-lib.org/test-info/bodyVisitedLinkColorContrast
*/
class bodyVisitedLinkColorContrast extends bodyColorContrast
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	@var string $foreground The type of item that should be checked for contrast in the foreground
	*/
	var $foreground = 'vlink';
}

/**
*  b (bold) element is not used.
*  This error will be generated for all B elements.
*	@link http://quail-lib.org/test-info/boldIsNotUsed
*/
class boldIsNotUsed extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'bold';
}

/**
*  All input elements, type of "checkbox", have an explicitly associated label.
*  input element that contains a type attribute value of "checkbox" must have an associated label element. An associated label is one in which the for attribute value of the label element is the same as the id attribute value of the input element.
*	@link http://quail-lib.org/test-info/checkboxHasLabel
*/
class checkboxHasLabel extends inputHasLabel
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'input';

	/**
	*	@var string $type The type of input we're looking for
	*/
	var $type = 'checkbox';

	/**
	*	@var bool $no_type We are not looking at the type of input here
	*/
	var $no_type = false;
}

/**
*  All input elements, type of "checkbox", have a label that is positioned close to the control.
*  input element with a type attribute value of "checkbox" must have an associated label element positioned close to it.
*	@link http://quail-lib.org/test-info/checkboxLabelIsNearby
*/
class checkboxLabelIsNearby extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('input') as $input) {
			if ($input->getAttribute('type') == 'checkbox')
				$this->addReport($input);

		}
	}
}

/**
*  Document must be readable when stylesheets are not applied.
*  This error will be generated for each link element that has a rel attribute with a value of "stylesheet".
*	@link http://quail-lib.org/test-info/cssDocumentMakesSenseStyleTurnedOff
*/
class cssDocumentMakesSenseStyleTurnedOff extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('link') as $link) {
			if ($link->parentNode->tagName == 'head') {
				if ($link->getAttribute('rel') == 'stylesheet')
					$this->addReport($link);
			}
		}
	}
}

/**
*	Checks that all color and background elements has stufficient contrast.
*
*	@link http://quail-lib.org/test-info/cssTextHasContrast
*/
class cssTextHasContrast extends quailColorTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var string $default_background The default background color
	*/
	var $default_background = '#ffffff';

	/**
	*	@var string $default_background The default background color
	*/
	var $default_color = '#000000';

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		if (isset($this->options['css_background'])) {
			$this->default_background = $this->options['css_background'];
		}

		if (isset($this->options['css_foreground'])) {
			$this->default_color = $this->options['css_foreground'];
		}

		$xpath   = new DOMXPath($this->dom);
		$entries = $xpath->query('//*');

		foreach ($entries as $element) {
			$style = $this->css->getStyle($element);

			if (!isset($style['background-color'])) {
				$style['background-color'] = $this->default_background;
			}

			if ((isset($style['background']) || isset($style['background-color'])) && isset($style['color']) && $element->nodeValue) {
				$background = (isset($style['background-color'])) ? $style['background-color'] : $style['background'];

				if (!$background || $this->options['css_only_use_default']) {
					$background = $this->default_background;
				}

				$luminosity = $this->getLuminosity($style['color'], $background);
				$font_size = 0;
				$bold = false;

				if (isset($style['font-size'])) {
					preg_match_all('!\d+!', $style['font-size'], $matches);
					$font_size = $matches[0][0];
				}

				if (isset($style['font-weight'])) {
					preg_match_all('!\d+!', $style['font-weight'], $matches);
					
					if (count($matches) > 0) {
						if ($matches >= 700) {
							$bold = true;
						} else {
							if ($style['font-weight'] === 'bold' || $style['font-weight'] === 'bolder') {
								$bold = true;
							}
						}
					}
				}

				if ($element->tagName === 'h1' || $element->tagName === 'h2' || $element->tagName === 'h3' || $element->tagName === 'h4' || $element->tagName === 'h5' || $element->tagName === 'h6' || $font_size >= 18 || $font_size >= 14 && $bold) {
					if ($luminosity < 3) {
						$this->addReport($element, 'heading');
					}
				} else {
					if ($luminosity < 4.5) {
						$this->addReport($element, 'text');
					}
				}
			}
		}
	}
}

/**
*	Checks that all color and background elements has stufficient contrast.
*
*	@link http://quail-lib.org/test-info/cssTextHasContrast
*/
class cssTextStyleEmphasize extends quailColorTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $default_background The default background color
	*/
	var $default_background = '#ffffff';

	/**
	*	@var string $default_background The default background color
	*/
	var $default_color = '#000000';

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		if (isset($this->options['css_background'])) {
			$this->default_background = $this->options['css_background'];
		}

		if (isset($this->options['css_foreground'])) {
			$this->default_color = $this->options['css_foreground'];
		}

		$xpath   = new DOMXPath($this->dom);
		$entries = $xpath->query('//*');

		foreach ($entries as $element) {
			$style = $this->css->getStyle($element);

			if (!isset($style['background-color'])) {
				$style['background-color'] = $this->default_background;
			}

			if ((isset($style['background']) || isset($style['background-color'])) && isset($style['color']) && $element->nodeValue) {
				$background = (isset($style['background-color'])) ? $style['background-color'] : $style['background'];

				if (!$background || $this->options['css_only_use_default']) {
					$background = $this->default_background;
				}

				$luminosity = $this->getLuminosity($style['color'], $background);
				$font_size = 0;
				$bold = false;

				if (isset($style['font-size'])) {
					preg_match_all('!\d+!', $style['font-size'], $matches);
					$font_size = $matches[0][0];
				}

				if (isset($style['font-weight'])) {
					preg_match_all('!\d+!', $style['font-weight'], $matches);
					
					if (count($matches) > 0) {
						if ($matches >= 700) {
							$bold = true;
						} else {
							if ($style['font-weight'] === 'bold' || $style['font-weight'] === 'bolder') {
								$bold = true;
							}
						}
					}
				}

				if ($element->tagName === 'h1' || $element->tagName === 'h2' || $element->tagName === 'h3' || $element->tagName === 'h4' || $element->tagName === 'h5' || $element->tagName === 'h6' || $font_size >= 18 || $font_size >= 14 && $bold) {
					if ($luminosity >= 3 && !$bold) {
						$this->addReport($element, 'heading');
					}
				} else {
					if ($luminosity >= 4.5 && !$bold) {
						$this->addReport($element, 'text');
					}
				}
			}
		}
	}
}

/**
*  HTML content has a valid doctype declaration.
*  Each document must contain a valid doctype declaration.
*	@link http://quail-lib.org/test-info/doctypeProvided
*/
class doctypeProvided extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		if (!$this->dom->doctype->publicId)
			$this->addReport(null, null, false);
	}

}

/**
*  Abbreviations must be marked with abbr element.
*  If body element content is greater than 10 characters (English) this error will be generated.
*	@link http://quail-lib.org/test-info/documentAbbrIsUsed
*/
class documentAbbrIsUsed extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	@var string $acronym_tag The tag that is considered an acronym
	*/
	var $acronym_tag = 'abbr';

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements($this->acronym_tag) as $acronym) {
			$predefined[strtoupper(trim($acronym->nodeValue))] = $acronym->getAttribute('title');
		}
		$already_reported = array();
		foreach ($this->getAllElements(null, 'text') as $text) {

			$words = explode(' ', $text->nodeValue);
			if (count($words) > 1 && strtoupper($text->nodeValue) != $text->nodeValue) {
				foreach ($words as $word) {
					$word = preg_replace("/[^a-zA-Zs]/", "", $word);
					if (strtoupper($word) == $word && strlen($word) > 1 && !isset($predefined[strtoupper($word)]))

						if (!isset($already_reported[strtoupper($word)])) {
							$this->addReport($text, 'Word "'. $word .'" requires an <code>'. $this->acronym_tag .'</code> tag.');
						}
						$already_reported[strtoupper($word)] = true;
				}
			}
		}

	}

}

/**
*  Acronyms must be marked with acronym element. This is the same as the 'abbr' test, but
*	looks for ACRONYM elements
*  If body element content is greater than 10 characters (English) then this error will be generated.
*	@link http://quail-lib.org/test-info/documentAcronymsHaveElement
*/
class documentAcronymsHaveElement extends documentAbbrIsUsed
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	@var string $acronym_tag The tag to be searched for as an acronym
	*/
	var $acronym_tag = 'acronym';
}

/**
*  All text colors or no text colors are set.
*  If the author specifies that the text must be black, then it may override the settings of the user agent and render a page that has black text (specified by the author) on black background (that was set in the user agent).
*	@link http://quail-lib.org/test-info/documentAllColorsAreSet
*/
class documentAllColorsAreSet extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	@var array $color_attributes An array of all the attributes which are considered
	*			   for computing color
	*/
	var $color_attributes = array('text', 'bgcolor', 'link', 'alink', 'vlink');

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		$body = $this->getAllElements('body');
		$body = $body[0];
		if ($body) {
			$colors = 0;
			foreach ($this->color_attributes as $attribute) {
				if ($body->hasAttribute($attribute))
					$colors++;
			}
			if ($colors > 0 && $colors < 5)
				$this->addReport(null, null, false);
		}
	}
}

/**
*  Auto-redirect must not be used.
*  meta elements that contain a http-equiv attribute with a value of "refresh" cannot contain a content attribute with a value of (start, case insensitive) "http://".
*	@link http://quail-lib.org/test-info/documentAutoRedirectNotUsed
*/
class documentAutoRedirectNotUsed extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('meta') as $meta) {
			if ($meta->getAttribute('http-equiv') == 'refresh' && !$meta->hasAttribute('content'))
				$this->addReport($meta);
		}

	}
}

/**
*  The contrast between active link text and background color is greater than WAI ERT color algorithm threshold.
*  The contrast between active link text and background color must be greater than the WAI ERT color algorithm threshold.
*	@link http://quail-lib.org/test-info/documentColorWaiActiveLinkAlgorithim
*/
class documentColorWaiActiveLinkAlgorithim extends bodyWaiErtColorContrast
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	@var string $foreground The type of item that should be checked for contrast in the foreground
	*/
	var $foreground = 'alink';
}

/**
*  The contrast between text and background colors is greater than WAI ERT color algorithm threshold.
*  The contrast between text and background color must be greater than the WAI ERT color algorithm threshold.
*	@link http://quail-lib.org/test-info/documentColorWaiAlgorithim
*/
class documentColorWaiAlgorithim extends bodyWaiErtColorContrast {

	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

}

/**
*  The contrast between link text and background color is greater than WAI ERT color algorithm threshold.
*  The contrast between link text and background color must be greater than the WAI ERT color algorithm threshold.
*	@link http://quail-lib.org/test-info/documentColorWaiLinkAlgorithim
*/
class documentColorWaiLinkAlgorithim extends bodyWaiErtColorContrast
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	@var string $foreground The type of item that should be checked for contrast in the foreground
	*/
	var $foreground = 'link';
}

/**
*  The contrast between visited link text and background color is greater than WAI ERT color algorithm threshold.
*  The contrast between visited link text and background color must be greater than the WAI ERT color algorithm threshold.
*	@link http://quail-lib.org/test-info/documentColorWaiVisitedLinkAlgorithim
*/
class documentColorWaiVisitedLinkAlgorithim extends bodyWaiErtColorContrast
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	@var string $foreground The type of item that should be checked for contrast in the foreground
	*/
	var $foreground = 'vlink';
}

/**
*  Content must be readable when stylesheets are not applied.
*  The first occurrence of any element that contains a style attribute will generate this error.
*	@link http://quail-lib.org/test-info/documentContentReadableWithoutStylesheets
*/
class documentContentReadableWithoutStylesheets extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements(null, 'text') as $text) {
			if ($text->hasAttribute('style')) {
				$this->addReport(null, null, false);
				return false;
			}
		}

	}
}

/**
*  Document contains a title element.
*  title element must be present in head section of document.
*	@link http://quail-lib.org/test-info/documentHasTitleElement
*/
class documentHasTitleElement extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{

		$element = $this->dom->getElementsByTagName('title');
		if (!$element->item(0))
			$this->addReport(null, null, false);

	}
}

/**
*  id attributes must be unique.
*  Each id attribute value must be unique.
*	@link http://quail-lib.org/test-info/documentIDsMustBeUnique
*/
class documentIDsMustBeUnique extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		$xpath = new DOMXPath($this->dom);
		$entries = $xpath->query('//*');
		$ids = array();
		foreach ($entries as $element) {
			if ($element->hasAttribute('id'))
				$ids[$element->getAttribute('id')][] = $element;
		}
		if (count($ids) > 0) {
			foreach ($ids as $id) {
				if (count($id) > 1)
					$this->addReport($id[1]);
			}
		}
	}
}

/**
*  Document has valid language code.
*  html element must have a lang attribute value of valid 2 or 3 letter language code according to ISO specification 639.
*	@link http://quail-lib.org/test-info/documentLangIsISO639Standard
*/
class documentLangIsISO639Standard extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		$languages = file(dirname(__FILE__).'/resources/iso639.txt');

		$element = $this->dom->getElementsByTagName('html');
		$html = $element->item(0);
		if (!$html)
			return null;
		if ($html->hasAttribute('lang'))
			if (in_array(strtolower($html->getAttribute('lang')), $languages))
				$this->addReport(null, null, false);

	}
}

/**
*  Document has required lang attribute(s).
*  html element must contain a lang attribute.
*	@link http://quail-lib.org/test-info/documentLangNotIdentified
*/
class documentLangNotIdentified extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		$element = $this->dom->getElementsByTagName('html');
		$html = $element->item(0);
		if (!$html) return null;
		if (!$html->hasAttribute('lang') || trim($html->getAttribute('lang')) == '')
			$this->addReport(null, null, false);

	}
}

/**
*  Meta refresh is not used with a time-out.
*  meta elements that contain a http-equiv attribute with a value of "refresh" cannot contain a content attribute with a value of any number greater than zero.
*	@link http://quail-lib.org/test-info/documentMetaNotUsedWithTimeout
*/
class documentMetaNotUsedWithTimeout extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('meta') as $meta) {
			if ($meta->getAttribute('http-equiv') == 'refresh' && !$meta->getAttribute('content'))
				$this->addReport($meta);
		}

	}
}

/**
*  The reading direction of all text is correctly marked.
*  The reading direction of all text is correctly marked.
*/


/**
*  All changes in text direction are marked using the dir attribute.
*  Identify changes in the text direction of text that includes nested directional runs by providing the dir attribute on inline elements. A nested directional run is a run of text that includes mixed directional text, for example, a paragraph in English containing a quoted Hebrew sentence which in turn includes a quotation in French.
*	@link http://quail-lib.org/test-info/documentReadingDirection
*/
class documentReadingDirection extends quailTest
{


	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	@var array $right_to_left The language codes that are considered right-to-left
	*/
	var $right_to_left = array('he', 'ar');

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		$xpath = new DOMXPath($this->dom);
		$entries = $xpath->query('//*');
		foreach ($entries as $element) {
			if (in_array($element->getAttribute('lang'), $this->right_to_left)) {

				if ($element->getAttribute('dir') != 'rtl')
				 	$this->addReport($element);
			}
		}
	}
}

/**
*  Strict doctype is declared.
*  A 'strict' doctype must be declared in the document. This can either be the HTML4.01 or XHTML 1.0 strict doctype.
*	@link http://quail-lib.org/test-info/documentStrictDocType
*/
class documentStrictDocType extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		if (strpos(strtolower($this->dom->doctype->publicId), 'strict') === false
		   && strpos(strtolower($this->dom->doctype->systemId), 'strict') === false)
			$this->addReport(null, null, false);
	}
}

/**
*  title describes the document.
*  This error is generated for each title element.
*	@link http://quail-lib.org/test-info/documentTitleDescribesDocument
*/
class documentTitleDescribesDocument extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		$placeholders = file(dirname(__FILE__).'/resources/placeholder.txt');
		$element = $this->dom->getElementsByTagName('title');
		$title = $element->item(0);
		if ($title) {
				$this->addReport($title);
		}
	}
}

/**
*  title is not placeholder text.
*  title element content can not be any one of (case insensitive) \"the title\""
*	@link http://quail-lib.org/test-info/documentTitleIsNotPlaceholder
*/
class documentTitleIsNotPlaceholder extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		$placeholders = file(dirname(__FILE__).'/resources/placeholder.txt');
		$element = $this->dom->getElementsByTagName('title');
		$title = $element->item(0);
		if ($title) {
			if (in_array(strtolower($title->nodeValue), $placeholders))
				$this->addReport(null, null, false);
		}
	}
}

/**
*  title is short.
*  title element content must be less than 150 characters (English).
*	@link http://quail-lib.org/test-info/documentTitleIsShort
*/
class documentTitleIsShort extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{

		$element = $this->dom->getElementsByTagName('title');
		$title = $element->item(0);
		if ($title) {
			if (strlen($title->nodeValue)> 150)
				$this->addReport(null, null, false);
		}
	}
}

/**
*  title contains text.
*  title element content cannot be empty or whitespace.
*	@link http://quail-lib.org/test-info/documentTitleNotEmpty
*/
class documentTitleNotEmpty extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{

		$element = $this->dom->getElementsByTagName('title');
		if ($element->length > 0) {
			$title = $element->item(0);
			if (trim($title->nodeValue) == '')
				$this->addReport(null, null, false);
		}
	}
}

/**
*  Document validates to specification.
*  Document must validate to declared doctype.
*	@link http://quail-lib.org/test-info/documentValidatesToDocType
*/
class documentValidatesToDocType extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		if (!@$this->dom->validate())
			$this->addReport(null, null, false);
	}
}

/**
*  All visual lists are marked.
*  Create lists of related items using list elements appropriate for their purposes.
*	@link http://quail-lib.org/test-info/documentVisualListsAreMarkedUp
*/
class documentVisualListsAreMarkedUp extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var array $list_cues Things that might be considered to be part of a list
	*/
	var $list_cues = array('*', '<br>*', '•', '&#8226');

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements(null, 'text') as $text) {
			foreach ($this->list_cues as $cue) {
				$first = stripos($text->nodeValue, $cue);
				$second = strripos($text->nodeValue, $cue);
				if ($first && $second && $first != $second)
					$this->addReport($text);
			}
		}

	}
}

/**
*  Words and phrases not in the document's primary language are marked.
*  If the body element contains more than 10 characters (English) then this error will be generated.
*	@link http://quail-lib.org/test-info/documentWordsNotInLanguageAreMarked
*/
class documentWordsNotInLanguageAreMarked extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		$body = $this->getAllElements('body');
		if (!isset($body[0])) {
			return false;
		}
		$body = $body[0];
		if (!is_object($body)) {
			return false;
		}
		if (!property_exists($body, 'nodeValue')) {
			return false;
		}
		$words = explode(' ', $body->nodeValue);

		if (count($words) > 10)
			$this->addReport(null, null, false);
	}
}

/**
*  All embed elements have an associated noembed element that contains a text equivalent to the embed element.
*  Provide a text equivalent for the embed element.
*	@link http://quail-lib.org/test-info/embedHasAssociatedNoEmbed
*/
class embedHasAssociatedNoEmbed extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('embed') as $embed) {
			if (!$this->propertyIsEqual($embed->firstChild, 'tagName', 'noembed')
			   && !$this->propertyIsEqual($embed->nextSibling, 'tagName', 'noembed')) {
					$this->addReport($embed);
			}

		}
	}
}

/**
*  embed must have alt attribute.
*  embed element must have an alt attribute.
*	@link http://quail-lib.org/test-info/embedMustHaveAltAttribute
*/
class embedMustHaveAltAttribute extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('embed') as $embed) {
			if (!$embed->hasAttribute('alt'))
					$this->addReport($embed);

		}
	}
}

/**
*  embed must not have empty Alt text.
*  embed element cannot have alt attribute value of null ("") or whitespace.
*	@link http://quail-lib.org/test-info/embedMustNotHaveEmptyAlt
*/
class embedMustNotHaveEmptyAlt extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('embed') as $embed) {
			if ($embed->hasAttribute('alt') && trim($embed->getAttribute('alt')) == '')
					$this->addReport($embed);

		}
	}
}

/**
*  embed provides a keyboard mechanism to return focus to the parent window.
*  Ensure that keyboard users do not become trapped in a subset of the content that can only be exited using a mouse or pointing device.
*	@link http://quail-lib.org/test-info/embedProvidesMechanismToReturnToParent
*/
class embedProvidesMechanismToReturnToParent extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'embed';
}

/**
*  Excessive use of emoticons.
*  This error is generated if 4 or more emoticons are detected. [Editor's Note - how are emoticons detected?]
*	@link http://quail-lib.org/test-info/emoticonsExcessiveUse
*/
class emoticonsExcessiveUse extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		$emoticons = file(dirname(__FILE__).'/resources/emoticons.txt', FILE_IGNORE_NEW_LINES);
		$count = 0;
		foreach ($this->getAllElements(null, 'text') as $element) {
			if (strlen($element->nodeValue < 2)) {
				$words = explode(' ', $element->nodeValue);
				foreach ($words as $word) {
					if (in_array($word, $emoticons)) {
						$count++;
						if ($count > 4) {
							$this->addReport(null, null, false);
							return false;
						}
					}
				}

			}
		}

	}
}

class emoticonsMissingAbbr extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		$emoticons = file(dirname(__FILE__).'/resources/emoticons.txt', FILE_IGNORE_NEW_LINES);
		$count = 0;
		foreach ($this->getAllElements('abbr') as $abbr) {
			$abbreviated[$abbr->nodeValue] = $abbr->getAttribute('title');
		}
		foreach ($this->getAllElements(null, 'text') as $element) {
			if (strlen($element->nodeValue < 2)) {
				$words = explode(' ', $element->nodeValue);
				foreach ($words as $word) {
					if (in_array($word, $emoticons)) {
						if (!isset($abbreviated[$word]))
							$this->addReport($element);
					}
				}

			}
		}

	}
}

/**
*  All input elements, type of "file", have an explicitly associated label.
*  input element that contains a type attribute value of "file" must have an associated label element. An associated label is one in which the for attribute value of the label element is the same as the id attribute value of the input element.
*	@link http://quail-lib.org/test-info/fileHasLabel
*/
class fileHasLabel extends inputHasLabel
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'input';

	/**
	*	@var string $type The type of input we're looking for
	*/
	var $type = 'file';

	/**
	*	@var bool $no_type We are not looking at the type of input here
	*/
	var $no_type = false;
}

/**
*  All input elements, type of "file", have a label that is positioned close to the control.
*  input element with a type attribute value of "file" must have an associated label element positioned close to it.
*	@link http://quail-lib.org/test-info/fileLabelIsNearby
*/
class fileLabelIsNearby extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('input') as $input) {
			if ($input->getAttribute('type') == 'file')
				$this->addReport($input);

		}
	}
}

/**
*  font must not be used.
*  This error is generated for all font elements.
*	@link http://quail-lib.org/test-info/fontIsNotUsed
*/
class fontIsNotUsed extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'font';
}

class formAllowsCheckIfIrreversable extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'form';
}

/**
*  Information deleted using a web page can be recovered.
*  Help users with disabilities avoid serious consequences as the result of a mistake when performing an action that cannot be reversed.
*	@link http://quail-lib.org/test-info/formDeleteIsReversable
*/
class formDeleteIsReversable extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var array $strings An array of strings, broken up by language domain
	*/
	var $strings = array('en' => array('delete', 'remove', 'erase'),
							 'es' => array('borrar', 'eliminar', 'suprimir'),
							);

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('input') as $input) {
			if ($input->getAttribute('type') == 'submit') {
				foreach ($this->translation() as $word) {
					if (strpos(strtolower($input->getAttribute('value')), $word) !== false)
						$this->addReport($this->getParent($input, 'form', 'body'));
				}
			}
		}
	}
}

/**
*  Form submission data is presented to the user before final acceptance for all irreversable transactions.
*  Provide users with a way to ensure their input is correct before completing an irreversible transaction.
*	@link http://quail-lib.org/test-info/formErrorMessageHelpsUser
*/
class formErrorMessageHelpsUser extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'form';
}

/**
*  All form submission error messages provide assistance in correcting the error.
*  Information about the nature and location of the input error is provided in text to enable the users to identify the problem.
*	@link http://quail-lib.org/test-info/formHasGoodErrorMessage
*/
class formHasGoodErrorMessage extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'form';
}


/**
*  All form fields that are required are indicated to the user as required.
*  Ensure that the label for any interactive component within Web content makes the component's purpose clear.
*	@link http://quail-lib.org/test-info/formWithRequiredLabel
*/
class formWithRequiredLabel extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	@var array $suspect_styles A list of CSS styles which might mean this is label text
	*/
	var $suspect_styles = array('font-weight', 'color');

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		$labels = array();
		foreach ($this->getAllElements('label') as $label) {
			$labels[] = $label;
			if (strpos($label->nodeValue, '*') !== false) {
				if ($input = $this->dom->getElementById($label->getAttribute('for'))) {
					if (!$input->hasAttribute('aria-required') ||
					   strtolower($input->getAttribute('aria-required')) != 'true') {
						 $this->addReport($label);
					}
				}
				else {
					$this->addReport($label);
				}
			}
		}
		$styles = array();
		foreach ($labels as $k => $label) {
			//Now we check through all the labels and see if any are
			//colored different than the others
			$styles[$k] = $this->css->getStyle($label);
			if ($this->elementHasChild($label, 'strong') || $this->elementHasChild($label, 'b')) {
				$styles[$k]['font-weight'] = 'bold';
			}
			if ($k) {
				foreach ($this->suspect_styles as $style) {
					if ($styles[$k][$style] != $styles[($k - 1)][$style]) {
						$form = $this->getElementAncestor($label, 'form');
						if ($form) {
							$this->addReport($form);
						}
						else {
							$this->addReport($label);
						}
					}
				}
			}
		}
	}
}

/**
*  frame element is not used.
*  This error is generated for all frame elements.
*	@link http://quail-lib.org/test-info/frameIsNotUsed
*/
class frameIsNotUsed extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'frame';

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

}

/**
*  Relationship between frames must be described.
*  If frameset element contains 3 or more frame elements then frameset element must contain a longdesc attribute that is a valid URL.
*	@link http://quail-lib.org/test-info/frameRelationshipsMustBeDescribed
*/
class frameRelationshipsMustBeDescribed extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;


	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('frameset') as $frameset) {

			if (!$frameset->hasAttribute('longdesc') && $frameset->childNodes->length > 2)
				$this->addReport($frameset);
		}
	}

}

/**
*  The source for each frame is accessible content.
*  frame content should be accessible, like HTML, not just an image.
*	@link http://quail-lib.org/test-info/frameSrcIsAccessible
*/
class frameSrcIsAccessible extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('frame') as $frame) {
			if ($frame->hasAttribute('src')) {
				$extension = array_pop(explode('.', $frame->getAttribute('src')));
				if (in_array($extension, $this->image_extensions))
					$this->addReport($frame);

			}
		}
	}

}

/**
*  All frame titles identify the purpose or function of the frame.
*  frame title must describe the purpose or function of the frame.
*	@link http://quail-lib.org/test-info/frameTitlesDescribeFunction
*/
class frameTitlesDescribeFunction extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('frame') as $frame) {
			if ($frame->hasAttribute('title'))
				$this->addReport($frame);
		}
	}

}

/**
*  All frame titles are not empty.
*  frame title can't be empty.
*	@link http://quail-lib.org/test-info/frameTitlesNotEmpty
*/
class frameTitlesNotEmpty extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('frame') as $frame) {
			if (!$frame->hasAttribute('title') || trim($frame->getAttribute('title')) == '')
				$this->addReport($frame);
		}
	}
}

/**
*  All frame titles do not contain placeholder text.
*  frame title should not contain placeholder text.
*	@link http://quail-lib.org/test-info/frameTitlesNotPlaceholder
*/
class frameTitlesNotPlaceholder extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	@var array $strings An array of strings, broken up by language domain
	*/
	var $strings = array('en' => array('title', 'frame', 'frame title', 'the title'),
							  'es' => array('t&iacute;tulo', 'marco', 't&iacute;tulo del marco', 'el t&iacute;tulo'),
							  );

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('frame') as $frame) {
			if (in_array(trim(strtolower($frame->getAttribute('title'))), $this->translation()))
				$this->addReport($frame);
		}
	}

}

/**
*  All frames have a title attribute.
*  Each frame element must have a title attribute.
*	@link http://quail-lib.org/test-info/framesHaveATitle
*/
class framesHaveATitle extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('frame') as $frame) {
			if (!$frame->hasAttribute('title'))
				$this->addReport($frame);
		}
	}

}

/**
*  frameset element is not used.
*  This error is generated for all frameset elements.
*	@link http://quail-lib.org/test-info/framesetIsNotUsed
*/
class framesetIsNotUsed extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'frameset';
}

/**
*  frameset must have a noframes section.
*  frameset element must contain a noframes section.
*	@link http://quail-lib.org/test-info/framesetMustHaveNoFramesSection
*/
class framesetMustHaveNoFramesSection extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('frameset') as $frameset) {
			if (!$this->elementHasChild($frameset, 'noframes'))
				$this->addReport($frameset);
		}
	}

}

/**
*  The header following an h1 is h1 or h2.
*  The following header must be equal, one level greater or any level less.
*	@link http://quail-lib.org/test-info/headerH1
*/
class headerH1 extends quailHeaderTest
{
	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'h1';

}

/**
*  All h1 elements are not used for formatting.
*  h1 may be used for formatting. Use the proper markup.
*	@link http://quail-lib.org/test-info/headerH1Format
*/
class headerH1Format extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'h1';
}

/**
*  The header following an h2 is h1, h2 or h3.
*  The following header must be equal, one level greater or any level less.
*	@link http://quail-lib.org/test-info/headerH2
*/
class headerH2 extends quailHeaderTest
{
	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'h2';

}

/**
*  All h2 elements are not used for formatting.
*  h2 may be used for formatting. Use the proper markup.
*	@link http://quail-lib.org/test-info/headerH2Format
*/
class headerH2Format extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'h2';
}

/**
*  The header following an h3 is h1, h2, h3 or h4.
*  The following header must be equal, one level greater or any level less.
*	@link http://quail-lib.org/test-info/headerH3
*/
class headerH3 extends quailHeaderTest
{
	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'h3';

}

/**
*  All h3 elements are not used for formatting.
*  h3 may be used for formatting. Use the proper markup.
*	@link http://quail-lib.org/test-info/headerH3Format
*/
class headerH3Format extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'h3';
}

/**
*  The header following an h5 is h6 or any header less than h6.
*  The following header must be equal, one level greater or any level less.
*	@link http://quail-lib.org/test-info/headerH4
*/
class headerH4 extends quailHeaderTest
{
	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'h4';

}

/**
*  All h4 elements are not used for formatting.
*  h4 may be used for formatting. Use the proper markup.
*	@link http://quail-lib.org/test-info/headerH4Format
*/
class headerH4Format extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'h4';
}

class headerH5 extends quailHeaderTest
{
	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'h5';

}

/**
*  All h5 elements are not used for formatting.
*  h5 may be used for formatting. Use the proper markup.
*	@link http://quail-lib.org/test-info/headerH5Format
*/
class headerH5Format extends quailTagTest{

	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'h5';
}

/**
*  All h6 elements are not used for formatting.
*  h6 may be used for formatting. Use the proper markup.
*	@link http://quail-lib.org/test-info/headerH6Format
*/
class headerH6Format extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'h6';
}

/**
*  CUSTOM TEST FOR UDOIT
*  Checks if content uses heading elements (h1 - h6) at all
*/
class noHeadings extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/

	function check()
	{
		global $doc_length;
		
		$elements = $this->getAllElements('p');

		$document_string = "";

		foreach ($elements as $element) {
			$document_string .= $element->textContent;
		}

		if (strlen($document_string) > $doc_length){

			$no_headings = 0;

			if (!$this->getAllElements('h1')
				&& !$this->getAllElements('h2')
				&& !$this->getAllElements('h3')
				&& !$this->getAllElements('h4')
				&& !$this->getAllElements('h5')
				&& !$this->getAllElements('h6')) {
				$no_headings = true;
			} else {
				$no_headings = false;
			}

			if ($no_headings) {
				$this->addReport(null, null, false);
			}
		}
	}
}

/**
*  Each section of content is marked with a header element.
*  Using the heading elements, h and h1 - h6, to markup the beginning of each section in the content can assist in navigation.
*	@link http://quail-lib.org/test-info/headersUseToMarkSections
*/
class headersUseToMarkSections extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var array $non_header_tags An array of all tags which might make this a header
	*/
	var $non_header_tags = array('strong', 'b', 'em', 'i');

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		$headers = $this->getAllElements(null, 'header');
		$paragraphs = $this->getAllElements('p');

		if (count($headers) == 0 && count($paragraphs) > 1) {
			$this->addReport(null, null, false);
		}

		foreach ($paragraphs as $p) {
			if ((is_object(@$p->firstChild)
					&& property_exists($p->firstChild, 'tagName')
					&& in_array($p->firstChild->tagName, $this->non_header_tags)
					&& trim($p->nodeValue) == trim($p->firstChild->nodeValue))
			    || (is_object(@$p->firstChild->nextSibling)
			   		&& property_exists($p->firstChild->nextSibling, 'tagName')
			   		&& in_array($p->firstChild->nextSibling->tagName, $this->non_header_tags)
			   		&& trim($p->nodeValue) == trim($p->firstChild->nextSibling->nodeValue))
			    || (is_object(@$p->previousSibling)
			   		&& property_exists($p->previousSibling, 'tagName')
			   		&& in_array($p->previousSibling->tagName, $this->non_header_tags)
					&& trim($p->nodeValue) == trim($p->previousSibling->nodeValue))) {
				$this->addReport($p);
			}
		}
	}
}

/**
*  i (italic) element is not used.
*  This error will be generated for all i elements.
*	@link http://quail-lib.org/test-info/iIsNotUsed
*/
class iIsNotUsed extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'i';
}

/**
*	Videos need to be accessible
*	@link http://quail-lib.org/test-info/iframeMustNotHaveLongdesc
*/
class videoEmbedChecked extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		$search = '/(vimeo)/';

		foreach ($this->getAllElements('iframe') as $iframe) {
			if (preg_match($search, $iframe->getAttribute('src'))) {
				$this->addReport($iframe);
			}
		}

		foreach ($this->getAllElements('a') as $link) {
			if (preg_match($search, $link->getAttribute('href'))) {
				$this->addReport($link);
			}
		}

		foreach ($this->getAllElements('object') as $object) {
			if (preg_match($search, $object->getAttribute('data'))) {
				$this->addReport($object);
			}
		}
	}
}
/**
*	iframes really shouldn't be used
*	@link http://quail-lib.org/test-info/iframeMustNotHaveLongdesc
*/
class iframeIsNotUsed extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('iframe') as $iframe) {
				$this->addReport($iframe);
		}
	}
}
/**
*  iframe must not use longdesc.
*  Iframe element cannot contain a longdesc attribute.
*	@link http://quail-lib.org/test-info/iframeMustNotHaveLongdesc
*/
class iframeMustNotHaveLongdesc extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('iframe') as $iframe) {
			if ($iframe->hasAttribute('longdesc'))
				$this->addReport($iframe);

		}
	}
}

/**
*  All active areas in all server-side image maps have duplicate text links in the document.
*  Any img element that contains ismap attribute will generate this error.
*	@link http://quail-lib.org/test-info/imageMapServerSide
*/
class imageMapServerSide extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('img') as $img) {
			if ($img->hasAttribute('ismap'))
				$this->addReport($img);
		}

	}
}

/**
*  Alt text for all img elements is the empty string ("") if the image is decorative.
*  Decorative images must have empty string ("") Alt text.
*	@link http://quail-lib.org/test-info/imgAltEmptyForDecorativeImages
*/
class imgAltEmptyForDecorativeImages extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('img') as $img) {
			if ($img->hasAttribute('alt'))
				$this->addReport($img);
		}
	}

}

/**
*  Alt text for all img elements used as source anchors identifies the destination of the link.
*  img element that is contained by an a (anchor) element must have Alt text that identifies the link destination.
*	@link http://quail-lib.org/test-info/imgAltIdentifiesLinkDestination
*/
class imgAltIdentifiesLinkDestination extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('a') as $a) {
			if (!$a->nodeValue) {
				foreach ($a->childNodes as $child) {
					if ($this->propertyIsEqual($child, 'tagName', 'img')
					   && $child->hasAttribute('alt')) {
						$this->addReport($child);
					}
				}
			}
		}

	}
}

/**
*  Alt text is not the same as the filename unless author has confirmed it is correct.
*  img element cannot have alt attribute value that is the same as its src attribute.
*	@link http://quail-lib.org/test-info/imgAltIsDifferent
*/
class imgAltIsDifferent extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('img') as $img) {
			if (trim($img->getAttribute('src')) == trim($img->getAttribute('alt')))
				$this->addReport($img);
			else if ( preg_match("/.jpg|.JPG|.png|.PNG|.gif|.GIF|.jpeg|.JPEG$/", trim($img->getAttribute('alt'))) )
				$this->addReport($img);
		}
	}

}

/**
*  Alt text for all img elements contains all text in the image unless the image text is decorative or appears elsewhere in the document.
*  This error is generated for all img elements that have a width and height greater than 50.
*	@link http://quail-lib.org/test-info/imgAltIsSameInText
*/
class imgAltIsSameInText extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('img') as $img) {
			if ($img->hasAttribute('alt'))
				$this->addReport($img);
		}

	}
}

/**
*  Image Alt text is long.
*  Image Alt text is long or user must confirm that Alt text is as short as possible.
*	@link http://quail-lib.org/test-info/imgAltIsTooLong
*/
class imgAltIsTooLong extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('img') as $img) {
			if ($img->hasAttribute('alt') && strlen($img->getAttribute('alt')) > 100)
				$this->addReport($img);
		}

	}
}

/**
*  Alt text for all img elements used as source anchors is not empty when there is no other text in the anchor.
*  img element cannot have alt attribute value of null or whitespace if the img element is contained by an A element and there is no other link text.
*	@link http://quail-lib.org/test-info/imgAltNotEmptyInAnchor
*/
class imgAltNotEmptyInAnchor extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('a') as $a) {
			if (!$a->nodeValue && $a->childNodes) {
				foreach ($a->childNodes as $child) {
					if ($this->propertyIsEqual($child, 'tagName', 'img')
						&& trim($child->getAttribute('alt')) == '')
							$this->addReport($child);
				}
			}
		}

	}
}

/**
*  Alt text for all img elements is not placeholder text unless author has confirmed it is correct.
*  img element cannot have alt attribute value of "nbsp" or "spacer".
*	@link http://quail-lib.org/test-info/imgAltNotPlaceHolder
*/
class imgAltNotPlaceHolder extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var array $strings An array of strings, broken up by language domain
	*/
	var $strings = array('en' => array('nbsp', '&nbsp;', 'spacer', 'image', 'img', 'photo'),
						 'es' => array('nbsp', '&nbsp;', 'spacer', 'espacio', 'imagen', 'img', 'foto')
						 );

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('img') as $img) {
			if ($img->hasAttribute('alt')) {
				if (strlen($img->getAttribute('alt')) > 0) {
					if (in_array($img->getAttribute('alt'), $this->translation())
					   || ord($img->getAttribute('alt')) == 194) {
						$this->addReport($img);
					}
					elseif (preg_match("/^([0-9]*)(k|kb|mb|k bytes|k byte)?$/",
							strtolower($img->getAttribute('alt')))) {
						$this->addReport($img);
					}
				}
			}
		}

	}
}

/**
*  All img elements have associated images that do not flicker.
*  This error is generated for all img elements that contain a src attribute value that ends with ".gif" (case insensitive). and have a width and height larger than 25.
*	@link http://quail-lib.org/test-info/imgGifNoFlicker
*/
class imgGifNoFlicker extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $gif_control_extension Regular expression for retrieving the GIF
	*				control extension
	*/
	var $gif_control_extension = "/21f904[0-9a-f]{2}([0-9a-f]{4})[0-9a-f]{2}00/";

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('img') as $img) {

			if (substr($img->getAttribute('src'), -4, 4) == '.gif') {
				$file = $this->getImageContent($this->getPath($img->getAttribute('src')));
				if ($file) {
					  $file = bin2hex($file);

					  // sum all frame delays
					  $total_delay = 0;
					  preg_match_all($this->gif_control_extension, $file, $matches);
					  foreach ($matches[1] as $match) {
					    // convert little-endian hex unsigned ints to decimals
					    $delay = hexdec(substr($match,-2) . substr($match, 0, 2));
					    if ($delay == 0) $delay = 1;
					    $total_delay += $delay;
					  }

					  // delays are stored as hundredths of a second, lets convert to seconds


					 if ($total_delay > 0)
					 	$this->addReport($img);
				}
			}
		}

	}

	/**
	*	Retrieves the content of an image
	*	@param string $image The URL to an image
	*/
	function getImageContent($image) {
		if (strpos($image, '://') == false) {
			return @file_get_contents($image);
		}
		if (function_exists('curl')) {
			$curl = new curl_init($image);
			curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
			$result = curl_exec($curl);
			return $result;
		}
		return false;
	}
}

/**
*  All img elements must have an alt attribute. Duh!
*	@link http://quail-lib.org/test-info/imgHasAlt
*/
class imgHasAlt extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('img') as $img) {
			if (!$img->hasAttribute('alt')
				|| $img->getAttribute('alt') == ''
				|| $img->getAttribute('alt') == ' ') {
				$this->addReport($img);
			}
		}

	}
}

/**
*  A long description is used for each img element that does not have Alt text conveying the same information as the image.
*  img element must contain a longdesc attribute.
*	@link http://quail-lib.org/test-info/imgHasLongDesc
*/
class imgHasLongDesc extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('img') as $img) {
			if ($img->hasAttribute('longdesc')) {
				if (trim(strtolower($img->getAttribute('longdesc'))) ==
					trim(strtolower($img->getAttribute('alt')))) {
						$this->addReport($img);
				}
			}
		}

	}
}

/**
*  Important images should not have spacer Alt text.
*  img element cannot have alt attribute value of whitespace if WIDTH and HEIGHT attribute values are both greater than 25.
*	@link http://quail-lib.org/test-info/imgImportantNoSpacerAlt
*/
class imgImportantNoSpacerAlt extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('img') as $img) {
			if ($img->hasAttribute('src') && $img->hasAttribute('alt') && trim($img->getAttribute('alt')) == '') {
				if ($img->getAttribute('width') > 25 || $img->getAttribute('height') > 25) {
					$this->addReport($img);
				}
				elseif (function_exists('gd_info') && (!$img->hasAttribute('width') || !$img->hasAttribute('height'))) {
					$img_file = @getimagesize($this->getPath($img->getAttribute('src')));
					if ($img_file) {
						if ($img_file[0] > 25 || $img_file[1] > 25)
							$this->addReport($img);
					}
				}
			}

		}

	}
}

/**
*  All links in all client side image-maps are duplicated within the document.
*  img element must not contain a usemap attribute unless all links in the MAP are duplicated within the document. The MAP element is referred by the USEMAP element's usemap attribute. Links within MAP are referred by area elements href attribute contained by MAP element. [Editor's Note - can duplicate links appear anywhere within content or must they be part of a link group?]
*	@link http://quail-lib.org/test-info/imgMapAreasHaveDuplicateLink
*/
class imgMapAreasHaveDuplicateLink extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		$all_links = array();
		foreach ($this->getAllElements('a') as $a) {
			$all_links[$a->getAttribute('href')] = $a->getAttribute('href');
		}
		$maps = $this->getElementsByAttribute('map', 'name', true);

		foreach ($this->getAllElements('img') as $img) {
			if ($img->hasAttribute('usemap')) {
				$usemap = $img->getAttribute('usemap');
				if (substr($usemap, 0, 1) == '#') {
					$key = substr($usemap, -(strlen($usemap) - 1), (strlen($usemap) - 1));
				}
				else {
					$key = $usemap;
				}
				if (isset($maps[$key])) {
					foreach ($maps[$key]->childNodes as $child) {
						if ($this->propertyIsEqual($child, 'tagName', 'area')) {
							if (!isset($all_links[$child->getAttribute('href')])) {
								$this->addReport($img);
							}
						}
					}
				}
			}
		}

	}
}

/**
*  All img elements that have a longdesc attribute also have an associated 'd-link'.
*  img element that contains a longdesc attribute must have a following d-link. A d-link must consist of an A element that contains only the text "d" or "D". The A element must have an href attribute that is a valid URL and is the same as the img element's longdesc attribute. The d-link must immediately follow the img element, separated only by whitespace.
*	@link http://quail-lib.org/test-info/imgNeedsLongDescWDlink
*/
class imgNeedsLongDescWDlink extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('img') as $img) {
			if ($img->hasAttribute('longdesc')) {
				$next = $this->getNextElement($img);

				if (is_object($next) && $next->tagName != 'a') {
					$this->addReport($img);
				}
				else {
					if (((!$this->propertyIsEqual($next, 'nodeValue', '[d]', true, true)
							&& !$this->propertyIsEqual($next, 'nodeValue', 'd', true, true)) )
						|| $next->getAttribute('href') != $img->getAttribute('longdesc')) {
							$this->addReport($img);
					}
				}

			}
		}

	}
}

/**
*  Non-Decorative images must have Alt text.
*  img element cannot have alt attribute value of null ("") if WIDTH and HEIGHT attribute values are both greater than 25.
*	@link http://quail-lib.org/test-info/imgNonDecorativeHasAlt
*/
class imgNonDecorativeHasAlt extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('img') as $img) {
			if ($img->hasAttribute('src') &&
				($img->hasAttribute('alt') && html_entity_decode((trim($img->getAttribute('alt')))) == '')) {
				$this->addReport($img);

			}
		}

	}
}

/**
*  For all img elements, text does not refer to the image by color alone.
*  This error is generated for all img elements that have a width and height greater than 100.
*	@link http://quail-lib.org/test-info/imgNotReferredToByColorAlone
*/
class imgNotReferredToByColorAlone extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('img') as $img) {
			if ($img->hasAttribute('alt'))
				$this->addReport($img);
		}

	}
}

/**
*  Server-side image maps are not used except when image map regions cannot be defined using an available geometric shape.
*  A server-side image map should only be used when a client-side image map can not be used.
*	@link http://quail-lib.org/test-info/imgServerSideMapNotUsed
*/
class imgServerSideMapNotUsed extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('img') as $img) {
			if ($img->hasAttribute('ismap'))
				$this->addReport($img);
		}
	}
}

/**
*  All img elements do not contain a title attribute.
*  img element must not contain the title attribute.
*	@link http://quail-lib.org/test-info/imgShouldNotHaveTitle
*/
class imgShouldNotHaveTitle extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('img') as $img) {
			if ($img->hasAttribute('title'))
				$this->addReport($img);
		}

	}
}

/**
*  All img elements with an ismap attribute have a valid usemap attribute.
*  img element may not contain an ismap attribute.
*	@link http://quail-lib.org/test-info/imgWithMapHasUseMap
*/
class imgWithMapHasUseMap extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('img') as $img) {
			if ($img->hasAttribute('ismap') && !$img->hasAttribute('usemap'))
				$this->addReport($img);
		}

	}
}

/**
*  All img elements with images containing math expressions have equivalent MathML markup.
*  This error is generated for all img elements that have a width and height greater than 100.
*	@link http://quail-lib.org/test-info/imgWithMathShouldHaveMathEquivalent
*/
class imgWithMathShouldHaveMathEquivalent extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('img') as $img) {
			if (($img->getAttribute('width') > 100
				|| $img->getAttribute('height') > 100 )
				&& (!$this->propertyIsEqual($img->nextSibling, 'tagName', 'math'))) {
							$this->addReport($img);
			}

		}
	}
}

/**
*  All input elements, type of "checkbox", have a valid tab index.
*  input element that contains a type attribute value of "checkbox" must have a tabindex attribute.
*	@link http://quail-lib.org/test-info/inputCheckboxHasTabIndex
*/
class inputCheckboxHasTabIndex extends inputTabIndex
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'input';

	/**
	*	@var string $type The type of input we're looking for
	*/
	var $type = 'checkbox';
}

/**
*  All checkbox groups are marked using fieldset and legend elements.
*  form element content must contain both fieldset and legend elements if there are related checkbox buttons.
*	@link http://quail-lib.org/test-info/inputCheckboxRequiresFieldset
*/
class inputCheckboxRequiresFieldset extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('input') as $input) {
			if ($input->getAttribute('type') == 'checkbox') {
				if (!$this->getParent($input, 'fieldset', 'body'))
					$this->addReport($input);

			}
		}
	}
}

/**
*  input should not use color alone.
*  All input elements, except those with a type of "hidden", will generate this error.
*	@link http://quail-lib.org/test-info/inputDoesNotUseColorAlone
*/
class inputDoesNotUseColorAlone extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('input') as $input) {
			if ($input->getAttribute('type') != 'hidden')
				$this->addReport($input);
		}
	}

}

/**
*  All input elements, except those with with a type attribute value of "image", do not have an alt attribute.
*  The input element is used to create many kinds of form controls. Although the HTML DTD permits the alt attribute on all of these, it should be used only on image submit buttons. User agent support for this attribute on other types of form controls is not well defined, and other mechanisms are used to label these controls.
*	@link http://quail-lib.org/test-info/inputElementsDontHaveAlt
*/
class inputElementsDontHaveAlt extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('input') as $input) {
			if ($input->getAttribute('type') != 'image' && $input->hasAttribute('alt'))
				$this->addReport($input);
		}
	}
}

/**
*  All input elements, type of "file", have a valid tab index.
*  input element that contains a type attribute value of "file" must have a tabindex attribute.
*	@link http://quail-lib.org/test-info/inputFileHasTabIndex
*/
class inputFileHasTabIndex extends inputTabIndex
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'input';

	/**
	*	@var string $type The type of input we're looking for
	*/
	var $type = 'file';
}

/**
*  Alt text for all input elements with a type attribute value of "image" identifies the purpose or function of the image.
*  input element with type of "image" must have Alt text that identifies the purpose or function of the image.
*	@link http://quail-lib.org/test-info/inputImageAltIdentifiesPurpose
*/
class inputImageAltIdentifiesPurpose extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('input') as $input) {
			if ($input->getAttribute('type') == 'image')
				$this->addReport($input);
		}
	}

}

/**
*  Image used in input element - Alt text should not be the same as the filename.
*  input elements cannot have alt attribute values that are the same as their src attribute values.
*	@link http://quail-lib.org/test-info/inputImageAltIsNotFileName
*/
class inputImageAltIsNotFileName extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('input') as $input) {
			if ($input->getAttribute('type') == 'image'
				&& strtolower($input->getAttribute('alt')) == strtolower($input->getAttribute('src')))
					$this->addReport($input);
		}
	}

}

/**
*  Image used in input element - Alt text should not be placeholder text.
*  input elements cannot have alt attribute values that are (case insensitive) (exactly) \"image\""
*	@link http://quail-lib.org/test-info/inputImageAltIsNotPlaceholder
*/
class inputImageAltIsNotPlaceholder extends imgAltNotPlaceHolder
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('input') as $input) {
			if ($input->getAttribute('type') == 'image') {
				if (in_array($input->getAttribute('alt'), $this->translation()) || ord($input->getAttribute('alt')) == 194) {
					$this->addReport($input);
				}
				elseif (preg_match("/^([0-9]*)(k|kb|mb|k bytes|k byte)?$/", strtolower($input->getAttribute('alt')))) {
					$this->addReport($input);
				}
			}
		}

	}
}

/**
*  Alt text for all input elements with a type attribute value of "image" is less than 100 characters (English) or the user has confirmed that the Alt text is as short as possible.
*  input elements must have alt attribute value of less than 100 characters (English).
*	@link http://quail-lib.org/test-info/inputImageAltIsShort
*/
class inputImageAltIsShort extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('input') as $input) {
			if ($input->getAttribute('type') == 'image' && strlen($input->getAttribute('alt')) > 100)
				$this->addReport($input);
		}
	}

}

/**
*  Alt text for all input elements with a type attribute value of "image" does not use the words "submit" or "button" (English).
*  Alt text for form submit buttons must not use the words "submit" or "button".
*	@link http://quail-lib.org/test-info/inputImageAltNotRedundant
*/
class inputImageAltNotRedundant extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var array $strings An array of strings, broken up by language domain
	*/
	var $strings = array('en' => array('submit', 'button'),
							   'es' => array('enviar', 'bot&oacute;n'),
							  );

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('input') as $input) {
			if ($input->getAttribute('type') == 'image') {
				foreach ($this->translation() as $word) {
					if (strpos($input->getAttribute('alt'), $word) !== false)
							$this->addReport($input);
				}
			}
		}
	}
}

/**
*  All input elements with a type attribute value of "image" have an alt attribute.
*  input element with type of "image" must have an alt attribute.
*	@link http://quail-lib.org/test-info/inputImageHasAlt
*/
class inputImageHasAlt extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('input') as $input) {
			if ($input->getAttribute('type') == 'image'
					&& (trim($input->getAttribute('alt')) == '' || !$input->hasAttribute('alt')))
				$this->addReport($input);
		}
	}

}

/**
*  Alt text for all input elements with a type attribute value of "image" contains all non decorative text in the image.
*  This error is generated for all input elements that have a type of "image".
*	@link http://quail-lib.org/test-info/inputImageNotDecorative
*/
class inputImageNotDecorative extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('input') as $input) {
			if ($input->getAttribute('type') == 'image')
				$this->addReport($input);
		}
	}
}

/**
*  All input elements, type of "password", have a valid tab index.
*  input element that contains a type attribute value of "password" must have a tabindex attribute.
*	@link http://quail-lib.org/test-info/inputPasswordHasTabIndex
*/
class inputPasswordHasTabIndex extends inputTabIndex
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'input';

	/**
	*	@var string $type The type of input we're looking for
	*/
	var $type = 'password';
}

/**
*  All input elements, type of "radio", have a valid tab index.
*  input element that contains a type attribute value of "radio" must have a tabindex attribute.
*	@link http://quail-lib.org/test-info/inputRadioHasTabIndex
*/
class inputRadioHasTabIndex extends inputTabIndex
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'input';

	/**
	*	@var string $type The type of input we're looking for
	*/
	var $type = 'radio';
}

/**
*  All input elements, type of "submit", have a valid tab index.
*  input element that contains a type attribute value of "submit" must have a tabindex attribute.
*	@link http://quail-lib.org/test-info/inputSubmitHasTabIndex
*/
class inputSubmitHasTabIndex extends inputTabIndex
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'input';

	/**
	*	@var string $type The type of input we're looking for
	*/
	var $type = 'submit';
}

/**
*  All input elements, type of "text", have an explicitly associated label.
*  input element that contains a type attribute value of "text" must have an associated label element. An associated label is one in which the for attribute value of the label element is the same as the id attribute value of the input element.
*	@link http://quail-lib.org/test-info/inputTextHasLabel
*/
class inputTextHasLabel extends inputHasLabel
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'input';

	/**
	*	@var string $type The type of input we're looking for
	*/
	var $type = 'text';

	/**
	*	@var bool $no_type We are not looking at the type of input here
	*/
	var $no_type = false;
}

/**
*  All input elements, type of "text", have a valid tab index.
*  input element that contains a type attribute value of "text" must have a tabindex attribute.
*	@link http://quail-lib.org/test-info/inputTextHasTabIndex
*/
class inputTextHasTabIndex extends inputTabIndex
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'input';

	/**
	*	@var string $type The type of input we're looking for
	*/
	var $type = 'text';
}

/**
*  input element, type of "text", must have default text.
*  input elements that have a type attribute value of "text" must also contain a value attribute that contains text.
*	@link http://quail-lib.org/test-info/inputTextHasValue
*/
class inputTextHasValue extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;


	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('input') as $input) {
			if ($input->getAttribute('type') == 'text' && !$input->hasAttribute('value'))
				$this->addReport($input);

		}

	}
}

/**
*  input control, type of "text", must have valid default text.
*  input element with a type of "text" cannot contain a VALUE attribute that is empty or whitespace.
*	@link http://quail-lib.org/test-info/inputTextValueNotEmpty
*/
class inputTextValueNotEmpty extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('input') as $input) {
			if (!$input->hasAttribute('value') || trim($input->getAttribute('value')) == '')
					$this->addReport($input);

		}
	}
}

/**
*  All label elements do not contain input elements.
*  label elements should not contain input elements.
*	@link http://quail-lib.org/test-info/labelDoesNotContainInput
*/
class labelDoesNotContainInput extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('label') as $label) {
			if ($this->elementHasChild($label, 'input') || $this->elementHasChild($label, 'textarea'))
				$this->addReport($label);
		}
	}
}

/**
*  Each input element has only one associated label.
*  input element must have only one associated label element.
*	@link http://quail-lib.org/test-info/labelMustBeUnique
*/
class labelMustBeUnique extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		$labels = array();
		foreach ($this->getAllElements('label') as $label) {
			if ($label->hasAttribute('for'))
				$labels[$label->getAttribute('for')][] = $label;
		}
		foreach ($labels as $label) {
			if (count($label) > 1)
				$this->addReport($label[1]);
		}
	}
}

/**
*  Each label associated with an input element contains text.
*  Label must contain some text.
*	@link http://quail-lib.org/test-info/labelMustNotBeEmpty
*/
class labelMustNotBeEmpty extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('label') as $label) {
			if (!$this->elementContainsReadableText($label)) {
				$this->addReport($label);
			}
		}
	}
}

/**
*  legend text describes the group of choices.
*  The legend must describe the group of choices.
*	@link http://quail-lib.org/test-info/legendDescribesListOfChoices
*/
class legendDescribesListOfChoices extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'legend';
}

/**
*  legend text is not empty or whitespace.
*  The legend must describe the group of choices.
*	@link http://quail-lib.org/test-info/legendTextNotEmpty
*/
class legendTextNotEmpty extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('legend') as $legend) {
			if (!$legend->nodeValue || trim($legend->nodeValue) == '')
				$this->addReport($legend);
		}
	}
}

/**
*  legend text is not placeholder text.
*  The legend must describe the group of choices.
*	@link http://quail-lib.org/test-info/legendTextNotPlaceholder
*/
class legendTextNotPlaceholder extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var array $strings An array of strings, broken up by language domain
	*/
	var $strings = array('en' => array('&nbsp;', ' ', 'legend'),
						 'es' => array('&nbsp;', ' ', 'relato'),
						);

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('legend') as $legend) {
			if (in_array(trim($legend->nodeValue), $this->translation()))
				$this->addReport($legend);
		}
	}

}

class liDontUseImageForBullet extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('li') as $li) {
			if (!$this->propertyIsEqual($li, 'nodeValue', '', true)
			   && $this->propertyIsEqual($li->firstChild, 'tagName', 'img')) {
					$this->addReport($li);
			}
		}

	}
}

/**
*  Document should use LINK for alternate content.
*  head element must contain a link element with a rel attribute value that equals "alternate" and a href attribute value that is a valid URL.
*	@link http://quail-lib.org/test-info/linkUsedForAlternateContent
*/
class linkUsedForAlternateContent extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		$head = $this->getAllElements('head');
		$head = $head[0];
		if ($head && property_exists($head, 'childNodes')) {
			foreach ($head->childNodes as $child) {
				if ($this->propertyIsEqual($child, 'tagName', 'link') && $child->getAttribute('rel') == 'alternate')
					return true;
			}
		}
		$this->addReport(null, null, false);
	}
}




/**
*  Document uses link element to describe navigation if it is within a collection.
*  The link element can provide metadata about the position of an HTML page within a set of Web units or can assist in locating content with a set of Web units.
*	@link http://quail-lib.org/test-info/linkUsedToDescribeNavigation
*/
class linkUsedToDescribeNavigation extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		$head = $this->getAllElements('head');
		$head = $head[0];
		if ($head->childNodes) {
			foreach ($head->childNodes as $child) {
				if ($this->propertyIsEqual($child, 'tagName', 'link') && $child->getAttribute('rel') != 'stylesheet')
					return true;
			}
			$this->addReport(null, null, false);
		}
	}
}

/**
*  List items must not be used to format text.
*  OL element should not contain only one LI element.
*	@link http://quail-lib.org/test-info/listNotUsedForFormatting
*/
class listNotUsedForFormatting extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements(array('ul', 'ol')) as $list) {
			$li_count = 0;
			foreach ($list->childNodes as $child) {
				if ($this->propertyIsEqual($child, 'tagName', 'li')) {
					$li_count++;
				}
			}
			if ($li_count < 2)
				$this->addReport($list);
		}

	}
}

/**
*  marquee element is not used.
*  This error will be generated for each marquee element.
*	@link http://quail-lib.org/test-info/marqueeIsNotUsed
*/
class marqueeIsNotUsed extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'marquee';

}

/**
*  menu items should not be used to format text.
*  menu element must contain one LI element.
*	@link http://quail-lib.org/test-info/menuNotUsedToFormatText
*/
class menuNotUsedToFormatText extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('menu') as $menu) {
			$list_items = 0;
			foreach ($menu->childNodes as $child) {
				if ($this->propertyIsEqual($child, 'tagName', 'li')) {
					$list_items++;
				}
			}
			if ($list_items == 1)
				$this->addReport($menu);
		}

	}
}

/**
*  noembed must have equivalent content.
*  This error is generated for each noembed element.
*	@link http://quail-lib.org/test-info/noembedHasEquivalentContent
*/
class noembedHasEquivalentContent extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'noembed';
}

/**
*  NOFRAMES section must contain text equivalent of FRAMES section.
*  This error is generated for each NOFRAMES element.
*	@link http://quail-lib.org/test-info/noframesSectionMustHaveTextEquivalent
*/
class noframesSectionMustHaveTextEquivalent extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('frameset') as $frameset) {
			if (!$this->elementHasChild($frameset, 'noframes'))
				$this->addReport($frameset);
		}
		foreach ($this->getAllElements('noframes') as $noframes) {
			$this->addReport($noframes);
		}
	}

}

/**
*  Content must be usable when object are disabled.
*  If an object element contains a codebase attribute then the codebase attribute value must be null or whitespace.
*	@link http://quail-lib.org/test-info/objectContentUsableWhenDisabled
*/
class objectContentUsableWhenDisabled extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'object';
}

/**
*  All objects do not flicker.
*  This error is generated for all object elements.
*	@link http://quail-lib.org/test-info/objectDoesNotFlicker
*/
class objectDoesNotFlicker extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'object';

}

/**
*  object must not use color alone.
*  This error is generated for every applet element.
*	@link http://quail-lib.org/test-info/objectDoesNotUseColorAlone
*/
class objectDoesNotUseColorAlone extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'object';
}

/**
*  object user interface must be accessible.
*  If an object element contains a codebase attribute then the codebase attribute value must be null or whitespace.
*	@link http://quail-lib.org/test-info/objectInterfaceIsAccessible
*/
class objectInterfaceIsAccessible extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'object';
}

/**
*  object link to multimedia file must have text transcript.
*  object element cannot contain type attribute value of "video".
*	@link http://quail-lib.org/test-info/objectLinkToMultimediaHasTextTranscript
*/
class objectLinkToMultimediaHasTextTranscript extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('object') as $object) {
			if ($object->getAttribute('type') == 'video')
				$this->addReport($object);

		}
	}

}

/**
*  All objects contain a text equivalent of the object.
*  object element must contain a text equivalent for the object in case the object can't be rendered.
*	@link http://quail-lib.org/test-info/objectMustContainText
*/
class objectMustContainText extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('object') as $object) {
			if ((!$object->nodeValue || trim($object->nodeValue) == '') && !($object->hasAttribute('aria-label') && strlen($object->getAttribute('aria-label')) > 0))
				$this->addReport($object);

		}
	}
}

/**
*  Use the embed element within the object element.
*  Each object element must contain an embed element.
*	@link http://quail-lib.org/test-info/objectMustHaveEmbed
*/
class objectMustHaveEmbed extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('object') as $object) {
			if (!$this->elementHasChild($object, 'embed'))
				$this->addReport($object);
		}
	}
}

/**
*  object must have a title.
*  object element must contain a title attribute.
*	@link http://quail-lib.org/test-info/objectMustHaveTitle
*/
class objectMustHaveTitle extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('object') as $object) {
			if (!$object->hasAttribute('title'))
				$this->addReport($object);

		}
	}

}




/**
*  object must have a valid title.
*  object element must not have a title attribute with value of null or whitespace.
*	@link http://quail-lib.org/test-info/objectMustHaveValidTitle
*/
class objectMustHaveValidTitle extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var array $strings An array of strings, broken up by language domain
	*/
	var $strings = array('en' => array('nbsp',
											'&nbsp;',
											'object',
											'an object',
											'spacer',
											'image',
											'img',
											'photo',
											' '),
							  'es' => array('nbsp',
											'&nbsp;',
											'objeto',
											'un objeto',
											'espacio',
											'imagen',
											'img',
											'foto',
											' '),
							 );

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('object') as $object) {
			if ($object->hasAttribute('title')) {
				if (trim($object->getAttribute('title')) == '')
					$this->addReport($object);
				elseif (!in_array(trim(strtolower($object->getAttribute('title'))), $this->translation()))
					$this->addReport($object);
			}
		}
	}

}

/**
*  object provides a keyboard mechanism to return focus to the parent window.
*  Ensure that keyboard users do not become trapped in a subset of the content that can only be exited using a mouse or pointing device.
*	@link http://quail-lib.org/test-info/objectProvidesMechanismToReturnToParent
*/
class objectProvidesMechanismToReturnToParent extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'object';
}

/**
*  object may require a long description.
*  This error is generated for every object element.
*	@link http://quail-lib.org/test-info/objectShouldHaveLongDescription
*/
class objectShouldHaveLongDescription extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'object';
}

/**
*  Text equivalents for object should be updated if object changes.
*  If an object element contains a codebase attribute then the codebase attribute value must be null or whitespace.
*	@link http://quail-lib.org/test-info/objectTextUpdatesWhenObjectChanges
*/
class objectTextUpdatesWhenObjectChanges extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'object';
}

/**
*  Content must be usable when objects are disabled.
*  If object element contains a CLASSid attribute and any text then this error will be generated.
*	@link http://quail-lib.org/test-info/objectUIMustBeAccessible
*/
class objectUIMustBeAccessible extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'object';
}

/**
*  Text equivalents for object should be updated if object changes.
*  If object element contains a CLASSid attribute and any text then this error will be generated.
*	@link http://quail-lib.org/test-info/objectWithClassIDHasNoText
*/
class objectWithClassIDHasNoText extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('object') as $object) {
			if ($object->nodeValue && $object->hasAttribute('classid'))
				$this->addReport($object);

		}
	}
}

/**
*  All p elements are not used as headers.
*  All p element content must not be marked with either b, u, strong, font.
*	@link http://quail-lib.org/test-info/pNotUsedAsHeader
*/
class pNotUsedAsHeader extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	var $head_tags = array('strong', 'font', 'b', 'u');

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('p') as $p) {
			$parent_tag = $p->parentNode->tagName;
			if($parent_tag != 'td' && $parent_tag != 'th'){
				if (isset($p->nodeValue) && isset($p->firstChild->nodeValue)) {
					if (($p->nodeValue == $p->firstChild->nodeValue)
						&& is_object($p->firstChild)
						&& property_exists($p->firstChild, 'tagName')
						&& in_array($p->firstChild->tagName, $this->head_tags)) {
						$this->addReport($p);
					} else {
						$style = $this->css->getStyle($p);

						if (@$style['font-weight'] == 'bold') {
							$this->addReport($p);
						}
					}
				}
			}
		}
	}
}

/**
*  All input elements, type of "password", have an explicitly associated label.
*  input element that contains a type attribute value of "password" must have an associated label element. An associated label is one in which the for attribute value of the label element is the same as the id attribute value of the input element.
*	@link http://quail-lib.org/test-info/passwordHasLabel
*/
class passwordHasLabel extends inputHasLabel
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'input';

	/**
	*	@var string $type The type of input we're looking for
	*/
	var $type = 'password';

	/**
	*	@var bool $no_type We are not looking at the type of input here
	*/
	var $no_type = false;
}

/**
*  All input elements, type of "password", have a label that is positioned close to the control.
*  input element with a type attribute value of "password" must have an associated label element positioned close to it.
*	@link http://quail-lib.org/test-info/passwordLabelIsNearby
*/
class passwordLabelIsNearby extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('input') as $input) {
			if ($input->getAttribute('type') == 'password')
				$this->addReport($input);

		}
	}
}

/**
*  pre element should not be used to create tabular layout.
*  This error is generated for each pre element.
*	@link http://quail-lib.org/test-info/preShouldNotBeUsedForTabularLayout
*/
class preShouldNotBeUsedForTabularLayout extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('pre') as $pre) {
			$rows = preg_split('/[\n\r]+/', $pre->nodeValue);
			if (count($rows) > 1)
				$this->addReport($pre);
		}

	}
}

/**
*  All input elements, type of "radio", have an explicitly associated label.
*  input element that contains a type attribute value of "radio" must have an associated label element. An associated label is one in which the for attribute value of the label element is the same as the id attribute value of the input element.
*	@link http://quail-lib.org/test-info/radioHasLabel
*/
class radioHasLabel extends inputHasLabel
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'input';

	/**
	*	@var string $type The type of input we're looking for
	*/
	var $type = 'radio';

	/**
	*	@var bool $no_type We are not looking at the type of input here
	*/
	var $no_type = false;
}

/**
*  All input elements, type of "radio", have a label that is positioned close to the control.
*  input element with a type attribute value of "radio" must have an associated label element positioned close to it.
*	@link http://quail-lib.org/test-info/radioLabelIsNearby
*/
class radioLabelIsNearby extends quailTest
{
	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('input') as $input) {
			if ($input->getAttribute('type') == 'radio')
				$this->addReport($input);

		}
	}
}

/**
*  All radio button groups are marked using fieldset and legend elements.
*  form element content must contain both fieldset and legend elements if there are related radio buttons.
*	@link http://quail-lib.org/test-info/radioMarkedWithFieldgroupAndLegend
*/
class radioMarkedWithFieldgroupAndLegend extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		$radios = array();
		foreach ($this->getAllElements('input') as $input) {
			if ($input->getAttribute('type') == 'radio') {
				$radios[$input->getAttribute('name')][] = $input;
			}
		}
		foreach ($radios as $radio) {
			if (count($radio > 1)) {
				if (!$this->getParent($radio[0], 'fieldset', 'body'))
					$this->addReport($radio[0]);
			}
		}
	}
}

/**
*	@todo This should really only fire once and shouldn't extend quailTagTest
*/

/**
*  Content must be accessible when script is disabled.
*  This error will be generated for all script elements.
*	@link http://quail-lib.org/test-info/scriptContentAccessibleWithScriptsTurnedOff
*/
class scriptContentAccessibleWithScriptsTurnedOff extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'script';
}

/**
*  script must have a noscript section.
*  script elements that occur within the body must be followed by a noscript section.
*	@link http://quail-lib.org/test-info/scriptInBodyMustHaveNoscript
*/
class scriptInBodyMustHaveNoscript extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('script') as $script) {
			if (!$this->propertyIsEqual($script->nextSibling, 'tagName', 'noscript')
				&& !$this->propertyIsEqual($script->parentNode, 'tagName', 'head'))
					$this->addReport($script);

		}
	}

}

/**
*  All onclick event handlers have an associated onkeypress event handler.
*  Any element that contains an onclick attribute must also contain an onkeypress attribute.
*	@link http://quail-lib.org/test-info/scriptOnclickRequiresOnKeypress
*/
class scriptOnclickRequiresOnKeypress extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var string $click_value Attribute that is considered a mouse-only event
	*/
	var $click_value = 'onclick';

	/**
	*	@var string $key_value Attribute that is considered a keyboard event
	*/
	var $key_value = 'onkeypress';

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements(array_keys(htmlElements::$html_elements)) as $element) {
			if (($element->hasAttribute($this->click_value)) && !$element->hasAttribute($this->key_value))
				$this->addReport($element);
		}
	}

}

/**
*  All ondblclick event handlers have corresponding keyboard-specific functions.
*  Any element that contains an ondblclick  attribute will generate this error.
*	@link http://quail-lib.org/test-info/scriptOndblclickRequiresOnKeypress
*/
class scriptOndblclickRequiresOnKeypress extends scriptOnclickRequiresOnKeypress
{
	/**
	*	@var string $click_value Attribute that is considered a mouse-only event
	*/
	var $click_value = 'ondblclick';
}

/**
*  All onmousedown event handlers have an associated onkeydown event handler.
*  Any element that contains an onmousedown attribute must also contain an onkeydown attribute.
*	@link http://quail-lib.org/test-info/scriptOnmousedownRequiresOnKeypress
*/
class scriptOnmousedownRequiresOnKeypress extends scriptOnclickRequiresOnKeypress
{
	/**
	*	@var string $click_value Attribute that is considered a mouse-only event
	*/
	var $click_value = 'onmousedown';

	/**
	*	@var string $key_value Attribute that is considered a keyboard event
	*/
	var $key_value = 'onkeydown';
}

/**
*  All onmousemove event handlers have corresponding keyboard-specific functions.
*  Any element that contains an onmousemove attribute will generate this error.
*	@link http://quail-lib.org/test-info/scriptOnmousemove
*/
class scriptOnmousemove extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var string $click_value Attribute that is considered a mouse-only event
	*/
	var $click_value = 'onmousemove';

	/**
	*	@var string $key_value Attribute that is considered a keyboard event
	*/
	var $key_value = 'onkeypress';

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements(array_keys(htmlElements::$html_elements)) as $element) {
			if (($element->hasAttribute($this->click_value)))
				$this->addReport($element);
		}
	}

}

/**
*  All onmouseout event handlers have an associated onblur event handler.
*  Any element that contains an onmouseout attribute must also contain an onblur attribute.
*	@link http://quail-lib.org/test-info/scriptOnmouseoutHasOnmouseblur
*/
class scriptOnmouseoutHasOnmouseblur extends scriptOnclickRequiresOnKeypress
{
	/**
	*	@var string $click_value Attribute that is considered a mouse-only event
	*/
	var $click_value = 'onmouseout';

	/**
	*	@var string $key_value Attribute that is considered a keyboard event
	*/
	var $key_value = 'onblur';
}

/**
*  All onmouseover event handlers have an associated onfocus event handler.
*  Any element that contains an onmouseover attribute must also contain an onfocus attribute.
*	@link http://quail-lib.org/test-info/scriptOnmouseoverHasOnfocus
*/
class scriptOnmouseoverHasOnfocus extends scriptOnclickRequiresOnKeypress
{
	/**
	*	@var string $click_value Attribute that is considered a mouse-only event
	*/
	var $click_value = 'onmouseover';

	/**
	*	@var string $key_value Attribute that is considered a keyboard event
	*/
	var $key_value = 'onfocus';
}

/**
*  All onmouseup event handlers have an associated onkeyup event handler.
*  Any element that contains an onmouseup attribute must also contain an onkeyup attribute.
*	@link http://quail-lib.org/test-info/scriptOnmouseupHasOnkeyup
*/
class scriptOnmouseupHasOnkeyup extends scriptOnclickRequiresOnKeypress
{
	/**
	*	@var string $click_value Attribute that is considered a mouse-only event
	*/
	var $click_value = 'onmouseup';

	/**
	*	@var string $key_value Attribute that is considered a keyboard event
	*/
	var $key_value = 'onkeyup';
}

/**
*  User interface for script must be accessible.
*  This error will be generated for all script elements.
*	@link http://quail-lib.org/test-info/scriptUIMustBeAccessible
*/
class scriptUIMustBeAccessible extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'script';
}

/**
*  script should not cause screen flicker.
*  This error will be generated for all script elements.
*	@link http://quail-lib.org/test-info/scriptsDoNotFlicker
*/
class scriptsDoNotFlicker extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'script';
}

/**
*  Color alone should not be used in the script.
*  This error will be generated for all script elements.
*	@link http://quail-lib.org/test-info/scriptsDoNotUseColorAlone
*/
class scriptsDoNotUseColorAlone extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'script';
}

/**
*  All select elements do not cause an extreme change in context.
*  select element cannot contain onchange attribute.
*	@link http://quail-lib.org/test-info/selectDoesNotChangeContext
*/
class selectDoesNotChangeContext extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('select') as $select) {
			if ($select->hasAttribute('onchange'))
				$this->addReport($select);

		}
	}
}

/**
*  All select elements have an explicitly associated label.
*  select element must have an associated label element. A label element is associated with the select element if the for attribute value of the label is the same as the id attribute of the select element.
*	@link http://quail-lib.org/test-info/selectHasAssociatedLabel
*/
class selectHasAssociatedLabel extends inputHasLabel
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'select';

	/**
	*	@var bool $no_type We are looking at a type-specific input element
	*/
	var $no_type = true;
}

/**
*  All select elements containing a large number options also contain optgroup elements.
*  select element content that contains 4 or more option elements must contain at least 2 optgroup elements.
*	@link http://quail-lib.org/test-info/selectWithOptionsHasOptgroup
*/
class selectWithOptionsHasOptgroup extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('select') as $select) {
			$options = 0;
			foreach ($select->childNodes as $child) {
				if ($this->propertyIsEqual($child, 'tagName', 'option')) {
					$options++;
				}
			}
			if ($options >= 4) {
				$this->addReport($select);
			}
		}
	}
}

/**
*  Sites must have a site map.
*  Each site must have a site map.
*	@link http://quail-lib.org/test-info/siteMap
*/
class siteMap extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('a') as $a) {
			if (strtolower(trim($a->nodeValue)) == 'site map')
				return true;
		}
		$this->addReport(null, null, false);
	}
}

/**
*  A "skip to content" link appears on all pages with blocks of material prior to the main document.
*  Provide a mechanism to bypass blocks of material that are repeated on multiple Web units.
*	@link http://quail-lib.org/test-info/skipToContentLinkProvided
*/
class skipToContentLinkProvided extends quailTest
{
	/**
	*	@var bool $cms This test does not apply to content management systems (is document-related)
	*/
	var $cms = false;

	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	@var array $strings An array of strings, broken up by language domain
	*/
	var $strings = array('en' => array('navigation', 'skip', 'content'),
						 'es' => array('navegaci&oacute;n', 'saltar', 'contenido'),
						);

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		$first_link = $this->getAllElements('a');
		if (!$first_link) {
			$this->addReport(null, null, false);
			return null;
		}
		$a = $first_link[0];

		if (substr($a->getAttribute('href'), 0, 1) == '#') {

			$link_text = explode(' ', strtolower($a->nodeValue));
			if (!in_array($this->translation(), $link_text)) {
				$report = true;
				foreach ($a->childNodes as $child) {
					if (method_exists($child, 'hasAttribute')) {
						if ($child->hasAttribute('alt')) {
							$alt = explode(' ', strtolower($child->getAttribute('alt') . $child->nodeValue));
							foreach ($this->translation() as $word) {
								if (in_array($word, $alt)) {
									$report = false;
								}
							}
						}
					}
				}
				if ($report) {
					$this->addReport(null, null, false);
				}
			}

		}
		else
			$this->addReport(null, null, false);

	}

}


/**
*  The tab order specified by tabindex attributes follows a logical order.
*  Provide a logical tab order when the default tab order does not suffice.
*	@link http://quail-lib.org/test-info/tabIndexFollowsLogicalOrder
*/
class tabIndexFollowsLogicalOrder extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		$index = 0;
		foreach ($this->getAllElements(null, 'form') as $form) {
			if (is_numeric($form->getAttribute('tabindex'))
				&& intval($form->getAttribute('tabindex')) != $index + 1)
					$this->addReport($form);
			$index++;
		}
	}
}

/**
*  Table captions identify the table.
*  If the table has a caption then the caption must identify the table.
*	@link http://quail-lib.org/test-info/tableCaptionIdentifiesTable
*/
class tableCaptionIdentifiesTable extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'caption';
}

/**
*  All complex data tables have a summary.
*  The summary is useful when the table has a complex structure (for example, when there are several sets of row or column headers, or when there are multiple groups of columns or rows). The summary may also be helpful for simple data tables that contain many columns or rows of data.
*	@link http://quail-lib.org/test-info/tableComplexHasSummary
*/
class tableComplexHasSummary extends quailTableTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('table') as $table) {
			if (!$table->hasAttribute('summary') && $table->firstChild->tagName != 'caption') {
				$this->addReport($table);


			}
		}

	}
}

/**
*  All data tables contain th elements.
*  Data tables must have th elements while layout tables can not have th elements.
*	@link http://quail-lib.org/test-info/tableDataShouldHaveTh
*/
class tableDataShouldHaveTh extends quailTableTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/

	function check()
	{
		// Remember: We only need to check the first tr in a table and only if there's a single th in there
		foreach ($this->getAllElements('table') as $table) {
			foreach ($table->childNodes as $child) {
				if ($this->propertyIsEqual($child, 'tagName', 'tbody') || $this->propertyIsEqual($child, 'tagName', 'thead')) {
					foreach ($child->childNodes as $tr) {
						foreach ($tr->childNodes as $th) {
							if ($this->propertyIsEqual($th, 'tagName', 'th')) {
								break 3;
							} else {
								$this->addReport($table);
								break 3;
							}
						}
					}
				} elseif ($this->propertyIsEqual($child, 'tagName', 'tr')) {
					foreach ($child->childNodes as $th) {
						if ($this->propertyIsEqual($th, 'tagName', 'th')) {
							break 2;
						} else {
							$this->addReport($table);
							break 2;
						}
					}
				}
			}
		}
	}
}


/**
*  Substitutes for table header labels must be terse.
*  abbr attribute value on th element must be less than 20 characters (English).
*	@link http://quail-lib.org/test-info/tableHeaderLabelMustBeTerse
*/
class tableHeaderLabelMustBeTerse extends quailTableTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('table') as $table) {
			foreach ($table->childNodes as $child) {
				if ($this->propertyIsEqual($child, 'tagName', 'tr')) {
					foreach ($child->childNodes as $td) {
						if ($this->propertyIsEqual($td, 'tagName', 'th')) {
							if (strlen($td->getAttribute('abbr')) > 20) {
								$this->addReport($td);
							}
						}
					}
				}
			}
		}
	}
}

/**
*  Use thead to group repeated table headers, tfoot for repeated table footers, and tbody for other groups of rows.
*	@link http://quail-lib.org/test-info/tableIsGrouped
*/
class tableIsGrouped extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('table') as $table) {
			if (!$this->elementHasChild($table, 'thead')
					|| !$this->elementHasChild($table, 'tbody')
					|| !$this->elementHasChild($table, 'tfoot')) {
				$rows = 0;
				foreach ($table->childNodes as $child) {
					if ($this->propertyIsEqual($child, 'tagName', 'tr'))
						$rows ++;
				}
				if ($rows > 4)
					$this->addReport($table);
			}
		}

	}
}

/**
*  All layout tables do not contain th elements.
*  Data tables must have th elements while layout tables can not have th elements.
*	@link http://quail-lib.org/test-info/tableLayoutDataShouldNotHaveTh
*/
class tableLayoutDataShouldNotHaveTh extends quailTableTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('table') as $table) {
			if ($this->isData($table))
				$this->addReport($table);

		}

	}

}

/**
*  All layout tables do not contain caption elements.
*  table element content cannot contain a caption element if it's a layout table.
*	@link http://quail-lib.org/test-info/tableLayoutHasNoCaption
*/
class tableLayoutHasNoCaption extends quailTableTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('table') as $table) {
			if ($this->elementHasChild($table, 'caption')) {
				$first_row = true;
				foreach ($table->childNodes as $child) {
					if ($this->propertyIsEqual($child, 'tagName', 'tr') && $first_row) {
						if (!$this->elementHasChild($child, 'th'))
							$this->addReport($table);
						$first_row = false;
					}
				}
			}
		}

	}
}

/**
*  All layout tables have an empty summary attribute or no summary attribute.
*  The table element, summary attribute for all layout tables contains no printable characters or is absent.
*	@link http://quail-lib.org/test-info/tableLayoutHasNoSummary
*/
class tableLayoutHasNoSummary extends quailTableTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('table') as $table) {
			if ($table->hasAttribute('summary') && strlen(trim($table->getAttribute('summary'))) > 1) {
				$first_row = true;
				foreach ($table->childNodes as $child) {
					if ($this->propertyIsEqual($child, 'tagName', 'tr') && $first_row) {
						if (!$this->elementHasChild($child, 'th'))
							$this->addReport($table);
						$first_row = false;
					}
				}
			}
		}

	}
}

/**
*  All layout tables make sense when linearized.
*  This error is generated for all layout tables.  If the table contains th elements then it is a data table. If the table does not contain th elements then it is a layout table.
*	@link http://quail-lib.org/test-info/tableLayoutMakesSenseLinearized
*/
class tableLayoutMakesSenseLinearized extends quailTableTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('table') as $table) {
			if (!$this->isData($table))
				$this->addReport($table);

		}

	}

}

/**
*  All data table summaries describe navigation and structure of the table.
*  The table summary can't be garbage text.
*	@link http://quail-lib.org/test-info/tableSummaryDescribesTable
*/
class tableSummaryDescribesTable extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('table') as $table) {
			if ($table->hasAttribute('summary'))
				$this->addReport($table);
		}
	}
}

/**
*  Table summaries do not duplicate the table captions.
*  The summary and the caption must be different. Caption identifies the table. Summary describes the table contents.
*	@link http://quail-lib.org/test-info/tableSummaryDoesNotDuplicateCaption
*/
class tableSummaryDoesNotDuplicateCaption extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('table') as $table) {
			if ($this->elementHasChild($table, 'caption') && $table->hasAttribute('summary')) {
				foreach ($table->childNodes as $child) {
					if ($this->propertyIsEqual($child, 'tagName', 'caption'))
						$caption = $child;
				}
				if (strtolower(trim($caption->nodeValue)) ==
						strtolower(trim($table->getAttribute('summary'))) )
				 $this->addReport($table);
			}
		}
	}
}

/**
*  All data table summaries contain text.
*  table element cannot contain an empty summary attribute if it's a data table.
*	@link http://quail-lib.org/test-info/tableSummaryIsEmpty
*/
class tableSummaryIsEmpty extends quailTableTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('table') as $table) {
			if ($table->hasAttribute('summary') && trim($table->getAttribute('summary')) == '') {
				$this->addReport($table);
			}
		}
	}
}

/**
*  All data table summaries are greater than 10 printable characters (English).
*  table element, summary attribute value must be greater than 10 characters (English) if it's a data table.
*	@link http://quail-lib.org/test-info/tableSummaryIsSufficient
*/
class tableSummaryIsSufficient extends quailTableTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('table') as $table) {
			if ($table->hasAttribute('summary') && strlen(trim($table->getAttribute('summary'))) < 11) {
				$this->addReport($table);
			}
		}
	}
}

/**
*  Use colgroup and col elements to group columns.
*	@link http://quail-lib.org/test-info/tableUseColGroup
*/
class tableUseColGroup extends quailTableTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('table') as $table) {
			if ($this->isData($table)) {
				if (!$this->elementHasChild($table, 'colgroup') && !$this->elementHasChild($table, 'col')) {
					$this->addReport($table);
				}
			}
		}
	}
}

/**
*  Long table header labels require terse substitutes.
*  th element content must be less than 20 characters (English) if th element does not contain abbr attribute.
*	@link http://quail-lib.org/test-info/tableUsesAbbreviationForHeader
*/
class tableUsesAbbreviationForHeader extends quailTableTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('table') as $table) {
			foreach ($table->childNodes as $child) {
				if ($this->propertyIsEqual($child, 'tagName', 'tr')) {
					foreach ($child->childNodes as $td) {
						if ($this->propertyIsEqual($td, 'tagName', 'th')) {
							if (strlen($td->nodeValue) > 20 && !$td->hasAttribute('abbr')) {
								$this->addReport($table);
							}
						}
					}
				}
			}
		}
	}
}

/**
*  All data tables contain a caption unless the table is identified within the document.
*  Tables must be identified by a caption unless they are identified within the document.
*	@link http://quail-lib.org/test-info/tableUsesCaption
*/
class tableUsesCaption extends quailTableTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('table') as $table) {
			if ($table->firstChild->tagName != 'caption') {
				$this->addReport($table);
			}
		}
	}
}

/**
*  Data tables that contain both row and column headers use the scope attribute to identify cells.
*  The scope attribute may be used to clarify the scope of any cell used as a header.
*	@link http://quail-lib.org/test-info/tableWithBothHeadersUseScope
*/
class tableWithBothHeadersUseScope extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('table') as $table) {
			$fail = false;

			foreach ($table->childNodes as $child) {
				if ($this->propertyIsEqual($child, 'tagName', 'tr')) {
					if ($this->propertyIsEqual($child->firstChild, 'tagName', 'td')) {
						if (!$child->firstChild->hasAttribute('scope')) {
							$fail = true;
						}
					} else {
						foreach ($child->childNodes as $td) {
							if ($td->tagName == 'th' && !$td->hasAttribute('scope')) {
								$fail = true;
							}
						}
					}
				}
			}

			if ($fail) {
				$this->addReport($table);
			}
		}
	}
}


class tableThShouldHaveScope extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('th') as $th) {
			if ($th->hasAttribute('scope')) {
				if ($th->getAttribute('scope') != 'col' && $th->getAttribute('scope') != 'row') {
					$this->addReport($th);
				}
			} else {
				$this->addReport($th);
			}
		}
	}

}

/**
*  Data tables that contain more than one row/column of headers use the id and headers attributes to identify cells.
*  id and headers attributes allow screen readers to speak the headers associated with each data cell when the relationships are too complex to be identified using the th element alone or the th element with the scope attribute.
*	@link http://quail-lib.org/test-info/tableWithMoreHeadersUseID
*/
class tableWithMoreHeadersUseID extends quailTableTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('table') as $table) {
			if ($this->isData($table)) {
				$row = 0;
				$multi_headers = false;

				foreach ($table->childNodes as $child) {
					if ($this->propertyIsEqual($child, 'tagName', 'tr')) {
						$row ++;

						foreach ($child->childNodes as $cell) {
							if ($this->propertyIsEqual($cell, 'tagName', 'th')) {
								$th[] = $cell;

								if ($row > 1) {
									$multi_headers = true;
								}
							}
						}
					}
				}

				if ($multi_headers) {
					$fail = false;

					foreach ($th as $cell) {
						if (!$cell->hasAttribute('id')) {
							$fail = true;
						}
					}

					if ($fail) {
						$this->addReport($table);
					}
				}
			}
		}
	}
}

/**
*  Table markup is used for all tabular information.
*  The objective of this technique is to present tabular information in a way that preserves relationships within the information even when users cannot see the table or the presentation format is changed.
*	@link http://quail-lib.org/test-info/tabularDataIsInTable
*/
class tabularDataIsInTable extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements(null, 'text') as $text) {
			if (strpos($text->nodeValue, "\t") !== false || $text->tagName == 'pre') {
				$this->addReport($text);
			}
		}
	}
}

/**
*  All textarea elements have an explicitly associated label.
*  All textarea elements must have an explicitly associated label.
*	@link http://quail-lib.org/test-info/textareaHasAssociatedLabel
*/
class textareaHasAssociatedLabel extends inputHasLabel
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'textarea';

	/**
	*	@var bool $no_type We are looking at a type-specific input element
	*/
	var $no_type = true;
}

/**
*  All textarea elements have a label that is positioned close to control.
*  textarea element must have an associated label element that is positioned close to it.
*	@link http://quail-lib.org/test-info/textareaLabelPositionedClose
*/
class textareaLabelPositionedClose extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'textarea';
}

/**
*  Inline SVG entries should contain a title element which describes the content of the SVG
*	@link http://quail-lib.org/test-info/svgContainsTitle
*/
class svgContainsTitle extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('svg') as $svg) {
			$title = false;
			foreach ($svg->childNodes as $child) {
				if ($this->propertyIsEqual($child, 'tagName', 'title')) {
					$title = true;
				}
			}
			if (!$title) {
				$this->addReport($svg);
			}
		}
	}
}

/**
*	HTML5 video tags have captions. There's unfortunately no way to test for captions yet...
*	@link http://quail-lib.org/test-info/videoProvidesCaptions
*/
class videoProvidesCaptions extends quailTagTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SUGGESTION;

	/**
	*	@var string $tag The tag this test will fire on
	*/
	var $tag = 'video';
}

/**
*	Links to YouTube videos must have a caption
*	@link http://quail-lib.org/test-info/videosEmbeddedOrLinkedNeedCaptions
*/
class videosEmbeddedOrLinkedNeedCaptions extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	@var array $services The services that this test will need. We're using
	*	the youtube library.
	*/
	var $services = ['youtube' => 'media/youtube'];

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		$search = '/(youtube|youtu.be)/';

		foreach ($this->getAllElements(array('a', 'embed', 'iframe')) as $video) {
			$attr = ($video->tagName == 'a')
					 ? 'href'
					 : 'src';

			if ($video->hasAttribute($attr)) {
				foreach ($this->services as $service) {
					$attr_val = $video->getAttribute($attr);
					if ( preg_match($search, $attr_val) ){
						if ($service->captionsMissing($attr_val)) {
							$this->addReport($video);
						}
					}
				}
			}
		}
	}
}

/**
*	Checks that a document is written clearly to a minimum of a 60 on the
*	Flesch Reading Ease score (9.9 max grade level).
*	@link http://quail-lib.org/test-info/documentIsWrittenClearly
*/
class documentIsWrittenClearly extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	@var array $services The services that this test will need. We're using
	*	the readability library.
	*/
	var $services = array(
		'readability' => 'readability/readability',
	);

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		$readability = $this->services['readability'];
		foreach ($this->getAllElements(null, 'text') as $element) {
			$text = strip_tags($element->nodeValue);
			if (str_word_count($text) > 25) {
				if ($readability->flesch_kincaid_reading_ease($text) < 60) {
					$this->addReport($element);
				}
			}
		}
	}

}

/**
*	Headers should have text content so as not to confuse screen-reader users
*	@link http://quail-lib.org/test-info/headersHaveText
*/
class headersHaveText extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

		/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements(null, 'header', true) as $header) {
			if (!$this->elementContainsReadableText($header)) {
				$this->addReport($header);
			}
		}
	}
}

/**
*	All labels should be associated with an input element. If not, these are considered 'orphans'
*	because they have no or the wrong "for" attribute
*	@link http://quail-lib.org/test-info/labelsAreAssignedToAnInput
*/

class labelsAreAssignedToAnInput extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

		/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('label') as $label) {
			if (!$label->hasAttribute('for') || !$input = $this->dom->getElementById($label->getAttribute('for'))) {
				$this->addReport($label);
			}
			if (!in_array($input->tagName, array('input', 'select', 'textarea'))) {
				$this->addReport($label);
			}
		}
	}
}

/**
*	ALT text on images should not be redundant across the page. Please check that all
*	images have alt text which is unique to the image.
*	@link http://quail-lib.org/test-info/imgAltTextNotRedundant
*/
class imgAltTextNotRedundant extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_SEVERE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		$alt = array();
		foreach ($this->getAllElements('img') as $img) {
			if ($img->hasAttribute('src') && $img->hasAttribute('alt')) {
				if (isset($alt[strtolower(trim($img->getAttribute('alt')))]) &&
					$alt[strtolower(trim($img->getAttribute('alt')))] !=
					strtolower(trim($img->getAttribute('src')))) {
						$this->addReport($img);
				}
				$alt[strtolower(trim($img->getAttribute('alt')))] = strtolower(trim($img->getAttribute('src')));
			}
		}
		unset($alt);
	}
}

/**
*	Jump menus that consist of a single form element should not be used
*	@link http://quail-lib.org/test-info/selectJumpMenus
*/
class selectJumpMenus extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements('select') as $select) {
			$parent = $this->getParent($select, 'form', 'body');
			$fail = true;
			if ($parent) {
				foreach ($this->getAllElements('input') as $input) {
					if ($input->hasAttribute('type') && $input->getAttribute('type') == 'submit') {
						$parent_input = $this->getParent($input, 'form', 'body');
						if ($parent_input->isSameNode($parent)) {
							$fail = false;
						}
					}
				}
			}
			if ($fail) {
				$this->addReport($select);
			}
		}
	}
}


/**
*	Text size is not less than 10px small
*	@link http://quail-lib.org/test-info/textIsNotSmall
*/
class textIsNotSmall extends quailTest
{
	/**
	*	@var int $default_severity The default severity code for this test.
	*/
	var $default_severity = QUAIL_TEST_MODERATE;

	/**
	*	The main check function. This is called by the parent class to actually check content
	*/
	function check()
	{
		foreach ($this->getAllElements(null, 'text', true) as $text) {
			$style = $this->css->getStyle($text);
			if (isset($style['font-size'])) {
				if (substr($style['font-size'], -2, 2) == 'px') {
					if (intval($style['font-size']) < 10) {
						$this->addReport($text);
					}
				}
				if (substr($style['font-size'], -2, 2) == 'em') {
					if (floatval($style['font-size']) < .63) {
						$this->addReport($text);
					}
				}
			}
		}
	}

}


/*@}*/
