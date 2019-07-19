<?php
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
* @file
This class first parses all the CSS in the document and prepares
an index of CSS styles to be used by accessibility tests to determine color and
positioning.

First, in loadCSS we get all the inline and linked style sheet information
	and merge it into a large CSS file string.

Second, in setStyles we use XPath queries to find all the DOM elements which are
effected by CSS styles and then build up an index in style_index of all the CSS
styles keyed by an attriute we attach to all DOM objects to lookup the style quickly.

Most of the second step is to get around the problem where XPath DOMNodeList objects
are only marginally referential to the original elements and cannot be altered directly.

*/

/**
*	A helper class to parse the document's CSS so we can run accessibility
*	tests against it.
*/
class quailCSS {

	/**
	*	@var object The DOMDocument object of the current document
	*/
	var $dom;

	/**
	*	@var string The URI of the current document
	*/
	var $uri;

	/**
	*	@var string The type of request (inherited from the main QUAIL object)
	*/
	var $type;

	/**
	*	@var array An array of all the CSS elements and attributes
	*/
	var $css;

	/**
	*	@var string Additional CSS information (usually for CMS mode requests)
	*/
	var $css_string;

	/**
	*	@var bool Whether or not we are running in CMS mode
	*/
	var $cms_mode;

	/**
	*	@var array An array of all the strings which means the current style inherts from above
	*/
	var $inheritance_strings = array('inherit', 'currentColor');

	/**
	*	@var array An array of all the styles keyed by the new attribute quail_style_index
	*/
	var $style_index = array();

	/**
	*	@var int The next index ID to be applied to a node to lookup later in style_index
	*/
	var $next_index = 0;

	/**
	*	@var array A list of all the elements which support deprecated styles such as 'background' or 'bgcolor'
	*/
	var $deprecated_style_elements = array('body', 'table', 'tr', 'td', 'th');

	/**
	*	Class constructor. We are just building and importing variables here and then loading the CSS
	*	@param object $dom The DOMDocument object
	*	@param string $uri The URI of the request
	*	@param string $type The type of request
	*	@param bool $cms_mode Whether we are running in CMS mode
	*	@param array $css_files An array of additional CSS files to load
	*/
	function __construct(&$dom, $uri, $type, $path, $cms_mode = false, $css_files = array()) {
		$this->dom =& $dom;
		$this->type = $type;
		$this->uri = $uri;
		$this->path = $path;
		$this->cms_mode = $cms_mode;
		$this->css_files = $css_files;
	}


	/**
	*	Sets all the styles from the CSS index into the style_index variable.
	*	To do this, because DOMNodeList doesn't return real elements, we are actually
	*	setting and attribute on all nodes that references back to a style index we maintain
	*	in the CSS class itself
	*/
	// private function setStyles() {
	// 	if(!is_array($this->css)) {
	// 		return null;
	// 	}
	// 	foreach($this->css as $selector => $style) {
	// 		$xpath = new DOMXPath($this->dom);
	// 		$entries = @$xpath->query($this->getXpath($selector));
	// 		if($entries->length) {
	// 			foreach($entries as $e) {
	// 				if(!$e->hasAttribute('quail_style_index')) {
	// 					$e->setAttribute('quail_style_index', $this->next_index);
	// 					$this->next_index++;
	// 				}
	// 				// $this->addCSSToElement($e, $style, $this->getSpecificity($selector));
	// 			}
	// 		}
	// 	}
	// 	foreach($this->style_index as $k => $style) {
	// 		foreach($style as $i => $values) {
	// 			$this->style_index[$k][$i] = trim(strtolower($values['value']));
	// 		}
	// 	}
	// }

	/**
	*	Adds the provided CSS to the element's style entry in style_index. We first
	*	check the specificity against the items already in the index.
	*	@param object $element The DOMNode/DOMElement object
	*	@param array $style The provided CSS Style
	*	@param int $specificity The specificity total for the CSS selector
	*/
	// private function addCSSToElement($element, $style, $specificity) {
	// 	$index_id = $element->getAttribute('quail_style_index');
	// 	foreach($style as $name => $value) {
	// 		if(!$this->style_index[$index_id][$name] ||
	// 		    $this->style_index[$index_id][$name]['specificity'] < $specificity
	// 		    || strpos($value, '!important') !== false)
	// 		{
	// 			$this->style_index[$index_id][$name] = array(
	// 				'value' => str_replace('!important', '', trim(strtolower($value))),
	// 				'specificity' => $specificity,
	// 			);
	// 	   }
	// 	}

	// }

