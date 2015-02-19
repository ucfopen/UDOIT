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
						if ($testname === "cssTextHasContrast") {
							foreach ($problem->element->attributes as $name) {
								if ($name->name === "style") {
									$styleValue = $name->value;
									$hexColors  = [];

									preg_match_all("/(#[0-9a-f]{6}|#[0-9a-f]{3})/", $styleValue, $hexColors);

									$hexColors = array_unique($hexColors[0]);
								}
							}

							$testResult['colors'] = $hexColors;
						}

						$testResult['type']   = $testname;
						$testResult['lineNo'] = $problem->line;

						if(isset($testResult['element'])) {
							$testResult['element'] = $problem->element->tagName;
						}

						$testResult['severity']     = $severityLevel;
						$testResult['severity_num'] = $severityNumber;
						$testResult['title']        = $title;
						$testResult['description']  = $description;
						$testResult['path']         = count($this->path) > 1 ? $this->path[1] : "None";
						$testResult['html']         = $problem->getHtml();
					}

					$output[] = $testResult;
				}
			}
		}

		return $output;
	}
}
/*@}*/