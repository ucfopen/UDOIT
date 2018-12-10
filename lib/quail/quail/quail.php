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
*	@var int A severe failure
*/
define('QUAIL_TEST_SEVERE', 1);
define('QUAIL_TEST_MODERATE', 2);
define('QUAIL_TEST_SUGGESTION', 3);
define('QUAIL_LIB_VERSION', 041);

/**
*
*
*/
require_once('common/test.php');
require_once('common/css.php');
require_once('common/elements.php');
require_once('common/domExtensions.php');
require_once('common/accessibility_tests.php');

/**
*	The main interface class for quail.
*
*/
class quail {
	/**
	*	@var object The central QUAIL DOMDocument object
	*/
	var $dom;

	/**
	*	@var string The type of request this is (either 'string', 'file', or 'uri'
	*/
	var $type;

	/**
	*	@var string The value of the request. Either HTML, a URI, or the path to a file
	*/
	var $value;

	/**
	*	@var string The base URI of the current request (used to rebuild page if necessary)
	*/
	var $uri;

	/**
	*	@var string The translation domain of the currnet library
	*/
	var $domain;

	/**
	*	@var string The name of the guideline
	*/
	var $guideline_name = 'wcag';

	/**
	*	@var string The name of the reporter to use
	*/
	var $reporter_name = 'static';

	/**
	*	@var object A QUAIL reporting object
	*/
	var $reporter;

	/**
	*	@var object The central guideline object
	*/
	var $guideline;

	/**
	*	@var string The base URL for any request of type URI
	*/
	var $base_url;

	/**
	*	@var array An array of the current file or URI path
	*/
	var $path = [];

	/**
	*	@var array An array of additional CSS files to load (useful for CMS content)
	*/
	var $css_files;

	/**
	*	@var object The QuailCSS object
	*/
	var $css;

	/**
	*	@var array An array of additional options
	*/
	var $options = [
			'cms_mode'      => false,
			'start_element' => 0,
			'end_element'   => 0,
			'cms_template'  => []
		];

	/**
	*	@var bool An indicator if the DOMDocument loaded. If not, this means that the
	*			  HTML given to it was so munged it wouldn't even load.
	*/
	var $is_valid = true;

	/**
	*	The class constructor
	*	@param string $value Either the HTML string to check or the file/uri of the request
	*	@param string $guideline The name of the guideline
	*	@param string $type The type of the request (either file, uri, or string)
	*	@param string $reporter The name of the reporter to use
	*	@param string $domain The domain of the translation language to use
	*/
	function __construct($value, $guideline = 'wcag2aaa', $type = 'string', $reporter = 'static', $domain = 'en')
	{
		$this->dom = new DOMDocument();
		$this->type = $type;
		if($type == 'uri' || $type == 'file') {
			$this->uri = $value;
		}
		$this->domain = $domain;
		$this->guideline_name = $guideline;
		$this->reporter_name = $reporter;
		$this->value = $value;

	}

	/**
	*	Preapres the DOMDocument object for quail. It loads based on the file type
	*	declaration and first scrubs the value using prepareValue()
	*/
	function prepareDOM()
	{
		$this->prepareValue();
		$this->is_valid = @$this->dom->loadHTML('<?xml encoding="utf-8" ?>' . $this->value);
		$this->prepareBaseUrl($this->value, $this->type);
	}

	/**
	*	If the CMS mode options are set, then we remove some items fromt the
	*	HTML value before sending it back.
	*
	*/
	function prepareValue()
	{
		//We ignore the 'string' type because it would mean the value already contains HTML
		if($this->type == 'file' || $this->type == 'uri') {
			$this->value = @file_get_contents($this->value);
		}
	}

	/**
	*	Set global predefined options for QUAIL. First we check that the
	*	array key has been defined.
	*	@param mixed $variable Either an array of values, or a variable name of the option
	*	@param mixed $value If this is a single option, the value of the option
	*/
	function setOption($variable, $value = null)
	{
		if(!is_array($variable)) {
			$variable = [$variable => $value];
		}
		foreach($variable as $k => $value) {
			if(isset($this->options[$k])) {
				$this->options[$k] = $value;
			}
		}
	}

	/**
	*	Returns an absolute path from a relative one
	*	@param string $absolute The absolute URL
	*	@param string $relative The relative path
	*	@return string A new path
	*/

