<?php

require_once '../core/quail/quail.php';
require '../vendor/autoload.php';

use Httpful\Request;

class UFixIt
{
    /**
    * @var string - The API key needed to communicate with Canvas
    */
    public $api_key;

    /**
     * @var string - The base uri for the Canvas instance
     */
    public $base_uri;

    /**
     * @var string - The id of the content being fixed
     */
    public $content_id;

    /**
     * @var string - The course id our content is in
     */
    public $course_id;

    /**
     * @var object - The DOMDocument object of the error_html
     */
    public $dom;

    /**
     * The class constructor
     * @param array data - Array of POST data
     */
    public function __construct($data)
    {
        $this->api_key = $data['api_key'];
        $this->base_uri = $data['base_uri'];
        $this->content_id = $data['content_id'];
        $this->course_id = $data['course_id'];
        $this->dom = new DOMDocument();
    }

    /**
     * Fixes alt text for images
     * @param string error_html - The bad html that needs to be fixed
     * @param string new_content - The new content from the user
     * @param bool submitting_again - If the user is resubmitting their error fix
     * @return string fixed_img - The image with new alt text
     */
    public function fixAltText($error_html, $new_content, $submitting_again = false)
    {
        $this->dom->loadHTML($error_html);

        $imgs = $this->dom->getElementsByTagName('img');

        foreach ($imgs as $img) {
            $img->setAttribute('alt', $new_content);
            $fixed_img = $this->dom->saveHTML($img);
        }

        return $fixed_img;
    }

    /**
     * Fixes CSS contrast errors
     * @param array error_colors - The color(s) that need to be replaced
     * @param string error_html - The bad html that needs to be fixed
     * @param string|array new_content - The new CSS color(s) from the user
     * @param bool submitting_again - If the user is resubmitting their error fix
     * @return string fixed_css - The html with corrected CSS
     */
    public function fixCss($error_colors, $error_html, $new_content, $submitting_again = false)
    {
        $this->dom->loadHTML($error_html);

        $fixed_css = $error_html;

        for ($i = 0; $i < count($error_colors); $i++) {
            $fixed_css = str_replace($error_colors[$i].";", $new_content[$i].";", $fixed_css);
        }

        return $fixed_css;
    }

    /**
     * Fixes tables with missing headers
     *
     */
    public function fixTableHeaders()
    {

    }

    /**
     * Fixes table th scope errors
     * @param string error_html - The color(s) that need to be replaced
     * @param string new_content - The new CSS color(s) from the user
     * @param bool submitting_again - If the user is resubmitting their error fix
     * @return string fixed_ths - The html with corrected th scopes
     */
    public function fixTableThScopes($error_html, $new_content, $submitting_again = false)
    {
        $this->dom->loadHTML($error_html);

        $ths = $this->dom->getElementsByTagName('th');

        foreach ($ths as $th) {
            $th->setAttribute('scope', $new_content);
            $fixed_th = $this->dom->saveHTML($th);
        }

        return $fixed_th;
    }

    public function getFiles()
    {
        $page_num = 1;
        $per_page = 100;
        $get_uri = $this->base_uri."/api/v1/courses/".$course_id."/folders/root?&access_token=".$this->api_key;
        $folder = Request::get($get_uri)->send();

        if ($start_id == "root") {
            $start_id = $folder->body->id;
        }

        $numFiles = 0;
        $numFolders = 0;
        $numFiles = $folder->body->files_count;
        $numFolders = $folder->body->folders_count;
        $folderName = $folder->body->full_name;

        if ($numFiles > 0) {
            while(true) {
                $files = Request::get($this->base_uri."/api/v1/courses/".$course_id."/files?page=".$page_num."&per_page=".$per_page."&content_types[]=text/html&access_token=".$api_key)->send();

                if(sizeof($files->body) == 0) {
                    break;
                }

                foreach($files->body as $file) {
                    //don't capture them mac files, ._
                    $mac_check = (substr($file->display_name, 0, 2));
                    if($mac_check != "._") {
                        $curled_files['id'][] = $file->id;
                        $curled_files['name'][] = $file->display_name;
                        $curled_files['parent_folder_path'][] = $folderName;
                        $curled_files['html'][] = Request::get($file->url)->followRedirects()->send()->body;
                    }
                }
                $page_num++;
            }

        } //if there are files in the current folder

        if ($numFolders > 0) {
            $subfolders = $this->unwrap($this->base_url."/api/v1/folders/".$start_id."/folders?access_token=".$this->apikey);
            foreach ($subfolders["response"] as $subfolder)
                $this::get_files($course_id, $subfolder->id, $curled_files);
        } //if there are subfolders
    }

    /**
     * Uploads fixed assignments
     * @param string corrected_error - The html that has been fixed
     * @param string error_html - The html to be fixed
     */
    public function uploadFixedAssignments($corrected_error, $error_html)
    {
        $get_uri = $this->base_uri."/api/v1/courses/".$this->course_id."/assignments/".$this->content_id."?&access_token=".$this->api_key;
        $content = Request::get($get_uri)->send();
        $html = $content->body->description;
        $html = str_replace($error_html, $corrected_error, $html);
        $put_uri = $this->base_uri."/api/v1/courses/".$this->course_id."/assignments/".$this->content_id."?assignment[description]=".urlencode($html)."&access_token=".$this->api_key;

        Request::put($put_uri)->send();
    }

    /**
     * Uploads fixed discussions (announcements are also discussions)
     * @param string corrected_error - The html that has been fixed
     * @param string error_html - The html to be fixed
     */
    public function uploadFixedDiscussions($corrected_error, $error_html)
    {
        $get_uri = $this->base_uri."/api/v1/courses/".$this->course_id."/discussion_topics/".$this->content_id."?&access_token=".$this->$api_key;
        $content = Request::get($get_uri)->send();
        $html = $content->body->message;
        $html = str_replace($error_html, $corrected_error, $html);
        $put_uri = $this->base_uri."/api/v1/courses/".$this->course_id."/discussion_topics/".$this->content_id."?message=".urlencode($html)."&access_token=".$this->api_key;

        Request::put($put_uri)->send();
    }

    /**
     *
     */
    public function uploadFixedFiles()
    {

    }

    /**
     * Uploads fixed pages
     * @param string corrected_error - The html that has been fixed
     * @param string error_html - The html to be fixed
     */
    public function uploadFixedPages($corrected_error, $error_html)
    {
        $get_uri = $this->base_uri."/api/v1/courses/".$this->course_id."/pages/".$this->content_id."?access_token=".$this->api_key;
        $content = Request::get($get_uri)->send();
        $html = $content->body->body;
        $html = str_replace($error_html, $corrected_error, $html);
        $put_uri = $this->base_uri."/api/v1/courses/".$this->course_id."/pages/".$this->content_id."?wiki_page[body]=".urlencode($html)."&access_token=".$this->api_key;

        Request::put($put_uri)->send();
    }
}