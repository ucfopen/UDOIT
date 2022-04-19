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
    public function apiFilePost(string $url, array $options, string $filepath): LmsResponse
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
