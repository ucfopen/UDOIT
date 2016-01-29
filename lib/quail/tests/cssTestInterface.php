<?php
include('../quail/common/css.php');
class cssTestInterface {

	var $dom;
	
	var $file_base = 'testfiles/css/';
	
	var $path;
	
	function __construct($filename) {
		$filename = $this->file_base . $filename;
		$this->dom = new DOMDocument();
		$this->dom->loadHTMLFile($filename);
		$this->css = new quailCSS($this->dom, $filename, 'file', $this->getPath($this->file_base));
	}
	
	function renderHTML() {
		$xpath = new DOMXPath($this->dom);
		$entries = $xpath->query('//*');
		foreach($entries as $element) {
			$style = $this->css->getStyle($element);
			$element->setAttribute('title' , 'b: '. $style['background-color'] .' f: '. $style['color']);
		}
		return $this->dom->saveHTML();
	}
	
	function getPath($path) {
		$parts = explode('://', $this->uri);
			$this->path[] = $parts[0] .':/';
			if(is_array($parts[1])) {
				foreach(explode('/', $this->getBaseFromFile($parts[1])) as $part) {
					$this->path[] = $part;
				}
			}
			else { 
				$this->path[] = $parts[1] .'/';
			}
	}
}

$test = new cssTestInterface('cssComplexTest1.html');
/*print_r($test->css->dom_index);
foreach($test->css->dom_index as $i) {
	print $i[0]['element']->tagName .'<br>';
	print_r($i[0]['style']);
	print '<hr>';

}*/
print $test->renderHTML();