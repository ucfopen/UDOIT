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

/** \addtogroup reporters */
/*@{*/
/**
*	Returns a formatted HTML view of the problems
*/
class reportCodeHighlight extends quailReporter {
	
	/**
	*	@var array An array of the classnames to be associated with items
	*/	
	var $classnames = array(QUAIL_TEST_SEVERE => 'quail_severe',
							QUAIL_TEST_MODERATE => 'quail_moderate',
							QUAIL_TEST_SUGGESTION => 'quail_suggestion',
							);
	
	/**
	*	The getReport method - we iterate through every test item and
	*	add additional attributes to build the report UI.
	*	@return string A fully-formed HTML document.
	*/
	function getReport() {
		$problems = $this->guideline->getReport();
		if(is_array($problems)) {
			foreach($problems as $testname => $test) {
				if(!isset($this->options->display_level) || $this->options->display_level >= $test['severity'] && is_array($test)) {
					foreach($test as $k => $problem) {
						if(is_object($problem) 
						   && property_exists($problem, 'element') 
						   && is_object($problem->element)) {
							//Wrap each error with a "wrapper" node who's tag name is the severity
							//level class. We'll fix this later and change them back to 'span' elements
							//after we have converted the HTML code to entities.
							$severity_wrapper = $this->dom->createElement($this->classnames[$test['severity']]);
							$severity_wrapper->setAttribute('class', $this->classnames[$test['severity']] .' '. $testname);
							$severity_wrapper->setAttribute('test', $testname);
							$severity_wrapper->appendChild($problem->element->cloneNode(TRUE));
							$parent = $problem->element->parentNode;
							if(is_object($parent)) {
								$parent->replaceChild($severity_wrapper, $problem->element);
							}
						}
					}
				}
			}
		}		
		$this->dom->formatOutput = true;
		$html = htmlspecialchars($this->dom->saveHTML());
		$html = str_replace('&quot;', '"', $html);
		foreach($this->classnames as $severity => $name) {
			$html = preg_replace('/&lt;'. $name .'([^&]+)+\&gt;/', '<span \\1>', $html);
			$html = str_replace('&lt;/'. $name .'&gt;', '</span>', $html);
		}
		return $html;
	}
}

/*@}*/