	function getAbsolutePath($absolute, $relative)
	{
	    if (substr($relative, 0, 2) == '//') {
	    	if($this->uri) {
	    		$current = parse_url($this->uri);
	    	} else {
	    		$current = ['scheme' => 'http'];
	    	}
	    	return $current['scheme'] .':'. $relative;
	    }

	    $relative_url = parse_url($relative);

		if (isset($relative_url['scheme'])) {
		    return $relative;
		}

		$absolute_url = parse_url($absolute);

		if (isset($absolute_url['path'])) {
			$path = dirname($absolute_url['path']);
		}

		if ($relative{0} == '/') {
		    $c_parts = array_filter(explode('/', $relative));
		} else {
			$a_parts = array_filter(explode('/', $path));
			$r_parts = array_filter(explode('/', $relative));
			$c_parts = array_merge($a_parts, $r_parts);

			foreach ($c_parts as $i => $part) {
			    if ($part == '.') {
			    	$c_parts[$i] = NULL;
			    }

			    if ($part == '..') {
			    	$c_parts[$i - 1] = NULL;
			    	$c_parts[$i] = NULL;
			    }
			}

			$c_parts = array_filter($c_parts);
		}

		$path = implode('/', $c_parts);
		$url  = "";

		if (isset($absolute_url['scheme'])) {
			$url = $absolute_url['scheme'] .'://';
		}

		if (isset($absolute_url['user'])) {
			$url .= $absolute_url['user'];

			if ($absolute_url['pass']) {
			    $url .= ':'. $absolute_url['user'];
			}

			$url .= '@';
		}

		if (isset($absolute_url['host'])) {
			$url .= $absolute_url['host'];

			if(isset($absolute_url['port'])) {
				$url .= ':'. $absolute_url['port'];
			}

			$url .= '/';
		}

		$url .= $path;

		return $url;
	}

	/**
	*	Sets the URI if this is for a string or to change where
	*	QUAIL will look for resources like CSS files
	*	@param string $uri The URI to set
	*/
	function setUri($uri)
	{
		if (parse_url($uri)) {
			$this->uri = $uri;
		}
	}

	/**
	*	Formats the base URL for either a file or uri request. We are essentially
	*	formatting a base url for future reporters to use to find CSS files or
	*	for tests that use external resources (images, objects, etc) to run tests on them.
	*	@param string $value The path value
	*	@param string $type The type of request
	*/
	function prepareBaseUrl($value, $type)
	{
		if ($type == 'file') {
			$path = explode('/', $this->uri);
			array_pop($path);
			$this->path = $path;
		} elseif ($type == 'uri' || $this->uri) {
			$parts = explode('://', $this->uri);
			$this->path[] = $parts[0] .':/';

			if (is_array($parts[1])) {
				foreach(explode('/', $this->getBaseFromFile($parts[1])) as $part) {
					$this->path[] = $part;
				}
			} else {
				$this->path[] = $parts[1] .'/';
			}
		}
	}

	/**
	*	Retrieves the absolute path to a file
	*	@param string $file The path to a file
	*	@return string The absolute path to a file
	*/
	 function getBaseFromFile($file)
	 {
		 $find = '/';
		 $after_find = substr(strrchr($file, $find), 1);
		 $strlen_str = strlen($after_find);
		 $result = substr($file, 0, -$strlen_str);

		 return $result;
	 }

	/**
	*	Helper method to add an additional CSS file
	*	@param string $css The URI or file path to a CSS file
	*/
	function addCSS($css)
	{
		if (is_array($css)) {
			$this->css_files = $css;
		} else {
			$this->css_files[] = $css;
		}
	}

	/**
	*	Retrives a single error from the current reporter
	*	@param string $error The error key
	*	@return object A QuailReportItem object
	*/
	function getError($error)
	{
		return $this->reporter->getError($error);
	}

	/**
	*	A local method to load the required file for a reporter and set it for the current QUAIL object
	*	@param array $options An array of options for the reporter
	*/
	function loadReporter($options = [])
	{
		$classname = 'report'.ucfirst($this->reporter_name);

		if (!class_exists($classname)) {
			require_once('reporters/reporter.'. $this->reporter_name .'.php');
		}

		$this->reporter = new $classname($this->dom, $this->css, $this->guideline, $this->path);

		if (count($options)) {
			$this->reporter->setOptions($options);
		}
	}


	/**
	*	Checks that the DOM object is valid or not
	*	@return bool Whether the DOMDocument is valid
	*/
	function isValid()
	{
		return $this->is_valid;
	}

	/**
	*	Starts running automated checks. Loads the CSS file parser
	*	and the guideline object.
	*/
	function runCheck($options = null)
	{
		$this->prepareDOM();

		if (!$this->isValid()) {
			return false;
		}

		$this->getCSSObject();
		$classname = ucfirst(strtolower($this->guideline_name)).'Guideline';

		if (!class_exists($classname)) {
			require_once('guidelines/'. $this->guideline_name .'.php');
		}

		$this->guideline = new $classname($this->dom, $this->css, $this->path, $options, $this->domain, $this->options['cms_mode']);
	}