	/**
	*	Loads all the CSS files from the document using LINK elements or @import commands
	*/
	private function loadCSS() {
		if(count($this->css_files) > 0) {
			$css = $this->css_files;
		}
		else {
			$css = array();
			$header_styles = $this->dom->getElementsByTagName('style');
			foreach($header_styles as $header_style) {
				if($header_style->nodeValue) {
					$this->css_string .= $header_style->nodeValue;
				}
			}
			$style_sheets = $this->dom->getElementsByTagName('link');

			foreach($style_sheets as $style) {
				if($style->hasAttribute('rel') &&
					strtolower($style->getAttribute('rel')) == 'stylesheet' &&
					$style->getAttribute('media') != 'print') {
						$css[] = $style->getAttribute('href');
				}
			}
		}
		foreach($css as $sheet) {
			$this->loadUri($sheet);
		}
		$this->loadImportedFiles();
		$this->css_string = str_replace(':link', '', $this->css_string);
		$this->formatCSS();
	}

	/**
	*	Imports files from the CSS file using @import commands
	*/
	private function loadImportedFiles() {
		$matches = array();
		preg_match_all('/@import (.*?);/i', $this->css_string, $matches);
		if(count($matches[1]) == 0) {
			return null;
		}
		foreach($matches[1] as $match) {
			$this->loadUri(trim(str_replace('url', '', $match), '"\')('));
		}
		preg_replace('/@import (.*?);/i', '', $this->css_string);
	}

	/**
	*	Returns a specificity count to the given selector.
	*	Higher specificity means it overrides other styles.
	*	@param string selector The CSS Selector
	*/
	public function getSpecificity($selector) {
		$selector = $this->parseSelector($selector);
		if($selector[0][0] == ' ') {
			unset($selector[0][0]);
		}
		$selector = $selector[0];
		$specificity = 0;
		foreach($selector as $part) {
			switch(substr(str_replace('*', '', $part), 0, 1)) {
				case '.':
					$specificity += 10;
				case '#':
					$specificity += 100;
				case ':':
					$specificity++;
				default:
					$specificity++;
			}
			if(strpos($part, '[id=') != false) {
				$specificity += 100;
			}
		}
		return $specificity;
	}

	/**
	*	Interface method for tests to call to lookup the style information for a given DOMNode
	*	@param object $element A DOMElement/DOMNode object
	*	@return array An array of style information (can be empty)
	*/
	public function getStyle($element) {
		//To prevent having to parse CSS unless the info is needed,
		//we check here if CSS has been set, and if not, run off the parsing
		//now.
		// if(!$this->css) {
		// 	$this->loadCSS();
		// 	$this->setStyles();
		// }
		if(!is_a($element, 'DOMElement')) {
			return array();
		}
		$style = $this->getNodeStyle($element);
		if(isset($style['background-color']) || isset($style['color'])){
			$style = $this->walkUpTreeForInheritance($element, $style);
		}
		if($element->hasAttribute('style')) {
			$inline_styles = explode(';', $element->getAttribute('style'));
			foreach($inline_styles as $inline_style) {
				$s = explode(':', $inline_style);

				if(isset($s[1])){	// Edit:  Make sure the style attribute doesn't have a trailing ;
					$style[trim($s[0])] = trim(strtolower($s[1]));
				}
			}
		}
		if($element->tagName === "strong"){
			$style['font-weight'] = "bold";
		}
		if($element->tagName === "em"){
			$style['font-style'] = "italic";
		}
		if(!is_array($style)) {
			return array();
		}
		return $style;
	}

	/**
	*	Adds a selector to the CSS index
	*	@param string $key The CSS selector
	*	@param string $codestr The CSS Style code string
	*/

	private function addSelector($key, $codestr) {
		if(strpos($key, '@import') !== false) {
			return null;
		}
		$key = strtolower($key);
		$codestr = strtolower($codestr);
		if(!isset($this->css[$key])) {
			$this->css[$key] = array();
		}
		$codes = explode(";",$codestr);
		if(count($codes) > 0) {
			foreach($codes as $code) {
				$code = trim($code);
				$explode = explode(":",$code,2);
				if(count($explode) > 1) {
					list($codekey, $codevalue) = $explode;
					if(strlen($codekey) > 0) {
						$this->css[$key][trim($codekey)] = trim($codevalue);
					}
				}
			}
		}
	}

	/**
	*	Returns the style from the CSS index for a given element by first
	*	looking into its tag bucket then iterating over every item for an
	*	element that matches
	*	@param object The DOMNode/DOMElement object in queryion
	*	@retun array An array of all the style elements that _directly_ apply
	*	 			 to that element (ignoring inheritance)
	*
	*/
	private function getNodeStyle($element) {
		$style = array();

		if($element->hasAttribute('quail_style_index')) {
			$style = $this->style_index[$element->getAttribute('quail_style_index')];
		}
		// To support the deprecated 'bgcolor' attribute
		if($element->hasAttribute('bgcolor') &&  in_array($element->tagName, $this->deprecated_style_elements)) {
			$style['background-color'] = $element->getAttribute('bgcolor');
		}
		if($element->hasAttribute('style')) {
			$inline_styles = explode(';', $element->getAttribute('style'));
			foreach($inline_styles as $inline_style) {
				$s = explode(':', $inline_style);

				if(isset($s[1])){	// Edit:  Make sure the style attribute doesn't have a trailing ;
					$style[trim($s[0])] = trim(strtolower($s[1]));
				}
			}
		}

		return $style;
	}

