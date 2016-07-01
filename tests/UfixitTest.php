<?php

require_once('../../lib/Ufixit.php');

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

    public function checkOutputBuffer() {
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

    public function testFixCss_OneColor() {
        $error_html     = '<span style="color: #ffff00;">Bad Contrasting Text</span>';
        $error_colors   = ['ffff00'];
        $new_content    = ['000000'];
        $expected       = '<span style="color: #000000;">Bad Contrasting Text</span>';

        ob_start();
        $temp           = new Ufixit($this->data);
        $output         = $temp->fixCss($error_colors, $error_html, $new_content);

        $this->assertEquals($expected, $output);
        $this->checkOutputBuffer();
    }

    public function testFixCss_TwoColors() {
        $error_html     = '<span style="color: #ffff00; background: #ffffff;">Bad Contrasting Text</span>';
        $error_colors   = ['ffff00', 'ffffff'];
        $new_content    = ['000000', 'fffff0'];
        $expected       = '<span style="color: #000000; background: #fffff0;">Bad Contrasting Text</span>';

        ob_start();
        $temp           = new Ufixit($this->data);
        $output         = $temp->fixCss($error_colors, $error_html, $new_content);

        $this->assertEquals($expected, $output);
        $this->checkOutputBuffer();
    }

    public function testFixLink_NewText() {
        $error_html     = '<a href="https://webcourses.ucf.edu/courses/1234567/image.jpg"></a>';
        $new_content    = 'test';
        $expected       = '<a href="https://webcourses.ucf.edu/courses/1234567/image.jpg">test</a>';

        ob_start();
        $temp           = new Ufixit($this->data);
        $output         = $temp->fixLink($error_html, $new_content);

        $this->assertEquals($expected, $output);
        $this->checkOutputBuffer();
    }

    public function testFixLink_DeleteLink() {
        $error_html     = '<a href="https://webcourses.ucf.edu/courses/1234567/image.jpg"></a>';
        $new_content    = '';
        $expected       = '';

        ob_start();
        $temp           = new Ufixit($this->data);
        $output         = $temp->fixLink($error_html, $new_content);

        $this->assertEquals($expected, $output);
        $this->checkOutputBuffer();
    }

    public function testFixHeading_NewHeading() {
        $error_html     = '<h1></h1>';
        $new_content    = 'Heading Text';
        $expected       = '<h1>Heading Text</h1>';

        ob_start();
        $temp           = new Ufixit($this->data);
        $output         = $temp->fixHeading($error_html, $new_content);

        $this->assertEquals($expected, $output);
        $this->checkOutputBuffer();
    }

    public function testFixHeading_DeleteHeading() {
        $error_html     = '<h2></h2>';
        $new_content    = '';
        $expected       = '';

        ob_start();
        $temp           = new Ufixit($this->data);
        $output         = $temp->fixHeading($error_html, $new_content);

        $this->assertEquals($expected, $output);
        $this->checkOutputBuffer();
    }

    public function testFixTableHeaders_Row() {
        $error_html     = '<table><tbody><tr><td>Header One</td><td>Header Two</td></tr><tr><td>1.30</td><td>4.50</td></tr></tbody></table>';
        $sel_header     = 'row';
        $expected       = '<tr>'."\n".'<th scope="col">Header One</th>'."\n".'<th scope="col">Header Two</th>'."\n".'</tr>'."\n";

        ob_start();
        $temp           = new Ufixit($this->data);
        $output         = $temp->fixTableHeaders($error_html, $sel_header);

        $this->assertEquals($expected, $output['fixed']);
        $this->checkOutputBuffer();
    }

    public function testFixTableHeaders_Col() {
        $error_html     = '<table><tbody><tr><td>Header One</td><td>Header Two</td></tr><tr><td>Title</td><td>4.50</td></tr></tbody></table>';
        $sel_header     = 'col';
        $expected       = '<tr>'."\n".'<th scope="row">Header One</th>'."\n".'<td>Header Two</td>'."\n".'</tr>'."\n".'<tr>'."\n".'<th scope="row">Title</th>'."\n".'<td>4.50</td>'."\n".'</tr>';

        ob_start();
        $temp           = new Ufixit($this->data);
        $output         = $temp->fixTableHeaders($error_html, $sel_header);

        $this->assertEquals($expected, $output['fixed']);
        $this->checkOutputBuffer();
    }

    public function testFixTableHeaders_Both() {
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

    public function tearDown () {
        unset($data);
    }

}

?>