	/**
	*	Loads the quailCSS object
	*/
	function getCSSObject()
	{
		$this->css = new quailCSS($this->dom, $this->uri, $this->type, $this->path, false, $this->css_files);
	}

	/**
	*	Returns a formatted report from the current reporter.
	*	@param array $options An array of all the options
	*	@return mixed See the documentation on your reporter's getReport method.
	*/
	function getReport($options = [])
	{
		if(!$this->reporter)
			$this->loadReporter($options);
		if($options) {
			$this->reporter->setOptions($options);
		}
		$report = $this->reporter->getReport();
		$path = $this->path;
		return ['report' => $report, 'path' => $path];
	}

	/**
	*	Runs one test on the current DOMDocument
	*	@pararm string $test The name of the test to run
	*	@reutrn object The QuailReportItem returned from the test
	*/
	function getTest($test)
	{
		if(!class_exists($test)) {
			return false;
		}

		$test_class = new $test($this->dom, $this->css, $this->path);

		return $test_class->report;
	}

	/**
	*	Retrieves the default severity of a test
	*	@pararm string $test The name of the test to run
	*	@reutrn object The severity level of the test
	*/
	function getTestSeverity($test)
	{
		$test_class = new $test($this->dom, $this->css, $this->path);

		return $test_class->getSeverity();
	}

	/**
	*	A general cleanup function which just does some memory
	*	cleanup by unsetting the particularly large local vars.
	*/
	function cleanup()
	{
		unset($this->dom);
		unset($this->css);
		unset($this->guideline);
		unset($this->reporter);
	}
}

/**
*	The base classe for a reporter
*/
class quailReporter {
	/**
	*	@var object The current document's DOMDocument
	*/
	var $dom;

	/**
	*	@var object The current quailCSS object
	*/
	var $css;

	/**
	*	@var array An array of test names and the translation for the problems with it
	*/
	var $translation;

	/**
	*	@var array A collection of quailReportItem objects
	*/
	var $report;

	/**
	*	@var array The path to the current document
	*/
	var $path;

	/**
	*	@var object Additional options for this reporter
	*/
	var $options;

	/**
	*	@var array An array of attributes to search for to turn into absolute paths rather than
	*			   relative paths
	*/
	var $absolute_attributes = ['src', 'href'];

	/**
	*	The class constructor
	*	@param object $dom The current DOMDocument object
	*	@param object $css The current QuailCSS object
	*	@param object $guideline The current guideline object
	*	@param string $domain The current translation domain
	*	@param string $path The current path
	*/
	function __construct(&$dom, &$css, &$guideline, $path = '')
	{
		$this->dom = &$dom;
		$this->css = &$css;
		$this->path = $path;
		$this->options = new stdClass;
		$this->guideline = &$guideline;
	}

	/**
	*	Sets options for the reporter
	*	@param array $options an array of options
	*/
	function setOptions($options)
	{
		foreach ($options as $key => $value) {
			$this->options->$key = $value;
		}
	}

	/**
	*	Sets the absolute path for an element
	*	@param object $element A DOMElement object to turn into an absolute path
	*/
	function setAbsolutePath(&$element)
	{
		foreach ($this->absolute_attributes as $attribute) {
			if ($element->hasAttribute($attribute)) {
				$attr = $attribute;
			}
		}

		if ($attr) {
			$item = $element->getAttribute($attr);
			//We are ignoring items with absolute URLs
			if (strpos($item, '://') === false) {
				$item = implode('/', $this->path) . ltrim($item, '/');
				$element->setAttribute($attr, $item);
			}
		}

		if ($element->tagName == 'style') {
			if (strpos($element->nodeValue, '@import') !== false) {

			}
		}
	}

}

/**
*	A report item. There is one per issue with the report
*
*/
class quailReportItem {

	/**
	*	@var object The DOMElement that the report item refers to (if any)
	*/
	var $element;

	/**
	*	@var string The error message
	*/
	var $message;

	/**
	*	@var bool Whether the check needs to be manually verified
	*/
	var $manual;

	/**
	*	@var bool For document-level tests, this says whether the test passed or not
	*/
	var $pass;

	/**
	*   @var object For issues with more than two possible states, this contains information about the state
	*/
	var $state;

	/**
	*	Returns the line number of the report item. Unfortunately we can't use getLineNo
	*	if we are before PHP 5.3, so if not we try to get the line number through a more
	*	circuitous way.
	*/
	function getLine()
	{
		if (is_object($this->element) && method_exists($this->element, 'getLineNo')) {
			return $this->element->getLineNo();
		}

		return 0;
	}

