<?php

class UfixitTest extends PHPUnit_Framework_TestCase
{
    protected $data;

    public function setUp () {
        $this->data = [
            'api_key'       => '',
            'base_uri'      => '',
            'content_id'    => '',
            'course_id'     => ''
        ];
    }

    public function tearDown () {
        unset($data);
    }

    private function checkOutputBuffer() {
        $buffer         = ob_get_clean();
        $this->assertEquals('', $buffer);
    }

    public function testFixAltText() {
        $error_html     = '<img src="https://webcourses.ucf.edu/courses/1234567/image.jpg" alt="">';
        $new_content    = 'test';
        $expected       = '<img src="https://webcourses.ucf.edu/courses/1234567/image.jpg" alt="test">';

        ob_start();
        $temp           = new Ufixit($this->data);
        $output         = $temp->fixAltText($error_html, $new_content);

        $this->assertEquals($expected, $output);
        $this->checkOutputBuffer();
    }

    public function testFixCssColorOneColorBold() {
        $error_html     = '<span style="color: #ffff00;">Bad Contrasting Text</span>';
        $error_colors   = ['ffff00'];
        $new_content    = ['000000'];
        $expected       = '<span style="color: #000000; font-weight: bold;">Bad Contrasting Text</span>';
        $bold           = true;
        $italic         = false;

        ob_start();
        $temp           = new Ufixit($this->data);
        $output         = $temp->fixCssColor($error_colors, $error_html, $new_content, $bold, $italic);

        $this->assertEquals($expected, $output);
        $this->checkOutputBuffer();
    }

    public function testFixCssColorTwoColorsItalic() {
        $error_html     = '<span style="color: #ffff00; background: #ffffff;">Bad Contrasting Text</span>';
        $error_colors   = ['ffff00', 'ffffff'];
        $new_content    = ['000000', 'fffff0'];
        $expected       = '<span style="color: #000000; background: #fffff0; font-style: italic;">Bad Contrasting Text</span>';
        $bold           = false;
        $italic         = true;

        ob_start();
        $temp           = new Ufixit($this->data);
        $output         = $temp->fixCssColor($error_colors, $error_html, $new_content, $bold, $italic);

        $this->assertEquals($expected, $output);
        $this->checkOutputBuffer();
    }

    public function testFixCssColorTwoColorsBoldItalic() {
        $error_html     = '<span style="color: #ffff00; background: #ffffff;">Bad Contrasting Text</span>';
        $error_colors   = ['ffff00', 'ffffff'];
        $new_content    = ['000000', 'fffff0'];
        $expected       = '<span style="color: #000000; background: #fffff0; font-weight: bold; font-style: italic;">Bad Contrasting Text</span>';
        $bold           = true;
        $italic         = true;

        ob_start();
        $temp           = new Ufixit($this->data);
        $output         = $temp->fixCssColor($error_colors, $error_html, $new_content, $bold, $italic);

        $this->assertEquals($expected, $output);
        $this->checkOutputBuffer();
    }

    public function testFixLinkNewText() {
        $error_html     = '<a href="https://webcourses.ucf.edu/courses/1234567/image.jpg"></a>';
        $new_content    = 'test';
        $expected       = '<a href="https://webcourses.ucf.edu/courses/1234567/image.jpg">test</a>';

        ob_start();
        $temp           = new Ufixit($this->data);
        $output         = $temp->fixLink($error_html, $new_content);

        $this->assertEquals($expected, $output);
        $this->checkOutputBuffer();
    }

    public function testFixLinkDeleteLink() {
        $error_html     = '<a href="https://webcourses.ucf.edu/courses/1234567/image.jpg"></a>';
        $new_content    = '';
        $expected       = '';

        ob_start();
        $temp           = new Ufixit($this->data);
        $output         = $temp->fixLink($error_html, $new_content);

        $this->assertEquals($expected, $output);
        $this->checkOutputBuffer();
    }

    public function testFixHeadingNewHeading() {
        $error_html     = '<h1></h1>';
        $new_content    = 'Heading Text';
        $expected       = '<h1>Heading Text</h1>';

        ob_start();
        $temp           = new Ufixit($this->data);
        $output         = $temp->fixHeading($error_html, $new_content);

        $this->assertEquals($expected, $output);
        $this->checkOutputBuffer();
    }

    public function testFixHeadingDeleteHeading() {
        $error_html     = '<h2></h2>';
        $new_content    = '';
        $expected       = '';

        ob_start();
        $temp           = new Ufixit($this->data);
        $output         = $temp->fixHeading($error_html, $new_content);

        $this->assertEquals($expected, $output);
        $this->checkOutputBuffer();
    }

    public function testFixTableHeadersRow() {
        $error_html     = '<table><tbody><tr><td>Header One</td><td>Header Two</td></tr><tr><td>1.30</td><td>4.50</td></tr></tbody></table>';
        $sel_header     = 'row';
        $expected       = '<tr>'."\n".'<th scope="col">Header One</th>'."\n".'<th scope="col">Header Two</th>'."\n".'</tr>'."\n";

        ob_start();
        $temp           = new Ufixit($this->data);
        $output         = $temp->fixTableHeaders($error_html, $sel_header);

        $this->assertEquals($expected, $output['fixed']);
        $this->checkOutputBuffer();
    }

    public function testFixTableHeadersCol() {
        $error_html     = '<table><tbody><tr><td>Header One</td><td>Header Two</td></tr><tr><td>Title</td><td>4.50</td></tr></tbody></table>';
        $sel_header     = 'col';
        $expected       = '<tr>'."\n".'<th scope="row">Header One</th>'."\n".'<td>Header Two</td>'."\n".'</tr>'."\n".'<tr>'."\n".'<th scope="row">Title</th>'."\n".'<td>4.50</td>'."\n".'</tr>';

        ob_start();
        $temp           = new Ufixit($this->data);
        $output         = $temp->fixTableHeaders($error_html, $sel_header);

        $this->assertEquals($expected, $output['fixed']);
        $this->checkOutputBuffer();
    }

    public function testFixTableHeadersBoth() {
        $error_html     = '<table><tbody><tr><td>Header One</td><td>Header Two</td></tr><tr><td>Title</td><td>4.50</td></tr></tbody></table>';
        $sel_header     = 'both';
        $expected       = '<tr>'."\n".'<th scope="col">Header One</th>'."\n".'<th scope="col">Header Two</th>'."\n".'</tr>'."\n".'<tr>'."\n".'<th scope="row">Title</th>'."\n".'<td>4.50</td>'."\n".'</tr>';

        ob_start();
        $temp           = new Ufixit($this->data);
        $output         = $temp->fixTableHeaders($error_html, $sel_header);

        $this->assertEquals($expected, $output['fixed']);
        $this->checkOutputBuffer();
    }

    public function testFixTableThScopes() {
        $error_html     = '<th>Heading One</th>';
        $new_content    = 'col';
        $expected       = '<th scope="col">Heading One</th>';

        ob_start();
        $temp           = new Ufixit($this->data);
        $output         = $temp->fixTableThScopes($error_html, $new_content);

        $this->assertEquals($expected, $output);
        $this->checkOutputBuffer();
    }
}