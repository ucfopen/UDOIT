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

    /**
     * API call GET
     *
     * @param string $url
     * @param array $options
     * @param integer $perPage
     * 
     * @return LmsResponse
     */
    public function apiGet($url, $options = [], $perPage = 100, $lmsResponse = null)
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
        if (!empty($content['errors'])) {
            // If error is invalid token, refresh API token and try again 

            foreach ($content['errors'] as $error) {
                $lmsResponse->setError($error['message']);
            }
        }
        if (!empty($content['message'])) {
            $lmsResponse->setError($content['message']);
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

    /**
     * Posts a file to Canvas
     *
     * @param string $url
     * @param array $options
     * @param string $filepath
     * 
     * @return LmsResponse
     */
    public function apiFilePost($url, $options, $filepath)
    {
        $fileResponse = $this->apiGet($url);
        $file = $fileResponse->getContent();

        // TODO: handle failed call

        $endpointOptions = [
            'name' => urldecode($file['filename']),
            'parent_folder_id' => $file['folder_id'],            
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

}