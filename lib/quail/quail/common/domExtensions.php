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
*	An older attempt at using dom element exteions to introduce
*	finding the styling of an element.
*	@deprecated
*/
class QuailDOMElement extends DOMElement {

	var $css_style;
	
	function setCSS($css) {
		$this->css_style = $css;
	}
	
	function getStyle($style = false) {
		if(!$style)
			return $this->css_style;
		else return $this->css_style[$style];
	}
}