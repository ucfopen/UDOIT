<?php

namespace App\Lms;

use App\Entity\Course;
use App\Lms\LmsInterface;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

class CanvasLms implements LmsInterface {
    /** @var SessionInterface $session */
    private $session;

    private $lmsDomain;
    private $lmsAccountId;
    private $lmsCourseId;
    private $lmsRootAccountId;
    private $lmsUserId;
    private $lmsResponse;
    private $baseUrl;

    /** @var HttpClientInterface $httpClient */
    private $httpClient;

    public function __construct(SessionInterface $session)
    {
        $this->session = $session;
        $headerToken = $this->session->get('token_header');
        $this->httpClient = HttpClient::create([
            'headers' => $headerToken,
        ]);
        $this->baseUrl = $this->session->get('base_url');
    }

    public function getId() 
    {
        return 'canvas';
    }

    public function getLmsDomain()
    {
        if (!isset($this->lmsDomain)) {
            $this->lmsDomain = $this->session->get('custom_canvas_api_domain');
        }
        return $this->lmsDomain;
    }

    public function getLmsAccountId()
    {
        if (!isset($this->lmsAccountId)) {
            $this->lmsAccountId = $this->session->get('custom_canvas_account_id');
        }
        return $this->lmsAccountId;
    }

    public function getLmsCourseId()
    {
        if (!isset($this->lmsCourseId)) {
            $this->lmsCourseId = $this->session->get('custom_canvas_course_id');
        }
        return $this->lmsCourseId;
    }

    public function getLmsUserId()
    {
        if (!isset($this->lmsUserId)) {
            $this->lmsUserId = $this->session->get('custom_canvas_user_id');
        }
        return $this->lmsUserId;
    }

    public function getScopes()
    {
        $scopes = [
            //'url:get:api/v1/accounts',
        ];

        return implode(' ', $scopes);
    }

    public function getLmsRootAccountId()
    {
        if (!isset($this->lmsRootAccountId)) {
            $this->lmsRootAccountId = $this->session->get('custom_canvas_root_account_id');
        }
        return $this->lmsRootAccountId;
    }

    public function getUserProfile()
    {
        $url = 'users/self';
        $response = $this->apiGet($url);

        if (!$response || !empty($response->getErrors())) {
            return false;
        }

        return $response->getContent();
    }

    public function getCourseContentUrls($courseId)
    {
        return [
            'syllabus' => "/api/v1/courses/{$courseId}",
            'assignment' => "/api/v1/courses/{$courseId}/assignments",
            'discussion_topic' => "/api/v1/courses/{$courseId}/discussion_topics",
            'file' => "/api/v1/courses/{$courseId}/files",
            'module' => "/api/v1/courses/{$courseId}/modules",
            'page' => "/api/v1/courses/{$courseId}/pages",
            'quiz' => "/api/v1/courses/{$courseId}/quizzes",
        ];
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
            $url = "{$this->baseUrl}/api/v1/{$url}";
        }

        $response = $this->httpClient->request('GET', $url, $options);
        $lmsResponse->setResponse($response);
        
        $content = $lmsResponse->getContent();
        if (!empty($content['errors'])) {
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