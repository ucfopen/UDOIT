<?php

namespace App\Lms\Canvas;

use App\Lms\LmsResponse;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

class CanvasApi {

    protected $session;
    protected $baseUrl;
    protected $httpClient;

    public function __construct(SessionInterface $session)
    {
        $this->session = $session;
        $headerToken = $this->session->get('tokenHeader');
        $this->httpClient = HttpClient::create([
            'headers' => $headerToken,
        ]);
        $this->baseUrl = $this->session->get('lms_api_domain');
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

        $this->lmsResponse = $lmsResponse;

        // #Parse header information from body response
        // $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        // $header = substr($result, 0, $header_size);
        // $body = substr($result, $header_size);
        // $data = json_decode($body, $return_array);
        // curl_close($ch);

        // #Parse Link Information
        // $header_info = $this->httpParseHeaders($header);
        // if (isset($header_info['Link'])) {
        //     $links = explode(',', $header_info['Link']);
        //     foreach ($links as $value) {
        //         if (preg_match('/^\s*<(.*?)>;\s*rel="(.*?)"/', $value, $match)) {
        //             $links[$match[2]] = $match[1];
        //         }
        //     }
        // }
        // #Check for Pagination
        // if (isset($links['next'])) {
        //     // Remove the API url so it is not added again in the get call
        //     $next_link = str_replace('https://' . $this->domain . '/api/v1/', '', $links['next']);
        //     $next_data = $this->curlGet($next_link, $return_array);
        //     $data = array_merge($data, $next_data);

        //     return $data;
        // } else {
        //     return $data;
        // }

        return $lmsResponse;
    }

    private function apiPost()
    {
    }

    private function apiPut()
    {
    }

    private function apiDelete()
    {
    }

}