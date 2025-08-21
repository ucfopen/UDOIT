<?php

namespace App\Lms\Canvas;

use App\Lms\LmsResponse;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\Mime\Part\DataPart;
use Symfony\Component\Mime\Part\Multipart\FormDataPart;
use Symfony\Component\Console\Output\ConsoleOutput;

class CanvasApi {

    protected $session;
    protected $baseUrl;
    protected $httpClient;

    public function __construct($baseUrl, $apiToken)
    {
        $this->httpClient = HttpClient::create([
            'headers' => ["Authorization: Bearer " . $apiToken],
        ]);
        $this->baseUrl = $baseUrl;
    }

    // API call GET
    public function apiGet(string $url, array $options = [], int $perPage = 100, ?LmsResponse $lmsResponse = null): LmsResponse
    {
        $links = [];

        if (!$lmsResponse) {
            $lmsResponse = new LmsResponse();
        }

        if (!strpos($url, 'per_page')) {
            if (strpos($url, '?')) {
                $url .= '&per_page=' . $perPage;
            } else {
                $url .= '?per_page=' . $perPage;
            }
        }

        if (strpos($url, $this->baseUrl) === false) {
            $url = "https://{$this->baseUrl}/api/v1/{$url}";
        }

        $response = $this->httpClient->request('GET', $url, $options);
        $lmsResponse->setResponse($response);
        $content = $lmsResponse->getContent();

        // If error is invalid token, refresh API token and try again
        if ($lmsResponse->getStatusCode() >= 500) {
            throw new \Exception('msg.sync.error.api');
        }
        else if ($lmsResponse->getStatusCode() >= 400) {
            throw new \Exception('msg.sync.error.connection');
        }

        if (!empty($content['errors'])) {
            foreach ($content['errors'] as $error) {
                $lmsResponse->setError($error);
            }
        }

        $headers = $response->getHeaders(false);

        if (isset($headers['link'][0])) {
            $links = explode(',', $headers['link'][0]);

            foreach ($links as $value) {
                if (preg_match('/^\s*<(.*?)>;\s*rel="(.*?)"/', $value, $match)) {
                    $links[$match[2]] = $match[1];
                }
            }
        }

        if (isset($links['next'])) {
            $this->apiGet($links['next'], $options, $perPage, $lmsResponse);
        }

        return $lmsResponse;
    }

    public function apiPost($url, $options, $sendAuthorized = true)
    {
        $lmsResponse = new LmsResponse();

        if (strpos($url, 'https://') === false) {
            $url = "https://{$this->baseUrl}/api/v1/{$url}";
        }

        if ($sendAuthorized) {
            $response = $this->httpClient->request('POST', $url, $options);
        }
        else {
            $client = HttpClient::create();
            $response = $client->request('POST', $url, $options);
        }
        $lmsResponse->setResponse($response);

        $content = $lmsResponse->getContent();
        if (!empty($content['errors'])) {
            // TODO: If error is invalid token, refresh API token and try again

            foreach ($content['errors'] as $error) {
                $lmsResponse->setError($error['message']);
            }
        }

        return $lmsResponse;
    }

