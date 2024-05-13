<?php

namespace App\Lms\Canvas;

use App\Lms\LmsResponse;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\Mime\Part\DataPart;
use Symfony\Component\Mime\Part\Multipart\FormDataPart;

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
    public function apiGet(string $url, array $options = [], int $perPage = 100, LmsResponse $lmsResponse = null): LmsResponse
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
        if ($lmsResponse->getStatusCode() >= 400) {
            throw new \Exception('Failed API call', $lmsResponse->getStatusCode());
        }

        if (!empty($content['errors'])) {
            foreach ($content['errors'] as $error) {
                $lmsResponse->setError($error['message']);
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
    public function apiFilePost(string $url, array $options, string $filepath, string $newFileName, $moduleInstances = null, $courseId = null, $replacePages = null, $replaceAssignments = null) : LmsResponse
    {
        $fileResponse = $this->apiGet($url);
        $file = $fileResponse->getContent();

        // TODO: handle failed call

        $endpointOptions = [
            'name' => $newFileName,
            'parent_folder_id' => $file['folder_id'],
            'content_type' => $file['content-type'],
        ];

        $endpointResponse = $this->apiPost($options['postUrl'], ['query' => $endpointOptions], true);
        $endpointContent = $endpointResponse->getContent();

        $this->apiDelete($url);

        // TODO: handle failed call

        $formFields = $endpointContent['upload_params'];
        $formFields['file'] = DataPart::fromPath($filepath);
        $formData = new FormDataPart($formFields);

        $fileResponse = $this->apiPost($endpointContent['upload_url'], [
            'headers' => $formData->getPreparedHeaders()->toArray(),
            'body' => $formData->bodyToIterable(),
        ], false);

        $fileResponseContent = $fileResponse->getContent();

        if($moduleInstances) {
            foreach ($moduleInstances as $moduleInstance) {
                $response = $this->apiPost("courses/{$courseId}/modules/{$moduleInstance}/items", [
                    'json' => [
                        'module_item' => [
                            'title' => $newFileName,
                            'type' => 'File',
                            'content_id' => $fileResponseContent['id'],
                        ],
                    ],
                ]);

            }
        }

        if($replacePages) {
            foreach ($replacePages as $page) {
                $dom = new \DOMDocument();
                $dom->loadHTML($page['body']);
                $anchors = $dom->getElementsByTagName('a');
                foreach ($anchors as $anchor) {
                    preg_match('/files\/(\d+)/', $anchor->getAttribute('href'), $matches);
                    if (isset($matches[1]) && $matches[1] == $file['id']) {
                        $anchor->setAttribute('href', $fileResponseContent['url']);
                        $anchor->setAttribute('title', $newFileName);
                        $anchor->nodeValue = $newFileName;
                    }
                    $page['body'] = $dom->saveHTML();
                    $response = $this->apiPut("courses/{$courseId}/pages/{$page['page_id']}", [
                        'json' => [
                            'wiki_page' => [
                                'title' => $page['title'],
                                'body' => $page['body'],
                                'editing_roles' => $page['editing_roles'],
                                'published' => $page['published'],
                                'front_page' => $page['front_page'],
                                'hide_from_students' => $page['hide_from_students'],
                                'notify_of_update' => $page['notify_of_update'],
                                'attachments' => [
                                    [
                                        'url' => $fileResponseContent['url'],
                                        'filename' => $newFileName,
                                    ],
                                ],
                            ],
                        ],
                    ]);
                }
            }
        }

        if ($replaceAssignments) {
            foreach ($replaceAssignments as $assignment) {
                $dom = new \DOMDocument();
                $dom->loadHTML($assignment['description']);
                $anchors = $dom->getElementsByTagName('a');
                foreach ($anchors as $anchor) {
                    preg_match('/files\/(\d+)/', $anchor->getAttribute('href'), $matches);
                    if (isset($matches[1]) && $matches[1] == $file['id']) {
                        $anchor->setAttribute('href', $fileResponseContent['url']);
                        $anchor->setAttribute('title', $newFileName);
                        $anchor->nodeValue = $newFileName;
                    }
                    $assignment['description'] = $dom->saveHTML();
                    $response = $this->apiPut("courses/{$courseId}/assignments/{$assignment['id']}", [
                        'json' => [
                            'assignment' => [
                                'description' => $assignment['description'],
                            ],
                        ],
                    ]);
                }
            }
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

        if (strpos($url, 'https://') === false) {
            $pattern = '/\/files\/\d+/';

            preg_match($pattern, $url, $matches);
    
            $url = "https://" . $this->baseUrl . "/api/v1/" . $matches[0];
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

}
