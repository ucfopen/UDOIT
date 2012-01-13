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
*	This is a helper class which organizes all the HTML
*	tags into groups for finding, for example, all elements
*	which can possibly hold text that will be rendered on screen.
*
*/
class htmlElements {
	
	/**
	*	@var array An array of HTML tag names and their attributes
	*	@todo add HTML5 elements here
	*/
	static $html_elements = array(
		'img' 	 => array('text' => false),
		'p' 	 => array('text' => true),
		'pre' 	 => array('text' => true),
		'span' 	 => array('text' => true),
		'div' 	 => array('text' => true),
		'applet' => array('text' => false),
		'embed'  => array('text' => false, 'media' => true),
		'object' => array('text' => false, 'media' => true),
		'area' 	 => array('imagemap' => true),
		'b' 	 => array('text' => true, 'non-emphasis' => true),
		'i' 	 => array('text' => true, 'non-emphasis' => true),
		'font' 	 => array('text' => true, 'font' => true),
		'h1'	 => array('text' => true, 'header' => true),
		'h2'	 => array('text' => true, 'header' => true),
		'h3'	 => array('text' => true, 'header' => true),
		'h4'	 => array('text' => true, 'header' => true),
		'h5'	 => array('text' => true, 'header' => true),
		'h6'	 => array('text' => true, 'header' => true),
		'ul'	 => array('text' => true, 'list' => true),
		'dl'     => array('text' => true, 'list' => true),
		'ol' 	 => array('text' => true, 'list' => true),
		'blockquote' => array('text' => true, 'quote' => true),
		'q'		 => array('text' => true, 'quote' => true),
		'acronym' => array('acronym' => true, 'text' => true),
		'abbr'   => array('acronym' => true, 'text' => true),
		'input'  => array('form' => true),
		'select' => array('form' => true),
		'textarea' => array('form' => true),
		
	);
	
	/**
	*	Retrieves elements by an option.
	*	@param string $option The option to search fore
	*	@param bool $value Whether the option should be true or false
	*	@return array An array of HTML tag names
	*	@todo this should cache results in a static variable, as many of these can be iterated over again
	*/
	function getElementsByOption($option, $value = true) {
		foreach(self::$html_elements as $k => $element) {
			if(isset($element[$option]) && $element[$option] == $value)
				$results[] = $k;
		}
		return $results;
	}
}