	/**
	*	A helper function to walk up the DOM tree to the end to build an array
	*	of styles.
	*	@param object $element The DOMNode object to walk up from
	*	@param array $style The current style built for the node
	*	@return array The array of the DOM element, altered if it was overruled through css inheritance
	*/
	private function walkUpTreeForInheritance($element, $style) {
		while(property_exists($element->parentNode, 'tagName')) {
			$parent_style = $this->getNodeStyle($element->parentNode);
			if(is_array($parent_style)) {
				foreach($parent_style as $k => $v) {
					if(!isset($style[$k]) /*|| in_array($style[$k]['value'], $this->inheritance_strings)*/) {
						$style[$k] = $v;
					}

					if((!isset($style['background-color'])) || strtolower($style['background-color']) == strtolower("#FFFFFF")){
						if($k == 'background-color'){
							$style['background-color'] = $v;
						}
					}

					if((!isset($style['color'])) || strtolower($style['color']) == strtolower("#000000")){
						if($k == 'color'){
							$style['color'] = $v;
						}
					}
				}
			}
			$element = $element->parentNode;
		}
		return $style;
	}

	/**
	*	Loads a CSS file from a URI
	*	@param string $rel The URI of the CSS file
	*/
	private function loadUri($rel) {
		if($this->type == 'file') {
			$uri = substr($this->uri, 0, strrpos($this->uri, '/')) .'/'.$rel;
		}
		else {
			$uri = quail::getAbsolutePath($this->uri, $rel);
		}
		$this->css_string .= @file_get_contents($uri);

	}

	/**
	* 	Formats the CSS to be ready to import into an array of styles
	*	@return bool Whether there were elements imported or not
	*/
	private function formatCSS() {
		// Remove comments
		$str = preg_replace("/\/\*(.*)?\*\//Usi", "", $this->css_string);
		// Parse this damn csscode
		$parts = explode("}",$str);
		if(count($parts) > 0) {
			foreach($parts as $part) {
				if(strpos($part, '{') !== false) {
					list($keystr,$codestr) = explode("{", $part);
					$keys = explode(",",trim($keystr));
					if(count($keys) > 0) {
						foreach($keys as $key) {
							if(strlen($key) > 0) {
								$key = str_replace("\n", "", $key);
								$key = str_replace("\\", "", $key);
								$this->addSelector($key, trim($codestr));
							}
						}
					}
				}
			}
		}
		return (count($this->css) > 0);
	}

	/**
	*	Converts a CSS selector to an Xpath query
	*	@param string $selector The selector to convert
	*	@return string An Xpath query string
	*/
	private function getXpath($selector) {
		$query = $this->parseSelector($selector);

		$xpath = '//';
		foreach($query[0] as $k => $q) {
			if($q == ' ' && $k)
				$xpath .= '//';
			elseif($q == '>' && $k)
				$xpath .= '/';
			elseif(substr($q, 0, 1) == '#')
				$xpath .= '[ @id = "'. str_replace('#', '', $q) .'" ]';

			elseif(substr($q, 0, 1) == '.')
				$xpath .= '[ @class = "'. str_replace('.', '', $q) .'" ]';
			elseif(substr($q, 0, 1) == '[')
				$xpath .= str_replace('[id', '[ @ id', $q);
			else
				$xpath .= trim($q);
		}
		return str_replace('//[', '//*[', str_replace('//[ @', '//*[ @', $xpath));
	}

	/**
	*	Checks that a string is really a regular character
	*	@param string $char The character
	*	@return bool Whether the string is a character
	*/
	private function isChar($char) {
		return extension_loaded('mbstring')
			? mb_eregi('\w', $char)
			: preg_match('@\w@', $char);
	}