    // Posts a file to Canvas
    public function apiFilePost(string $url, array $options, string $filepath, string $newFileName, $changeReferences = null, $refIndication): LmsResponse
    {
        $fileResponse = $this->apiGet($url);
        $file = $fileResponse->getContent();
      
        // TODO: handle failed call
        $output = new ConsoleOutput();
       
        $endpointOptions = [
            'name' => $newFileName,
            'parent_folder_id' => $file['folder_id'],
            'content_type' => $file['content-type'],
        ];

        $endpointResponse = $this->apiPost($options['postUrl'], ['query' => $endpointOptions], true);
        $endpointContent = $endpointResponse->getContent();


        // TODO: handle failed call

        $formFields = $endpointContent['upload_params'];
        $formFields['file'] = DataPart::fromPath($filepath);
        $formData = new FormDataPart($formFields);

        $fileResponse = $this->apiPost($endpointContent['upload_url'], [
            'headers' => $formData->getPreparedHeaders()->toArray(),
            'body' => $formData->bodyToIterable(),
        ], false);

        $fileResponseContent = $fileResponse->getContent();

        // Change Reference if and only if we have references to change and we want to change references
        if($changeReferences && $refIndication){
            $this->changeLinksInSyllabus($changeReferences['course_id'], $file['id'], $fileResponseContent['url'], $newFileName);
            $this->changeModuleItemInstances($changeReferences['course_id'], $changeReferences['module_instances'], $newFileName, $fileResponseContent['id'], $file['id']);
            $this->changeLinksInPages($changeReferences['course_id'], $file['id'], $changeReferences['pages'], $fileResponseContent['url'], $newFileName);
            $this->changeLinksInAssignments($changeReferences['course_id'], $file['id'], $changeReferences['assignments'], $fileResponseContent['url'], $newFileName);
            $this->changeLinksInQuizzes($changeReferences['course_id'], $file['id'], $changeReferences['quizzes'], $fileResponseContent['url'], $newFileName);
            $this->changeLinksInAnnouncements($changeReferences['course_id'], $file['id'], $changeReferences['announcements'], $fileResponseContent['url'], $newFileName);
            $this->changeLinksInDiscussions($changeReferences['course_id'], $file['id'], $changeReferences['discussions'], $fileResponseContent['url'], $newFileName);
        }
        
        return $fileResponse;
    }

    public function apiPut($url, $options)
    {
        $lmsResponse = new LmsResponse();

        if (strpos($url, 'https://') === false) {
            $url = "https://{$this->baseUrl}/api/v1/{$url}";
        }

        $response = $this->httpClient->request('PUT', $url, $options);
        $lmsResponse->setResponse($response);

        $content = $lmsResponse->getContent();
        if (!empty($content['errors'])) {
            // TODO: If error is invalid token, refresh API token and try again

            foreach ($content['errors'] as $error) {
                $lmsResponse->setError($error['message']);
            }
        }

        return $lmsResponse;
    }

    public function apiDelete($url) {
        $lmsResponse = new LmsResponse();
        $output = new ConsoleOutput();

          if (strpos($url, 'https://') === false) {
            $url = "https://{$this->baseUrl}/api/v1/{$url}";
        }

 

        $response = $this->httpClient->request('DELETE', $url);

        $lmsResponse->setResponse($response);

        $content = $lmsResponse->getContent();
        if (!empty($content['errors'])) {
            // TODO: If error is invalid token, refresh API token and try again

            foreach ($content['errors'] as $error) {
                $lmsResponse->setError($error['message']);
            }
        }

        return $lmsResponse;

    }

  public function getCourse($courseId, $includeSyllabus = false)
    {   
        if ($includeSyllabus) {
            $url = "courses/{$courseId}?include[]=syllabus_body";
        }
        else {
            $url = "courses/{$courseId}";
        }
        $response = $this->apiGet($url);
        return $response->getContent();
    }

    public function listModules($courseId)
    {
        $url = "courses/{$courseId}/modules";
        $response = $this->apiGet($url);
        return $response->getContent();
    }

    public function listModuleItems($courseId, $moduleId)
    {
        $url = "courses/{$courseId}/modules/{$moduleId}/items";
        $response = $this->apiGet($url);
        return $response->getContent();
    }

    public function deleteModuleItem($courseId, $moduleId, $itemId)
    {
        $url = "courses/{$courseId}/modules/{$moduleId}/items/{$itemId}";
        $response = $this->apiDelete($url);
        return $response->getContent();
    }

    public function listPages($courseId)
    {
        $url = "courses/{$courseId}/pages";
        $response = $this->apiGet($url . '?include[]=body');

        $responseWithPageBody = [];

        foreach ($response->getContent() as $content) {
            $page = $this->showPage($courseId, $content['page_id']);
            $content['body'] = $page['body'];
            $responseWithPageBody[] = $content;
        }

        return $responseWithPageBody;
    }

