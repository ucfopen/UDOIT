<?php

require_once '../core/quail/quail.php';
require '../vendor/autoload.php';

use Httpful\Request;
use zz\Html\HTMLMinify;

class Ufixit
{
    /**
     * Array of annoying characters to filter out of strings
     * @var array
     */
    public $annoying_entities = ["\r", "&nbsp;"];

    /**
     * The API key needed to communicate with Canvas
     * @var string
     */
    public $api_key;

    /**
     * The base uri for the Canvas instance
     * @var string
     */
    public $base_uri;

    /**
     * The id of the content being fixed
     * @var string
     */
    public $content_id;

    /**
     * The course id our content is in
     * @var string
     */
    public $course_id;

    /**
     * The file that needs to be modified and reuploaded
     * @var array
     */
    public $curled_file;

    /**
     * The DOMDocument object of the error_html
     * @var object
     */
    public $dom;

    /**
     * Array of replacements for the annoying entities
     * @var array
     */
    public $entity_replacements = ["", ""];

    /**
     * A file pointer
     * @var [type]
     */
    public $fp;

    /**
     * How many times str_replace should do the job
     * @var integer
     */
    public $replacement_count = 1;

    /**
     * The class constructor
     * @param array $data - Array of POST data
     */
    public function __construct($data)
    {
        $this->api_key    = $data['api_key'];
        $this->base_uri   = $data['base_uri'];
        $this->content_id = $data['content_id'];
        $this->course_id  = $data['course_id'];
        $this->dom        = new DOMDocument();
    }

    /**
     * Fixes alt text for images
     * @param string $error_html     - The bad html that needs to be fixed
     * @param string $new_content    - The new content from the user
     * @param bool $submitting_again - If the user is resubmitting their error fix
     * @return string $fixed_img     - The image with new alt text
     */
    public function fixAltText($error_html, $new_content, $submitting_again = false)
    {
        $this->dom->loadHTML('<?xml encoding="utf-8" ?>' . $error_html);

        $imgs = $this->dom->getElementsByTagName('img');

        foreach ($imgs as $img) {
            $img->setAttribute('alt', $new_content);
            $fixed_img = $this->dom->saveHTML($img);
        }

        return $fixed_img;
    }

    /**
     * Fixes CSS contrast errors
     * @param array $error_colors       - The color(s) that need to be replaced
     * @param string $error_html        - The bad html that needs to be fixed
     * @param string|array $new_content - The new CSS color(s) from the user
     * @param bool $submitting_again    - If the user is resubmitting their error fix
     * @return string $fixed_css        - The html with corrected CSS
     */
    public function fixCss($error_colors, $error_html, $new_content, $submitting_again = false)
    {
        $this->dom->loadHTML('<?xml encoding="utf-8" ?>' . $error_html);

        $fixed_css = $error_html;

        for ($i = 0; $i < count($error_colors); $i++) {
            $fixed_css = str_replace($error_colors[$i], $new_content[$i], $fixed_css);
        }

        return $fixed_css;
    }

        /**
     * Fixes Empty HTML Headers
     * @param string $error_html        - The bad html that needs to be fixed
     * @param string|array $new_content - The new Heading text from the user
     * @param bool $submitting_again    - If the user is resubmitting their error fix
     * @return string $fixed_css        - The html with corrected Heading
     */
    public function fixHeading($error_html, $new_content, $submitting_again = false)
    {
        $this->dom->loadHTML('<?xml encoding="utf-8" ?>' . $error_html);

        $new_data = [
            'old'   => '',
            'fixed' => ''
        ];

        $trs = $this->dom->getElementsByTagName('tr');

        foreach ($trs as $tr) {
            $new_data['old'] .= $this->dom->saveHTML($tr);
        }

        foreach ($trs as $tr) {
            $td = $tr->childNodes->item(0);
            $td = $this->renameElement($td, 'th');

            $td->setAttribute('scope', 'row');

            $new_data['fixed'] .= $this->dom->saveHTML($tr);
        }

        return $new_data;
    }