	/**
	*	Parses a CSS selector into an array of rules.
	*	@param string $query The CSS Selector query
	*	@return arran An array of the CSS Selector parsed into rule segments
	*/
	private function parseSelector($query) {
		// clean spaces
		// TODO include this inside parsing ?
		$query = trim(
			preg_replace('@\s+@', ' ',
				preg_replace('@\s*(>|\\+|~)\s*@', '\\1', $query)
			)
		);
		$queries = array(array());
		if (! $query)
			return $queries;
		$return =& $queries[0];
		$specialChars = array('>',' ');
//		$specialCharsMapping = array('/' => '>');
		$specialCharsMapping = array();
		$strlen = mb_strlen($query);
		$classChars = array('.', '-');
		$pseudoChars = array('-');
		$tagChars = array('*', '|', '-');
		// split multibyte string
		// http://code.google.com/p/phpquery/issues/detail?id=76
		$_query = array();
		for ($i=0; $i<$strlen; $i++)
			$_query[] = mb_substr($query, $i, 1);
		$query = $_query;
		// it works, but i dont like it...
		$i = 0;
		while( $i < $strlen) {
			$c = $query[$i];
			$tmp = '';
			// TAG
			if ($this->isChar($c) || in_array($c, $tagChars)) {
				while(isset($query[$i])
					&& ($this->isChar($query[$i]) || in_array($query[$i], $tagChars))) {
					$tmp .= $query[$i];
					$i++;
				}
				$return[] = $tmp;
			// IDs
			} else if ( $c == '#') {
				$i++;
				while( isset($query[$i]) && ($this->isChar($query[$i]) || $query[$i] == '-')) {
					$tmp .= $query[$i];
					$i++;
				}
				$return[] = '#'.$tmp;
			// SPECIAL CHARS
			} else if (in_array($c, $specialChars)) {
				$return[] = $c;
				$i++;
			// MAPPED SPECIAL MULTICHARS
//			} else if ( $c.$query[$i+1] == '//') {
//				$return[] = ' ';
//				$i = $i+2;
			// MAPPED SPECIAL CHARS
			} else if ( isset($specialCharsMapping[$c])) {
				$return[] = $specialCharsMapping[$c];
				$i++;
			// COMMA
			} else if ( $c == ',') {
				$queries[] = array();
				$return =& $queries[ count($queries)-1 ];
				$i++;
				while( isset($query[$i]) && $query[$i] == ' ')
					$i++;
			// CLASSES
			} else if ($c == '.') {
				while( isset($query[$i]) && ($this->isChar($query[$i]) || in_array($query[$i], $classChars))) {
					$tmp .= $query[$i];
					$i++;
				}
				$return[] = $tmp;
			// ~ General Sibling Selector
			} else if ($c == '~') {
				$spaceAllowed = true;
				$tmp .= $query[$i++];
				while( isset($query[$i])
					&& ($this->isChar($query[$i])
						|| in_array($query[$i], $classChars)
						|| $query[$i] == '*'
						|| ($query[$i] == ' ' && $spaceAllowed)
					)) {
					if ($query[$i] != ' ')
						$spaceAllowed = false;
					$tmp .= $query[$i];
					$i++;
				}
				$return[] = $tmp;
			// + Adjacent sibling selectors
			} else if ($c == '+') {
				$spaceAllowed = true;
				$tmp .= $query[$i++];
				while( isset($query[$i])
					&& ($this->isChar($query[$i])
						|| in_array($query[$i], $classChars)
						|| $query[$i] == '*'
						|| ($spaceAllowed && $query[$i] == ' ')
					)) {
					if ($query[$i] != ' ')
						$spaceAllowed = false;
					$tmp .= $query[$i];
					$i++;
				}
				$return[] = $tmp;
			// ATTRS
			} else if ($c == '[') {
				$stack = 1;
				$tmp .= $c;
				while( isset($query[++$i])) {
					$tmp .= $query[$i];
					if ( $query[$i] == '[') {
						$stack++;
					} else if ( $query[$i] == ']') {
						$stack--;
						if (! $stack )
							break;
					}
				}
				$return[] = $tmp;
				$i++;
			// PSEUDO CLASSES
			} else if ($c == ':') {
				$stack = 1;
				$tmp .= $query[$i++];
				while( isset($query[$i]) && ($this->isChar($query[$i]) || in_array($query[$i], $pseudoChars))) {
					$tmp .= $query[$i];
					$i++;
				}
				// with arguments ?
				if ( isset($query[$i]) && $query[$i] == '(') {
					$tmp .= $query[$i];
					$stack = 1;
					while( isset($query[++$i])) {
						$tmp .= $query[$i];
						if ( $query[$i] == '(') {
							$stack++;
						} else if ( $query[$i] == ')') {
							$stack--;
							if (! $stack )
								break;
						}
					}
					$return[] = $tmp;
					$i++;
				} else {
					$return[] = $tmp;
				}
			} else {
				$i++;
			}
		}
		foreach($queries as $k => $q) {
			if (isset($q[0])) {
				if (isset($q[0][0]) && $q[0][0] == ':')
					array_unshift($queries[$k], '*');
				if ($q[0] != '>')
					array_unshift($queries[$k], ' ');
			}
		}
		return $queries;
	}

}
