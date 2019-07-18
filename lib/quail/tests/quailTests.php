<?php

class TestOfQuailTests extends UnitTestCase {

	function getTest($file, $test) {
		$name = explode('-', $file);

		$filename = 'testfiles/quail/'. $file;
		 $quail = new quail($filename, 'wcag1a', 'file');
		$quail->runCheck();

		return $quail->getTest($test);
	}

	function test_svgContainsTitle() {
		$results = $this->getTest('svgContainsTitle-fail.html', 'svgContainsTitle');
		$this->assertTrue($results[0]->element->tagName == 'svg');
		$results = $this->getTest('svgContainsTitle-pass.html', 'svgContainsTitle');
		$this->assertTrue(count($results) == 0);
	}
	function test_cssTextHasContrast() {
		$results = $this->getTest('cssContrast.html', 'cssTextHasContrast');
		$this->assertTrue($results[0]->element->tagName == 'p');
	}

	function test_complexCssTextHasContrast() {
		$results = $this->getTest('cssContrast2.html', 'cssTextHasContrast');
		$this->assertTrue($results[0]->element->tagName == 'p');
	}

	function test_cssTextContrastWithColorConversion() {
		$results = $this->getTest('cssContrast3.html', 'cssTextHasContrast');
		$this->assertTrue($results[0]->element->tagName == 'div');

	}

	function test_cssTextContrastWithComplexBackground() {
		$results = $this->getTest('cssContrast4.html', 'cssTextHasContrast');
		$this->assertTrue($results[0]->element->tagName == 'pre');

	}
	function test_cssTextContrastWithInlineAndIncludedFiles() {
		$results = $this->getTest('cssContrast5.html', 'cssTextHasContrast');
		$this->assertTrue($results[0]->element->tagName == 'pre');

	}
	function test_videoProvidesCaptions() {
		$results = $this->getTest('videoTestFail.html', 'videoProvidesCaptions');
		$this->assertTrue($results[0]->element->tagName == 'video');

	}

	function test_videosEmbeddedOrLinkedNeedCaptions() {
		$results = $this->getTest('videosEmbeddedOrLinkedNeedCaptions-fail.html',
								  'videosEmbeddedOrLinkedNeedCaptions');
		$this->assertTrue($results[0]->element->tagName == 'a');

		$results = $this->getTest('videosEmbeddedOrLinkedNeedCaptions-pass.html',
								  'videosEmbeddedOrLinkedNeedCaptions');
		$this->assertTrue(count($results) == 0);

	}

	function test_videoCaptionsAreCorrectLanguage() {
		$results = $this->getTest('videoCaptionsAreCorrectLanguage-fail.html','videoCaptionsAreCorrectLanguage');
		$this->assertTrue($results[0]->element->tagName == 'a');

		$results = $this->getTest('videoCaptionsAreCorrectLanguage-pass.html','videoCaptionsAreCorrectLanguage');
		$this->assertTrue(count($results) == 0);
	}

	function test_documentIsWrittenClearly() {
		$results = $this->getTest('documentIsWrittenClearly-fail.html', 'documentIsWrittenClearly');
		$this->assertTrue($results[0]->element->tagName == 'p');

		$results = $this->getTest('documentIsWrittenClearly-pass.html', 'documentIsWrittenClearly');
		$this->assertTrue(count($results) == 0);

		$results = $this->getTest('documentIsWrittenClearly-pass-2.html', 'documentIsWrittenClearly');
		$this->assertTrue(count($results) == 0);

	}

	function test_headersHaveText() {
		$results = $this->getTest('headersHaveText-fail.html', 'headersHaveText');
		$this->assertTrue($results[0]->element->tagName == 'h2');

		$results = $this->getTest('headersHaveText-fail2.html', 'headersHaveText');
		$this->assertTrue($results[0]->element->tagName == 'h2');

		$results = $this->getTest('headersHaveText-pass.html', 'headersHaveText');
		$this->assertTrue(count($results) == 0);

	}

	function test_labelsAreAssignedToAnInput() {
		$results = $this->getTest('labelsAreAssignedToAnInput-fail.html', 'labelsAreAssignedToAnInput');
		$this->assertTrue($results[0]->element->tagName == 'label');

		$results = $this->getTest('labelsAreAssignedToAnInput-fail2.html', 'labelsAreAssignedToAnInput');
		$this->assertTrue($results[0]->element->tagName == 'label');

		$results = $this->getTest('labelsAreAssignedToAnInput-fail3.html', 'labelsAreAssignedToAnInput');
		$this->assertTrue($results[0]->element->tagName == 'label');

		$results = $this->getTest('labelsAreAssignedToAnInput-pass.html', 'labelsAreAssignedToAnInput');
		$this->assertTrue(count($results) == 0);

	}

	function test_imgAltTextNotRedundant() {
		$results = $this->getTest('imgAltTextNotRedundant-fail.html', 'imgAltTextNotRedundant');
		$this->assertTrue($results[0]->element->tagName == 'img');

		$results = $this->getTest('imgAltTextNotRedundant-pass.html', 'imgAltTextNotRedundant');
		$this->assertTrue(count($results) == 0);

	}

	function test_selectJumpMenus() {
		$results = $this->getTest('selectJumpMenus-fail.html', 'selectJumpMenus');
		$this->assertTrue($results[0]->element->tagName == 'select');

		$results = $this->getTest('selectJumpMenus-pass.html', 'selectJumpMenus');
		$this->assertTrue(count($results) == 0);

	}

	function test_textIsNotSmall() {
		$results = $this->getTest('textIsNotSmall-fail.html', 'textIsNotSmall');
		$this->assertTrue($results[0]->element->tagName == 'p');

		$results = $this->getTest('textIsNotSmall-pass.html', 'textIsNotSmall');
		$this->assertTrue(count($results) == 0);

		$results = $this->getTest('textIsNotSmall-fail2.html', 'textIsNotSmall');
		$this->assertTrue($results[0]->element->tagName == 'p');
	}
}

$tests = &new TestOfQuailTests();
$tests->run(new HtmlReporter());