    public function showPage($courseId, $pageId)
    {
        $url = "courses/{$courseId}/pages/{$pageId}";
        $response = $this->apiGet($url . '?include[]=body');
        return $response->getContent();
    }

    public function listAssignments($courseId)
    {
        $url = "courses/{$courseId}/assignments";
        $response = $this->apiGet($url);
        return $response->getContent();
    }

    public function listQuizzes($courseId)
    {
        $url = "courses/{$courseId}/quizzes";
        $response = $this->apiGet($url);
        return $response->getContent();
    }

    public function listQuizQuestions($courseId, $quizId)
    {
        $url = "courses/{$courseId}/quizzes/{$quizId}/questions";
        $response = $this->apiGet($url);
        return $response->getContent();
    }

    // List discussion topic
    public function listDiscussions($courseId)
    {
        $url = "courses/{$courseId}/discussion_topics";
        $response = $this->apiGet($url);
        return $response->getContent();
    }

    // List announcements (even though they are the same thing you have to get them through different linsk)
    public function listAnnouncements($courseId)
    {
        $url = "courses/{$courseId}/discussion_topics?only_announcements=true";
        $response = $this->apiGet($url);
        return $response->getContent();
    }

    public function updateCourse($courseId, $options)
    {
        $url = "courses/{$courseId}";
        $response = $this->apiPut($url, $options);
        return $response->getContent();
    }

    public function uploadModuleItem($courseId, $moduleId, $options)
    {
        $url = "courses/{$courseId}/modules/{$moduleId}/items";
        $response = $this->apiPost($url, $options);
        return $response->getContent();
    }

    public function updateModuleItem($courseId, $moduleId, $itemId, $options)
    {
        $url = "courses/{$courseId}/modules/{$moduleId}/items/{$itemId}";
        $response = $this->apiPut($url, $options);
        return $response->getContent();

    }

    public function updatePage($courseId, $pageId, $options)
    {
        $url = "courses/{$courseId}/pages/{$pageId}";
        $response = $this->apiPut($url, $options);
        return $response->getContent();
    }

    public function updateAssignment($courseId, $assignmentId, $options)
    {
        $url = "courses/{$courseId}/assignments/{$assignmentId}";
        $response = $this->apiPut($url, $options);
        return $response->getContent();
    }

    public function updateQuiz($courseId, $quizId, $options)
    {
        $url = "courses/{$courseId}/quizzes/{$quizId}";
        $response = $this->apiPut($url, $options);


        return $response->getContent();
    }

    public function updateQuizQuestion($courseId, $quizId, $questionId, $options)
    {
        $url = "courses/{$courseId}/quizzes/{$quizId}/questions/{$questionId}";
        $response = $this->apiPut($url, $options);
        return $response->getContent();
    }


    // Updates discussions and announcement content
    public function updateDisscussions($courseId, $topicId, $options)
    {
        $url = "courses/{$courseId}/discussion_topics/{$topicId}";
        $response = $this->apiPut($url, $options);
        return $response->getContent();
    }



    // Protected Functions

    protected function changeLinksInSyllabus($courseId, $oldFileId, $newUrl, $newFileName)
     {
        $course = $this->getCourse($courseId, true);
        $dom = new \DOMDocument();

        $dom->loadHTML($course['syllabus_body']);
        $anchors = $dom->getElementsByTagName('a');
        $newSyllabus = $this->changeAnchorTags($dom, $oldFileId, $newUrl, $newFileName);
        if ($newSyllabus != $course['syllabus_body']) {
            $this->updateCourse($courseId, ['json' => ['course' => ['syllabus_body' => $newSyllabus]]]);
        }
     }

