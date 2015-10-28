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
*	An array reporter that simply returns an unformatted and nested PHP array of 
*	tests and report objects
*/

class reportArray extends quailReporter {
	
	/**
	*	Generates a static list of errors within a div.
	*	@return array A nested array of tests and problems with Report Item objects
	*/
	function getReport() {
		$results = $this->guideline->getReport();
		if(!is_array($results))
			return null;
		foreach($results as $testname => $test) {
			$translation = $this->guideline->getTranslation($testname);
			$output[$testname]['severity'] = $this->guideline->getSeverity($testname);
			$output[$testname]['title'] =  $translation['title'];
			$output[$testname]['body'] = $translation['description'];
			foreach($test as $k => $problem) {
				if(is_object($problem)) {
					$output[$testname]['problems'][$k]['element'] =  htmlentities($problem->getHtml());
					$output[$testname]['problems'][$k]['line'] =  $problem->getLine();
					if($problem->message) {
						$output[$testname]['problems']['message'] = $problem->message;
					}
					$output[$testname]['problems']['pass'] = $problem->pass;
				}
			}
		}
		return $output;
	}
}
/*@}*/