    /**
     * Fixes table headers by changing td elements to th (and adding proper scope, of course)
     * @param  string  $error_html       - The unmodified table without proper headings
     * @param  string  $selected_header  - The selected table row or column
     * @param  boolean $submitting_again - If the user is resubmitting their error fix
     * @return array   $new_data         - Array of the corrected error and the original table row/column
     */
    public function fixTableHeaders($error_html, $selected_header, $submitting_again = false)
    {
        $new_data = [
            'old'   => '',
            'fixed' => ''
        ];

        $this->dom->loadHTML('<?xml encoding="utf-8" ?>' . $error_html);

        switch ($selected_header) {
            case 'col':
                $trs = $this->dom->getElementsByTagName('tr');

                foreach ($trs as $tr) {
                    $new_data['old'] .= $this->dom->saveHTML($tr);
                }

                foreach ($trs as $tr) {
                    $td = $tr->childNodes->item(0);
                    $td = $this->renameElement($td, 'th');

                    $td->setAttribute('scope', 'row');

                    $new_data['fixed'] .= $this->dom->saveHTML($tr);
                }

                break;
            case 'row':
                $tr              = $this->dom->getElementsByTagName('tr')->item(0);
                $new_data['old'] = $this->dom->saveHTML($tr);

                for ($i = $tr->childNodes->length; --$i >= 0;) {
                    $td = $tr->childNodes->item($i);

                    if ($td->nodeName === 'td') {
                        $td = $this->renameElement($td, 'th');

                        $td->setAttribute('scope', 'col');
                    }
                }

                $new_data['fixed'] = $this->dom->saveHTML($tr);

                break;
            case 'both':
                $first = true;
                $trs   = $this->dom->getElementsByTagName('tr');

                foreach ($trs as $tr) {
                    $new_data['old'] .= $this->dom->saveHTML($tr);
                }

                foreach ($trs as $tr) {
                    if ($first) {
                        for ($i = $tr->childNodes->length; --$i >= 0;) {
                            $td = $tr->childNodes->item($i);

                            if ($td->nodeName === 'td') {
                                $td = $this->renameElement($td, 'th');

                                $td->setAttribute('scope', 'col');
                            }
                        }

                        $new_data['fixed'] .= $this->dom->saveHTML($tr);
                        $first = false;

                        continue;
                    }

                    $td = $tr->childNodes->item(0);
                    $td = $this->renameElement($td, 'th');

                    $td->setAttribute('scope', 'row');

                    $new_data['fixed'] .= $this->dom->saveHTML($tr);
                }

                break;
        }

        return $new_data;
    }

    /**
     * Fixes table th scope errors
     * @param string $error_html     - The color(s) that need to be replaced
     * @param string $new_content    - The new CSS color(s) from the user
     * @param bool $submitting_again - If the user is resubmitting their error fix
     * @return string $fixed_ths     - The html with corrected th scopes
     */
    public function fixTableThScopes($error_html, $new_content, $submitting_again = false)
    {
        $this->dom->loadHTML('<?xml encoding="utf-8" ?>' . $error_html);

        $ths = $this->dom->getElementsByTagName('th');

        foreach ($ths as $th) {
            $th->setAttribute('scope', $new_content);
            $fixed_th = $this->dom->saveHTML($th);
        }

        return $fixed_th;
    }

    /**
     * We need to get files from a course first before we can modify them
     * @return [type] [description]
     */
    public function getFile($start_id)
    {
        $page_num    = 1;
        $per_page    = 100;
        $folder_uri  = $this->base_uri."/api/v1/courses/".$this->course_id."/folders/".$start_id."?&access_token=".$this->api_key;
        $folder      = Request::get($folder_uri)->send();
        $curled_file = [];

        if ($start_id == "root") {
            $start_id = $folder->body->id;
        }

        $num_files   = 0;
        $num_folders = 0;
        $num_files   = $folder->body->files_count;
        $num_folders = $folder->body->folders_count;
        $folder_name = $folder->body->full_name;

        if ($num_files > 0) {
            while (true) {
                $file_uri = $this->base_uri."/api/v1/folders/".$start_id."/files?page=".$page_num."&per_page=".$per_page."&content_types[]=text/html&access_token=".$this->api_key;
                $files    = Request::get($file_uri)->send();

                if (sizeof($files->body) == 0) {
                    break;
                }

                foreach ($files->body as $file) {
                    $mac_check = (substr($file->display_name, 0, 2)); // Don't capture mac files, ._

                    if($mac_check !== "._" and $file->id == $this->content_id) {
                        $curled_file['id'] = $file->id;
                        $curled_file['name'] = $file->display_name;
                        $curled_file['parent_folder_path'] = $folder_name;
                        $curled_file['html'] = Request::get($file->url)->followRedirects()->send()->body;

                        return $curled_file;
                    }
                }

                $page_num++;
            }

        } //if there are files in the current folder

        if ($num_folders > 0) {
            $subfolders = Request::get($this->base_uri."/api/v1/folders/".$start_id."/folders?access_token=".$this->api_key)->send();

            foreach ($subfolders->body as $subfolder) {
                $foo = $this->getFile($subfolder->id);

                if ($foo !== false) {
                    return $foo;
                }
            }
        } //if there are subfolders

        return false;
    }