    protected function changeModuleItemInstances($courseId, $moduleInstances, $newFileName, $newFileId) {
        foreach ($moduleInstances as $moduleInstance) {
            $this->uploadModuleItem($courseId, $moduleInstance['module_id'], [
                'json' => [
                    'module_item' => [
                        'title' => $newFileName,
                        'type' => 'File',
                        'content_id' => $newFileId,
                        'position' => $moduleInstance['position'],
                    ],
                ],
            ]);
        }
    }

    protected function changeLinksInPages($courseId, $oldFileId, $pages, $newUrl, $newFileName) {
        foreach ($pages as $page) {
            $dom = new \DOMDocument();
            $dom->loadHTML($page['body']);
            $newPage = $this->changeAnchorTags($dom, $oldFileId, $newUrl, $newFileName);
            if ($newPage != $page['body']) {
                $this->updatePage($courseId, $page['page_id'], [
                    'json' => [
                        'wiki_page' => [
                            'body' => $newPage,
                        ],
                    ],
                ]);
            }
        }
     }

    protected function changeLinksInAssignments($courseId, $oldFileId, $assignments, $newUrl, $newFileName) {
        foreach ($assignments as $assignment) {
            $dom = new \DOMDocument();
            $dom->loadHTML($assignment['description']);
            $newAssignment = $this->changeAnchorTags($dom, $oldFileId, $newUrl, $newFileName);
            if ($newAssignment != $assignment['description']) {
                $this->updateAssignment($courseId, $assignment['id'], [
                    'json' => [
                        'assignment' => [
                            'description' => $newAssignment,
                        ],
                    ],
                ]);
            }
        }
     }

    protected function changeLinksInQuizzes($courseId, $oldFileId, $quizzes, $newUrl, $newFileName) {
        foreach ($quizzes as $quiz) {
            $dom = new \DOMDocument();
            $dom->loadHTML($quiz['description']);
            $newQuiz = $this->changeAnchorTags($dom, $oldFileId, $newUrl, $newFileName);
            if ($newQuiz != $quiz['description']) {
                $this->updateQuiz($courseId, $quiz['id'], [
                    'json' => [
                        'quiz' => [
                            'description' => $newQuiz,
                            'notify_of_update' => $quiz['notify_of_update'],
                        ],
                    ],
                ]);
            }
        }
     }

    protected function changeLinksInAnnouncements($courseId, $oldFileId, $announcements, $newUrl, $newFileName){
        foreach ($announcements as $announcement){
            $dom = new \DOMDocument();
            $dom->loadHTML($announcement['message']);
            $newAnnouncement = $this->changeAnchorTags($dom, $oldFileId, $newUrl, $newFileName);
            if($newAnnouncement != $announcement['message']){
                $this->updateDisscussions($courseId, $announcement['id'], [
                    'json'=> [
                        'message' => $newAnnouncement,
                    ],
                ]);
            }
        }
    }

  protected function changeLinksInDiscussions($courseId, $oldFileId, $discussions, $newUrl, $newFileName){
        foreach ($discussions as $disc){
            $dom = new \DOMDocument();
            $dom->loadHTML($disc['message']);
            $newDisc = $this->changeAnchorTags($dom, $oldFileId, $newUrl, $newFileName);
            if($newDisc != $disc['message']){
                $this->updateDisscussions($courseId, $disc['id'], [
                    'json'=> [
                        'message' => $newDisc,
                    ],
                ]);
            }
        }
    }
    

     protected function changeAnchorTags($dom, $fileId, $newUrl, $newFileName) {
        $anchors = $dom->getElementsByTagName('a');
        foreach ($anchors as $anchor) {
            preg_match('/files\/(\d+)/', $anchor->getAttribute('href'), $matches);
            if (isset($matches[1]) && $matches[1] == $fileId) {
                $anchor->setAttribute('href', $newUrl);
                $anchor->setAttribute('title', $newFileName);
            }
        }
        return $dom->saveHTML();
     }

}