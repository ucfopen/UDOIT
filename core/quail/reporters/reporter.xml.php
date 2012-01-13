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
*	Returns an ATOM feed of all the issues - useful to run this as a web service
*/

class reportXml extends quailReporter {
	
	/**
	*	Generates an ATOM feed of accessibility problems
	*	@return array A nested array of tests and problems with Report Item objects
	*/
	function getReport() {
		$output = "<?xml version='1.0' encoding='utf-8'?>
					<feed xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'
						xsi:quail='http://schemas.quail-lib.org/results/2010.xsd'>";
		$results = $this->guideline->getReport();
		if(!is_array($results))
			return null;
		foreach($results as $testname => $test) {
			$translation = $this->guideline->getTranslation($testname);
			$output .= "\n\t<quail:test quail:testname='$testname' quail:severity='".
					   $this->guideline->getSeverity($testname) ."'>
					   <updated>". date('c') ."</updated>";
			$output .= "\n\t<quail:title>". $translation['title'] ."</quail:title>";
			$output .= "\n\t<quail:description><![CDATA[". $translation['description'] ."]]></quail:description>";
			$output .= "\n\t<quail:problems>";
			foreach($test as $k => $problem) {
				if(is_object($problem)) {
					$output .= "\n\t<quail:entities><![CDATA[". htmlentities($problem->getHtml()) ."]]></quail:entities>";
					$output .= "\n\t<quail:line>". $problem->getLine() ."</quail:line>";
					if($problem->message) {
						$output .= "\n\t<quail:message>$problem->message</quail:message>";
					}
					$output .= "\n\t<quail:pass>$problem->pass</quail:pass>";
				}
			}
			$output .= "\n\t</quail:problems>";
			$output .= "</quail:test>";
		}
		$output .= "</feed>";
		return $output;
	}
}
/*@}*/