	/**
	*	Returns the current element in plain HTML form
	*	@param array $extra_attributes An array of extra attributes to add to the element
	*	@return string An HTML string version of the provided DOMElement object
	*/
	function getHTML($extra_attributes = [])
	{
		if (!$this->element) {
			return '';
		}

		$result_dom = new DOMDocument();
		$result_dom->formatOutput = true;
		$result_dom->preserveWhiteSpace = false;

		try {
			$result_element = $result_dom->importNode($this->element, true);
		} catch (Exception $e) {
			return false;
		}

		foreach ($this->element->attributes as $attribute) {
			if ($attribute->name != 'quail_style_index') {
				$result_element->setAttribute($attribute->name, $attribute->value);
			}
		}

		foreach ($extra_attributes as $name => $value) {
			$result_element->setAttribute($name, $value);
		}

		//We utf8 encode per http://us2.php.net/manual/en/domdocument.save.php#67952
		//$result_dom->appendChild(utf8_encode($result_element));
		@$result_dom->appendChild($result_element);
		return @$result_dom->saveHTML();
	}
}

/**
*	The base class for a guideline
*
*/
class quailGuideline {
	/**
	*	@var object The current document's DOMDocument
	*/
	var $dom;

	/**
	*	@var object The current quailCSS object
	*/
	var $css;

	/**
	*	@var array The path to the current document
	*/
	var $path;

	/**
	*	@var array An array of report objects
	*/
	var $report;

	/**
	*	@var array An array of translations for all this guideline's tests
	*/
	var $translations;

	/**
	*	@var bool Whether we are running in CMS mode
	*/
	var $cms_mode = false;

	/**
	*	@var array An array of all the severity levels for every test
	*/
	var $severity = [];

	/**
	*	The class constructor
	*	@param object $dom The current DOMDocument object
	*	@param object $css The current QuailCSS object
	*	@param string $path The current path
	*/

	function __construct(&$dom, &$css, &$path, $arg = null, $domain = 'en', $cms_mode = false)
	{
		$this->dom = &$dom;
		$this->css = &$css;
		$this->path = &$path;
		$this->cms_mode = $cms_mode;
		$this->loadTranslations($domain);
		$this->run($arg, $domain);
	}

	/**
	*	Returns an array of all the tests associated with the current guideline
	*	@return array
	*/
	function getTests()
	{
		return $this->tests;
	}

	/**
	*	Loads translations from a file. This can be overriden, just as long as the
	*	local variable 'translations' is an associative array with test function names
	*	as the key
	*/
	function loadTranslations($domain)
	{
		$csv = fopen(dirname(__FILE__) .'/guidelines/translations/'. $domain .'.txt', 'r');

		if ($csv) {
		    while ($translation = fgetcsv($csv)) {
				if (count($translation) == 4) {
					$this->translations[$translation[0]] = [
						'title'       => $translation[1],
						'description' => $translation[2],
					];
				}
			}
		}
	}
	/**
	*	Returns the translation for a test name.
	*	@param string $test The function name of the test
	*/
	function getTranslation($testname)
	{
		$translation = (isset($this->translations[$testname]))
						? $this->translations[$testname]
						: $testname;

		return $translation;
	}
	/**
	*	Iterates through each test string, makes a new test object, and runs it against the current DOM
	*/
	function run($arg = null, $language = 'en')
	{
		foreach ($this->tests as $testname => $options) {
			if (is_numeric($testname) && !is_array($options)) {
				$testname = $options;
			}

			if (class_exists($testname) && $this->dom) {
				$$testname = new $testname($this->dom, $this->css, $this->path, $language, $arg);

				if (!$this->cms_mode || ($$testname->cms && $this->cms_mode)) {
					$this->report[$testname] = $$testname->getReport();
				}

				$this->severity[$testname] = $$testname->default_severity;
				unset($$testname);
			} else {
				$this->report[$testname] = false;
			}
		}
	}

	/**
	*	Returns all the Report variable
	*	@reutrn mixed Look to your report to see what it returns
	*/
	function getReport()
	{
		return $this->report;
	}

	/**
	*	Returns the severity level of a given test
	*	@param string $testname The name of the test
	*	@return int The severity level
	*/
	function getSeverity($testname)
	{
		if (isset($this->tests[$testname]['severity'])) {
			return $this->tests[$testname]['severity'];
		}

		if (isset($this->severity[$testname])) {
			return $this->severity[$testname];
		}

		return QUAIL_TEST_MODERATE;
	}
}
