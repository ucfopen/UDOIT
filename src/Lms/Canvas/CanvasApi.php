<?php

// src/Lms/Canvas/CanvasApi.php

namespace App\Lms\Canvas;

use App\Lms\LmsResponse;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

class CanvasApi
{
    protected string $baseUrl;
    protected HttpClientInterface $httpClient;

    public function __construct($baseUrl, $apiToken)
    {
        $this->baseUrl = $baseUrl;
        $this->httpClient = HttpClient::create([
            'headers' => ["Authorization: Bearer " . $apiToken],
        ]);
    }

    /**
     * Provide direct access to the underlying HttpClient
     * (so we can call $client->stream($responses) later).
     */
    public function getHttpClient(): HttpClientInterface
    {
        return $this->httpClient;
    }

    /**
     * Initiates an asynchronous API GET request.
     *
     * This method constructs a full API request URL, ensuring pagination parameters are included,
     * and sends a non-blocking GET request using Symfony's HttpClient.
     *
     * @param string $url The API endpoint URL (relative or absolute).
     * @param array $options Optional HTTP request options (e.g., headers, query parameters).
     * @param int $perPage The number of results per page (default: 100).
     *
     * @return ResponseInterface The response object that can be streamed or awaited later.
     */
    public function apiGetAsync(string $url, array $options = [], int $perPage = 100): ResponseInterface
    {
        if (!str_contains($url, 'per_page')) {
            $url .= str_contains($url, '?') ? '&per_page=' . $perPage : '?per_page=' . $perPage;
        }

        if (!str_contains($url, 'https://')) {
            $url = "https://{$this->baseUrl}/api/v1/{$url}";
        }

        return $this->httpClient->request('GET', $url, $options);
    }


    /**
     * Processes an API GET response, handling pagination and errors.
     *
     * This method wraps an API response into an `LmsResponse` object, processes the content,
     * checks for pagination links in the headers, and recursively fetches additional pages if necessary.
     * It also handles API errors by checking the status code and error messages in the response body.
     *
     * @param ResponseInterface $response The initial API response.
     * @return LmsResponse The processed response, including all paginated data if applicable.
     */
    public function completeApiGet(ResponseInterface $response): LmsResponse
    {
        $lmsResponse = new LmsResponse();
        $lmsResponse->setResponse($response);

        $content = $lmsResponse->getContent();

        $headers = $response->getHeaders(false);

        // Handle API pagination by checking for a 'Link' header
        if (!empty($headers['link'][0])) {
            $links = explode(',', $headers['link'][0]);

            foreach ($links as $value) {
                // Extract the URL and relation type (e.g., next, prev, last) from the link header
                if (preg_match('/^\s*<(.*?)>;\s*rel="(.*?)"/', $value, $match)) {
                    $rel = $match[2];    // Relation type (e.g., 'next')
                    $linkUrl = $match[1]; // URL for the next page

                    // If there's a next page, fetch it recursively
                    if ($rel === 'next') {
                        $this->fetchAllPages($linkUrl, $lmsResponse);
                    }
                }
            }
        }

        if ($lmsResponse->getStatusCode() >= 400) {
            $lmsResponse->setError('Failed API call');
        }

        if (!empty($content['errors'])) {
            foreach ($content['errors'] as $error) {
                $lmsResponse->setError($error['message']);
            }
        }

        return $lmsResponse;
    }


    /**
     * Recursively fetches all paginated API responses and merges them into a single response.
     *
     * This helper method ensures that all pages of a paginated API response are retrieved.
     * It follows the `rel="next"` links in the HTTP headers and continues fetching
     * until there are no more pages left.
     *
     * @param string $nextUrl The URL of the next page to fetch.
     * @param LmsResponse $lmsResponse The response object that accumulates data from multiple pages.
     *
     * @return void The function modifies the provided $lmsResponse object in place.
     */
    private function fetchAllPages(string $nextUrl, LmsResponse $lmsResponse): void
    {
        $moreResp = $this->httpClient->request('GET', $nextUrl);

        $lmsResponse->setResponse($moreResp);

        $headers = $moreResp->getHeaders(false);

        // Check if the 'link' header exists (used for pagination)
        if (!empty($headers['link'][0])) {
            $links = explode(',', $headers['link'][0]);

            foreach ($links as $value) {
                // Extract the URL and relation type (e.g., next, prev, last) from the link header
                if (preg_match('/^\s*<(.*?)>;\s*rel="(.*?)"/', $value, $match)) {
                    // If the relation type is 'next', recursively fetch the next page
                    if ($match[2] === 'next') {
                        $this->fetchAllPages($match[1], $lmsResponse);
                    }
                }
            }
        }
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
    public function apiFilePost(string $url, array $options, string $filepath, string $newFileName): LmsResponse
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

}