    /**
     * Renames an element and preserves its attributes
     * @param  object $node - The DOMElement object you wish to rename
     * @param  string $name - The new name for the element
     * @return object       - The renamed DOMElement
     */
    public function renameElement($node, $name)
    {
        $renamed = $node->ownerDocument->createElement($name);
        $parent  = $node->parentNode;
        $parent->insertBefore($renamed, $node);

        $children = $node->childNodes;

        while ($children->length > 0) {
            $renamed->appendChild($children->item(0));
        }

        $attributes = $node->attributes;

        while ($attributes->length > 0) {
            $attribute = $attributes->item(0);

            if (!is_null($attribute->namespaceURI)) {
                $renamed->setAttributeNS('http://www.w3.org/2000/xmlns/',
                                         'xmlns:'.$attribute->prefix,
                                         $attribute->namespaceURI);
            }

            $renamed->setAttributeNode($attribute);
        }

        $parent->removeChild($node);

        return $renamed;
    }

    /**
     * Uploads fixed assignments
     * @param string $corrected_error - The html that has been fixed
     * @param string $error_html      - The html to be fixed
     */
    public function uploadFixedAssignments($corrected_error, $error_html)
    {
        $get_uri = $this->base_uri."/api/v1/courses/".$this->course_id."/assignments/".$this->content_id."?&access_token=".$this->api_key;
        $content = Request::get($get_uri)->send();
        $html    = $content->body->description;

        $error_html      = HTMLMinify::minify(str_replace($this->annoying_entities, $this->entity_replacements, $error_html), ['doctype' => 'html5']);
        $corrected_error = HTMLMinify::minify(str_replace($this->annoying_entities, $this->entity_replacements, $corrected_error), ['doctype' => 'html5']);
        $html            = HTMLMinify::minify(str_replace($this->annoying_entities, $this->entity_replacements, htmlentities($html)), ['doctype' => 'html5']);

        $html    = str_replace($error_html, $corrected_error, html_entity_decode($html));
        $put_uri = $this->base_uri."/api/v1/courses/".$this->course_id."/assignments/".$this->content_id."?&access_token=".$this->api_key;

        Request::put($put_uri)->body(['assignment[description]' => $html])->sendsType(\Httpful\Mime::FORM)->send();
    }

    /**
     * Uploads fixed discussions (announcements are also discussions)
     * @param string $corrected_error - The html that has been fixed
     * @param string $error_html      - The html to be fixed
     */
    public function uploadFixedDiscussions($corrected_error, $error_html)
    {
        $get_uri = $this->base_uri."/api/v1/courses/".$this->course_id."/discussion_topics/".$this->content_id."?&access_token=".$this->api_key;
        $content = Request::get($get_uri)->send();
        $html    = $content->body->message;

        $error_html      = HTMLMinify::minify(str_replace($this->annoying_entities, $this->entity_replacements, $error_html), ['doctype' => 'html5']);
        $corrected_error = HTMLMinify::minify(str_replace($this->annoying_entities, $this->entity_replacements, $corrected_error), ['doctype' => 'html5']);
        $html            = HTMLMinify::minify(str_replace($this->annoying_entities, $this->entity_replacements, htmlentities($html)), ['doctype' => 'html5']);

        $html    = str_replace($error_html, $corrected_error, html_entity_decode($html));
        $put_uri = $this->base_uri."/api/v1/courses/".$this->course_id."/discussion_topics/".$this->content_id."?&access_token=".$this->api_key;

        Request::put($put_uri)->body(['message' => $html])->sendsType(\Httpful\Mime::FORM)->send();
    }

