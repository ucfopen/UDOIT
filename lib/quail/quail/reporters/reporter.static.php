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
*	A static reporter. Generates a list of errors which do not pass and their severity.
*	This is just a demonstration of what you can do with a reporter.
*/

class reportStatic extends quailReporter
{
	/**
	*	Generates a static list of errors within a div.
	*	@return string A fully-formatted report
	*/
	function getReport()
	{
		$output = [];

		foreach ($this->guideline->getReport() as $testname => $test) {
			$severity    = $this->guideline->getSeverity($testname);
			$translation = $this->guideline->getTranslation($testname);

			if(isset($translation['title'])) {
				$title = $translation['title'];
			} else {
				$title = NULL;
			}

			if(isset($translation['description'])) {
				$description = $translation['description'];
			} else {
				$description = NULL;
			}

			switch ($severity) {
				case QUAIL_TEST_SEVERE:
					$severityLevel  = 'Error';
					$severityNumber = 1;
					break;
				case QUAIL_TEST_MODERATE:
					$severityLevel  = 'Warning';
					$severityNumber = 2;
					break;
				case QUAIL_TEST_SUGGESTION:
					$severityLevel  = 'Suggestion';
					$severityNumber = 3;
					break;
			}

			if (is_array($test)) {
				foreach ($test as $k => $problem) {
					$testResult           = [];
					if (is_object($problem)) {
						$testResult['text_type']	= $problem->message;
						if ($testname === "cssTextHasContrast" || $testname === "cssTextStyleEmphasize") {
							$styleValue = $problem->message;

							$hexColors  = [];
							$styleMatches = [];
							$weightMatches = [];

							preg_match_all("/(#[0-9a-f]{6}|#[0-9a-f]{3})/", $styleValue, $hexColors);
							preg_match("/font-style:\s([a-z]*);/", $styleValue, $styleMatches);
							preg_match("/font-weight:\s([a-z]*);/", $styleValue, $weightMatches);
							$hexColors = array_unique($hexColors[0]);

							$testResult['colors'] = $hexColors;
							$testResult['back_color'] = $hexColors[0];
							$testResult['fore_color'] = $hexColors[1];
							$testResult['font_style'] = $styleMatches[1];
							$testResult['font_weight'] = $weightMatches[1];
							if($testResult['font-weight'] === "bolder"){
								$testResult['font-weight'] = "bold";
							}
							$testResult['text_type']	= preg_replace('/(?=:).+/', '', $problem->message);

						}

						$testResult['type']   	= $testname;
						$testResult['lineNo'] 	= $problem->line;

						if(isset($testResult['element'])) {
							$testResult['element'] = $problem->element->tagName;
						}

						//Edit description for certain cases
						switch($testname) {
							case 'videosEmbeddedOrLinkedNeedCaptions':
								if($problem->manual == true) {
									$testResult['description']  = $description.'check for stuff';
								} else {
									$testResult['description']  = $description;
								}
								break;

							default:
								error_log("testname is ".serialize($testname));
								$testResult['description']  = $description;
								break;
						}
						//$testResult['description']  = $description;

						$testResult['severity']     = $severityLevel;
						$testResult['severity_num'] = $severityNumber;
						$testResult['title']        = $title;
						$testResult['path']         = count($this->path) > 1 ? $this->path[1] : "None";
						$testResult['html']	        = $problem->getHtml();
						$testResult['state']        = $problem->state;
						$testResult['manual']       = $problem->manual;
					}

					$output[] = $testResult;
				}
			}
		}

		return $output;
	}
}
/*@}*/
