<?php


/**
*	@link http://www.w3.org/Style/CSS/Test/CSS3/Selectors/current/html/index.html
*/

class TestOfCSSTests extends UnitTestCase {

	function getCSSObject($url) {
		$dom = new DOMDocument();
		@$dom->loadHTML(file_get_contents($url));
		$uri = $url;
		$type = 'uri';
		$path = '/';
		return new quailCSS($dom, $uri, $type, $path);
	}

	function test_wcagCss1() {
		$css = $this->getCSSObject('http://www.w3.org/Style/CSS/Test/CSS3/Selectors/current/html/tests/css3-modsel-1.html');
		$paragraph = $css->dom->getElementsByTagName('p');
		$style = $css->getStyle($paragraph->item(0));
		$this->assertTrue($style['background-color'] == 'lime');
		foreach($css->dom->getElementsByTagName('li') as $li) {
			$style = $css->getStyle($li);
			$this->assertTrue($style['background-color'] == 'lime');
		}
	}


	function test_wcagCss2() {
		$css = $this->getCSSObject('http://www.w3.org/Style/CSS/Test/CSS3/Selectors/current/html/tests/css3-modsel-2.html');
		$paragraph = $css->dom->getElementsByTagName('address');
		$style = $css->getStyle($paragraph->item(0));
		$this->assertTrue($style['background-color'] == 'lime');
	}

	function test_wcagCss3() {
		$css = $this->getCSSObject('http://www.w3.org/Style/CSS/Test/CSS3/Selectors/current/html/tests/css3-modsel-3a.html');
		$paragraph = $css->dom->getElementsByTagName('p');
		$style = $css->getStyle($paragraph->item(0));
		$this->assertTrue($style['color'] == 'lime');
		$li = $css->dom->getElementsByTagName('li');
		$style = $css->getStyle($li->item(0));
		$this->assertTrue($style['color'] == 'lime');
	}

	function test_wcagCss4() {
		$css = $this->getCSSObject('http://www.w3.org/Style/CSS/Test/CSS3/Selectors/current/html/tests/css3-modsel-4.html');
		$paragraph = $css->dom->getElementsByTagName('p');
		$style = $css->getStyle($paragraph->item(0));
		$this->assertTrue($style['background-color'] == 'lime');
	}


	function test_wcagCss7b() {
		$css = $this->getCSSObject('http://www.w3.org/Style/CSS/Test/CSS3/Selectors/current/html/tests/css3-modsel-7b.html');
		$paragraph = $css->dom->getElementsByTagName('p');
		$style = $css->getStyle($paragraph->item(0));
		$this->assertTrue($style['background'] == 'lime');
	}

	function test_wcagCss13() {
		$css = $this->getCSSObject('http://www.w3.org/Style/CSS/Test/CSS3/Selectors/current/html/tests/css3-modsel-13.html');
		foreach($css->dom->getElementsByTagName('li') as $li) {
			$style = $css->getStyle($li);
			$this->assertTrue($style['background-color'] == 'lime');
		}
	}

	function test_wcagCss14b() {
		$css = $this->getCSSObject('http://www.w3.org/Style/CSS/Test/CSS3/Selectors/current/html/tests/css3-modsel-14b.html');
		$paragraph = $css->dom->getElementsByTagName('p');
		$style = $css->getStyle($paragraph->item(0));
		$this->assertTrue($style['background'] == 'green');
		$this->assertTrue($style['color'] == 'white');
		$style = $css->getStyle($paragraph->item(1));
		$this->assertTrue($style['background'] == 'green');
	}

	function test_wcagCss14c() {
		$css = $this->getCSSObject('http://www.w3.org/Style/CSS/Test/CSS3/Selectors/current/html/tests/css3-modsel-14c.html');
		$paragraph = $css->dom->getElementsByTagName('p');
		$div = $css->dom->getElementsByTagName('div');
		$style = $css->getStyle($div->item(0));
		$this->assertTrue($style['background'] == 'green');
		$address = $css->dom->getElementsByTagName('address');
		$style = $css->getStyle($div->item(0));
		$this->assertTrue($style['background'] == 'green');
	}