    /**
     * [uploadFixedFiles description]
     * @param  [type] $corrected_error    [description]
     * @param  [type] $error_html         [description]
     * @return [type]                     [description]
     */
    public function uploadFixedFiles($corrected_error, $error_html)
    {
        $error_html      = HTMLMinify::minify(str_replace($this->annoying_entities, $this->entity_replacements, $error_html), ['doctype' => 'html5']);
        $corrected_error = HTMLMinify::minify(str_replace($this->annoying_entities, $this->entity_replacements, $corrected_error), ['doctype' => 'html5']);
        $html            = HTMLMinify::minify($this->curled_file['html'], ['doctype' => 'html5']);

        $html = str_replace($error_html, $corrected_error, $html);

        if (!file_exists("file_temp/".$this->curled_file['parent_folder_path'])) {
            if (!@mkdir("file_temp/".$this->curled_file['parent_folder_path'], 0777, true)) {
                header('HTTP/1.1 403 Forbidden');
                header('Content-Type: application/json; charset=UTF-8');
                die(json_encode(error_get_last()['message']));
            }
        }

        $this->fp = fopen("file_temp/".$this->curled_file['parent_folder_path']."/".$this->curled_file['name'], 'w');

        fwrite($this->fp, $html);
        fclose($this->fp);

        $file       = "file_temp/".$this->curled_file["parent_folder_path"]."/".$this->curled_file["name"];
        $file_array = explode("/", $file);
        $file_name  = $file_array[count($file_array) - 1];

        $post_data = [
            'name'               => $file_name,
            'size'               => filesize($file),
            'content_type'       => "text/html",
            'parent_folder_path' => $this->curled_file['parent_folder_path'],
            'on_duplicate'       => "overwrite"
        ];

        $uri = $this->base_uri."/api/v1/courses/".$this->course_id."/files?&access_token=".$this->api_key;

        $response = Request::post($uri)->body($post_data)->sendsType(\Httpful\Mime::FORM)->send()->body;

        //step 2 for uploading
        $upload_uri = $response->upload_url;
        //send everything again
        $post_data = (array)$response->upload_params;
        $post_data['file'] = "@".$file;

        $response = Request::post($upload_uri)->body($post_data)->sendsType(\Httpful\Mime::UPLOAD)->send();

        //check for the location
        preg_match('/Location\: (.*)\\n/', $response->raw_headers, $matches);

        //error
        if(!isset($matches[1])) {
            dump($response);
        }

        $confirm_uri = $matches[1];

        // Step 3 in uploading
        $response = Request::post($confirm_uri)->body(['access_token' => $this->api_key])->sendsType(\Httpful\Mime::FORM)->send();

        // Delete the local file
        unlink("file_temp/".$this->curled_file["parent_folder_path"]."/".$this->curled_file["name"]);
        rmdir("file_temp/".$this->curled_file["parent_folder_path"]);
    }


    /**
     * Uploads fixed pages
     * @param string $corrected_error - The html that has been fixed
     * @param string $error_html      - The html to be fixed
     */
    public function uploadFixedPages($corrected_error, $error_html)
    {
        $get_uri = $this->base_uri."/api/v1/courses/".$this->course_id."/pages/".$this->content_id."?access_token=".$this->api_key;
        $content = Request::get($get_uri)->send();
        $html    = $content->body->body;

        $error_html      = HTMLMinify::minify(str_replace($this->annoying_entities, $this->entity_replacements, $error_html), ['doctype' => 'html5']);
        $corrected_error = HTMLMinify::minify(str_replace($this->annoying_entities, $this->entity_replacements, $corrected_error), ['doctype' => 'html5']);
        $html            = HTMLMinify::minify(str_replace($this->annoying_entities, $this->entity_replacements, htmlentities($html)), ['doctype' => 'html5']);

        $html    = str_replace($error_html, $corrected_error, html_entity_decode($html));
        $put_uri = $this->base_uri."/api/v1/courses/".$this->course_id."/pages/".$this->content_id."?&access_token=".$this->api_key;

        Request::put($put_uri)->body(['wiki_page[body]' => $html])->sendsType(\Httpful\Mime::FORM)->send();
    }

    /**
     * Uploads the fixed course syllabus
     * @param string $corrected_error - The html that has been fixed
     * @param string $error_html      - The html to be fixed
     */
    public function uploadFixedSyllabus($corrected_error, $error_html)
    {
        $get_uri = $this->base_uri."/api/v1/courses/".$this->course_id."/?include[]=syllabus_body&access_token=".$this->api_key;
        $content = Request::get($get_uri)->send();
        $html    = $content->body->syllabus_body;

        $error_html      = HTMLMinify::minify(str_replace($this->annoying_entities, $this->entity_replacements, $error_html), ['doctype' => 'html5']);
        $corrected_error = HTMLMinify::minify(str_replace($this->annoying_entities, $this->entity_replacements, $corrected_error), ['doctype' => 'html5']);
        $html            = HTMLMinify::minify(str_replace($this->annoying_entities, $this->entity_replacements, htmlentities($html)), ['doctype' => 'html5']);

        $html    = str_replace($error_html, $corrected_error, html_entity_decode($html));
        $put_uri = $this->base_uri."/api/v1/courses/".$this->course_id."/?&access_token=".$this->api_key;

        Request::put($put_uri)->body(['course[syllabus_body]' => $html])->sendsType(\Httpful\Mime::FORM)->send();
    }
}