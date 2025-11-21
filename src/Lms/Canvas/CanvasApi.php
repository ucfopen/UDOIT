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
    protected $apiToken;

    public function __construct($baseUrl, $apiToken)
    {
        $this->httpClient = HttpClient::create([
            'headers' => ["Authorization: Bearer " . $apiToken],
        ]);
        $this->baseUrl = $baseUrl;
        $this->apiToken = $apiToken;
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
    public function apiFilePost(string $url, array $options, string $filepath, string $newFileName): LmsResponse
    {
        // Since files are posted to REPLACE existing files, they should be placed in the same folder
        $fileResponse = $this->apiGet($url);
        $file = $fileResponse->getContent();
        $endpointOptions = [
            'name' => $newFileName,
            'parent_folder_id' => $file['folder_id'],
        ];

        // Get the upload endpoint from Canvas for the new file
        $endpointResponse = $this->apiPost($options['postUrl'], ['query' => $endpointOptions], true);
        $endpointContent = $endpointResponse->getContent();

        // Attach the file and send it to the upload URL
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

    public function apiPutBatch(array $paths, array $options){
        if(count($paths) == 0) {
            return [];
        }

        $multi = curl_multi_init();
        $handles = [];
        $output = new ConsoleOutput();

        foreach($paths as $i => $url){
            if (strpos($url, 'https://') === false) {
                $url = "https://{$this->baseUrl}/api/v1/{$url}";
            }

            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => ["Authorization: Bearer {$this->apiToken}", "Content-Type: application/json"],
                CURLOPT_CUSTOMREQUEST => "PUT",
                CURLOPT_POSTFIELDS => json_encode($options[$i]),
            ]);
            curl_multi_add_handle($multi, $ch);
             
            $handles[$i] = $ch;
        }

        $running = null;
        do {
            curl_multi_exec($multi, $running);
            curl_multi_select($multi);
        } while ($running > 0);

        $responses = [];
        foreach ($handles as $i => $ch) {
            $content = curl_multi_getcontent($ch);
            $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            $type = "";
            $lmsId = "";

            if (preg_match('#/(\w+)/([^/]+)$#', $paths[$i], $matches)) {
                $type = $matches[1]; 
                $type = preg_replace('/s$/', '', $type);
                if(str_contains($type, "quiz")){
                    $type = "quiz";
                }
                $lmsId = $matches[2];   
            }
            
            $normalizedContent = json_decode($content);
            if ($type == 'discussion_topic' && isset($normalizedContent->is_announcement) && $normalizedContent->is_announcement) {
                $type = 'announcement';
            }
            $response = [
                'content' => $normalizedContent,
                'id' => $lmsId,
                'type' => $type,
                'status' => $status,
                'error' => $error,
            ];

            $responses[] = $response;
            
            curl_multi_remove_handle($multi, $ch);
            curl_close($ch);
        }

        curl_multi_close($multi);
        return $responses;
    }


    public function apiPostBatch(array $paths, array $options){
        if(count($paths) == 0) {
            return [];
        }

        $multi = curl_multi_init();
        $handles = [];
        $output = new ConsoleOutput();

        foreach($paths as $i => $url){
             if (strpos($url, 'https://') === false) {
                $url = "https://{$this->baseUrl}/api/v1/{$url}";
            }

            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => ["Authorization: Bearer {$this->apiToken}", "Content-Type: application/json"],
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($options[$i]),
            ]);
            curl_multi_add_handle($multi, $ch);

            $handles[$i] = $ch;
        }

        $running = null;
        do {
            curl_multi_exec($multi, $running);
            curl_multi_select($multi);
        } while ($running > 0);

        $responses = [];
        foreach ($handles as $i => $ch) {
            $content = curl_multi_getcontent($ch);
            $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);

            $normalizedContent = json_decode($content);
            $response = [
                'content' => $normalizedContent,
                'type' => 'section',
                'status' => $status,
                'error' => $error,
                'id' => $normalizedContent->id
            ];

            $responses[] = $response;
            
            curl_multi_remove_handle($multi, $ch);
            curl_close($ch);
        }

        return $responses;
    }

    public function apiDeleteBatch(array $paths){
        if(count($paths) == 0) {
            return [];
        }

        $multi = curl_multi_init();
        $handles = [];
        $output = new ConsoleOutput();

        foreach($paths as $i => $url){
             if (strpos($url, 'https://') === false) {
                $url = "https://{$this->baseUrl}/api/v1/{$url}";
            }

            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => ["Authorization: Bearer {$this->apiToken}", "Content-Type: application/json"],
                CURLOPT_CUSTOMREQUEST => "DELETE",
            ]);
            curl_multi_add_handle($multi, $ch);

            $handles[$i] = $ch;
        }

        $running = null;
        do {
            curl_multi_exec($multi, $running);
            curl_multi_select($multi);
        } while ($running > 0);

        $responses = [];
        foreach ($handles as $i => $ch) {
            $content = curl_multi_getcontent($ch);
            $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);

            $normalizedContent = json_decode($content);
            $response = [
                'content' => $normalizedContent,
                'type' => 'section',
                'status' => $status,
                'error' => $error,
            ];

            $responses[] = $response;
            
            curl_multi_remove_handle($multi, $ch);
            curl_close($ch);
        }

        return $responses;
    }

    public function apiDelete($url) {
        $output = new ConsoleOutput();
        $lmsResponse = new LmsResponse();

        if (strpos($url, 'https://') === false) {
            $pattern = '/\/files\/\d+/';

            preg_match($pattern, $url, $matches);

            
            $url = "https://" . $this->baseUrl . "/api/v1/" . $url;
        }

        $output->writeln($url);
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

}