	function test_wcagCss14d() {
		$css = $this->getCSSObject('http://www.w3.org/Style/CSS/Test/CSS3/Selectors/current/html/tests/css3-modsel-14d.html');
		$paragraph = $css->dom->getElementsByTagName('p');
		$style = $css->getStyle($paragraph->item(0));
		$this->assertTrue($style['background'] == 'green');
		$this->assertTrue($style['color'] == 'white');
	}

	function test_wcagCss14e() {
		$css = $this->getCSSObject('http://www.w3.org/Style/CSS/Test/CSS3/Selectors/current/html/tests/css3-modsel-14e.html');
		$paragraph = $css->dom->getElementsByTagName('p');
		$style = $css->getStyle($paragraph->item(0));
		$this->assertTrue($style['background'] == 'green');
		$this->assertTrue($style['color'] == 'white');
		$div = $css->dom->getElementsByTagName('div');
		$address = $css->dom->getElementsByTagName('address');
	}

	function test_wcagCss15() {
		$css = $this->getCSSObject('http://www.w3.org/Style/CSS/Test/CSS3/Selectors/current/html/tests/css3-modsel-15.html');
		foreach($css->dom->getElementsByTagName('li') as $li) {
			$style = $css->getStyle($li);
			$this->assertTrue($style['background-color'] == 'lime');
		}
	}

	function test_wcagCss15b() {
		$css = $this->getCSSObject('http://www.w3.org/Style/CSS/Test/CSS3/Selectors/current/html/tests/css3-modsel-15b.html');
		$paragraph = $css->dom->getElementsByTagName('p');
		$style = $css->getStyle($paragraph->item(0));
		$this->assertTrue($style['background'] == 'green');
		$this->assertTrue($style['color'] == 'white');
		$div = $css->dom->getElementsByTagName('div');
		$style = $css->getStyle($div->item(0));
		$this->assertTrue($style['background'] == 'green');

	}

	/**
	*	We are skipping pseudo classes
	*/
	function test_wcagCss43() {
		$css = $this->getCSSObject('http://www.w3.org/Style/CSS/Test/CSS3/Selectors/current/html/tests/css3-modsel-43.html');
		$paragraphs = $css->dom->getElementsByTagName('p');
		$style = $css->getStyle($paragraphs->item(0));
		$this->assertTrue($style['background-color'] == 'lime');
		$style = $css->getStyle($paragraphs->item(1));
		$this->assertTrue($style['background-color'] == 'lime');
		$style = $css->getStyle($paragraphs->item(2));
		$this->assertTrue($style['background-color'] != 'lime');
	}

	function test_wcagCss43b() {
		$css = $this->getCSSObject('http://www.w3.org/Style/CSS/Test/CSS3/Selectors/current/html/tests/css3-modsel-43b.html');
		$paragraphs = $css->dom->getElementsByTagName('p');
		$style = $css->getStyle($paragraphs->item(0));
		$this->assertTrue($style['background-color'] != 'lime');
		$style = $css->getStyle($paragraphs->item(1));
		$this->assertTrue($style['background-color'] != 'lime');
		$style = $css->getStyle($paragraphs->item(2));
		$this->assertTrue($style['background-color'] == 'lime');
	}

	/**
	*	Child combinator (#44)
	*/
	function test_wcagCss44() {
		$css = $this->getCSSObject('http://www.w3.org/Style/CSS/Test/CSS3/Selectors/current/html/tests/css3-modsel-44.html');
		$paragraphs = $css->dom->getElementsByTagName('p');
		$style = $css->getStyle($paragraphs->item(2));
		$this->assertTrue($style['background-color'] != 'lime');
	}

	/**
	*	Color text
	*/
	function test_wcagCssColorText301() {
		$css = $this->getCSSObject('http://www.w3.org/Style/CSS/Test/CSS3/Color/current/html4/t0301-color-text-a.htm');
		$paragraphs = $css->dom->getElementsByTagName('p');
		$style = $css->getStyle($paragraphs->item(0));
		$this->assertTrue($style['color'] == 'green');
	}
}


$tests = new TestOfCSSTests();
$tests->run(new HtmlReporter());
