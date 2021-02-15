<?php

namespace App\Lms\D2l;

use App\Entity\ContentItem;
use App\Entity\Course;
use App\Entity\FileItem;
use App\Entity\Institution;
use App\Entity\User;
use App\Lms\LmsInterface;
use App\Repository\ContentItemRepository;
use App\Repository\FileItemRepository;
use App\Services\HtmlService;
use App\Services\LmsUserService;
use App\Services\UtilityService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Security\Core\Security;

class D2lLms implements LmsInterface {
    /** @var ContentItemRepository $contentItemRepo */
    private $contentItemRepo;

    /** @var FileItemRepository $fileItemRepo */
    private $fileItemRepo;

    /** @var EntityManagerInterface $entityManager */
    private $entityManager;

    /** @var UtilityService $util */
    private $util;

    /** @var Security $security */
    private $security;

    /** @var SessionInterface $session */
    private $session;

    /** @var App\Services\HtmlService */
    private $html;

    public function __construct(
        ContentItemRepository $contentItemRepo,
        FileItemRepository $fileItemRepo,
        EntityManagerInterface $entityManager,
        UtilityService $util,
        Security $security,
        SessionInterface $session,
        HtmlService $html
    ) {
        $this->contentItemRepo = $contentItemRepo;
        $this->fileItemRepo = $fileItemRepo;
        $this->entityManager = $entityManager;
        $this->util = $util;
        $this->security = $security;
        $this->session = $session;
        $this->html = $html;
    }

    public function getId() 
    {
        return 'd2l';
    }

    /**
     * ****************
     * OAuth Functions
     * ****************
     */
    
    public function testApiConnection(User $user)
    {
        return true;
    }

    public function getOauthUri(Institution $institution)
    {
        $query = [
            'client_id' => $institution->getApiClientId(),
            'scope' => $this->getScopes(),
            'response_type' => 'code',
            'redirect_uri' => LmsUserService::getOauthRedirectUri(),
        ];

        return 'https://auth.brightspace.com/oauth2/auth?' . http_build_query($query);
    }

    public function getOauthTokenUri(Institution $institution)
    {
        return 'https://auth.brightspace.com/core/connect/token';
    }

    /**
     * *************
     * LTI Functions
     * *************
     */
    public function getLtiAuthUrl($globalParams)
    {
        $baseUrl = $this->session->get('iss');

        $lmsParams = [];
        $params = array_merge($globalParams, $lmsParams);
        $queryStr = http_build_query($params);

        return "{$baseUrl}/d2l/lti/authenticate?{$queryStr}";
    }

    public function getKeysetUrl()
    {
        return $this->session->get('iss') . '/d2l/.well-known/jwks';
    }

    public function saveTokenToSession($token)
    {
        $contextFields = (array) $token->{'https://purl.imsglobal.org/spec/lti/claim/context'};
        foreach ($contextFields as $key => $val) {
            $this->session->set('lms_course_' . $key, $val);
        }

        $brightspaceFields = (array) $token->{'http://www.brightspace.com'};
        foreach ($brightspaceFields as $key => $val) {
            $this->session->set('lms_' . $key, $val);
        }
    }

    /**
     * ****************
     * Course Functions
     * ****************
     */

    public function updateCourseContent(Course $course, User $user)
    {
        return true;
    }
    public function updateCourseData(Course $course, User $user)
    {
        return true;
    }

    public function updateContentItem(ContentItem $contentItem)
    {
        return true;
    }

    public function updateFileItem(Course $course, $file) 
    {
        return true;
    }

    public function postContentItem(ContentItem $contentItem)
    {
        return true;
    }

    public function postFileItem(FileItem $file)
    {
        return true;
    }

    public function getCourseUrl(Course $course, User $user)
    {
        return '';
    }


    /**
     * ******************
     * Account Functions
     * ******************
     */

    public function getAccountData(User $user, $accountId)
    {
        $accounts = [];

        return $accounts;
    }


    protected function getScopes()
    {
        $scopes = [
            'Core:*:*'
        ];

        return implode(' ', $scopes);
    }

    protected function getAccountInfo(User $user, $accountId)
    {
        // $url = "accounts/${accountId}";
        // $apiDomain = $this->getApiDomain($user);
        // $apiToken = $this->getApiToken($user);

        // $canvasApi = new CanvasApi($apiDomain, $apiToken);
        // $response = $canvasApi->apiGet($url);

        // if (!$response || !empty($response->getErrors())) {
        //     foreach ($response->getErrors() as $error) {
        //         $this->util->createMessage($error, 'error', null, $user);
        //     }
        //     return;
        // }

        // return $response->getContent();
    }

    protected function getSubAccounts(User $user, $accountId)
    {
        // $url = "accounts/${accountId}/sub_accounts?recursive=true";
        // $apiDomain = $this->getApiDomain($user);
        // $apiToken = $this->getApiToken($user);

        // $canvasApi = new CanvasApi($apiDomain, $apiToken);
        // $response = $canvasApi->apiGet($url);

        // if (!$response || !empty($response->getErrors())) {
        //     foreach ($response->getErrors() as $error) {
        //         $this->util->createMessage($error, 'error', null, $user);
        //     }
        //     return;
        // }

        // return $response->getContent();
    }

    protected function createLmsPostOptions(ContentItem $contentItem)
    {
        // $options = [];
        // $contentType = $contentItem->getContentType();
        // $html = $contentItem->getBody();

        // switch ($contentType) {
        //     case 'syllabus':
        //         $options['course[syllabus_body]'] = $html;
        //         break;

        //     case 'page':
        //         $options['wiki_page[body]'] = $html;
        //         break;

        //     case 'assignment':
        //         $options['assignment[description]'] = $html;
        //         break;

        //     case 'discussion_topic':
        //     case 'announcement':
        //         $options['message'] = $html;
        //         break;

        //     case 'file':
        //         $lmsCourseId = $contentItem->getCourse()->getLmsCourseId();
        //         $options['postUrl'] = "courses/{$lmsCourseId}/files";
        //         $options['body'] = $html;
        //         break;

        //         // case 'module':
        //         // break;

        // }

        // return $options;
    }

    protected function getContentTypeUrl(ContentItem $contentItem)
    {
        // $contentType = $contentItem->getContentType();
        // $lmsCourseId = $contentItem->getCourse()->getLmsCourseId();
        // $lmsContentId = $contentItem->getLmsContentId();

        // $lmsContentTypeUrls = [
        //     'announcement' => "courses/{$lmsCourseId}/discussion_topics/{$lmsContentId}",
        //     'assignment' => "courses/{$lmsCourseId}/assignments/{$lmsContentId}",
        //     'discussion_topic' => "courses/{$lmsCourseId}/discussion_topics/{$lmsContentId}",
        //     'file' => "courses/{$lmsCourseId}/files/{$lmsContentId}",
        //     'module' => "courses/{$lmsCourseId}/modules/{$lmsContentId}",
        //     'page' => "courses/{$lmsCourseId}/pages/{$lmsContentId}",
        //     'syllabus' => "courses/{$lmsCourseId}?include[]=syllabus_body",
        // ];

        // return $lmsContentTypeUrls[$contentType];
    }

    protected function normalizeLmsContent(Course $course, $contentType, $lmsContent)
    {
        // $out = [];
        // $domainName = $course->getInstitution()->getLmsDomain();
        // $baseUrl = "https://{$domainName}/courses/{$course->getLmsCourseId()}";

        // switch ($contentType) {
        //     case 'syllabus':
        //         $out['id'] = $lmsContent['id'];
        //         $out['title'] = $lmsContent['name'];
        //         $out['updated'] = 'now';
        //         $out['status'] = false;
        //         $out['url'] = $baseUrl;

        //         if (array_key_exists('syllabus_body', $lmsContent)) {
        //             $out['body'] = $lmsContent['syllabus_body'];
        //             $out['status'] = true;
        //         }

        //         break;

        //     case 'page':
        //         $out['id'] = $lmsContent['url'];
        //         $out['title'] = $lmsContent['title'];
        //         $out['updated'] = $lmsContent['updated_at'];
        //         $out['body'] = (!empty($lmsContent['body'])) ? $lmsContent['body'] : '';
        //         $out['status'] = $lmsContent['published'];
        //         $out['url'] = "{$baseUrl}/pages/{$lmsContent['url']}";

        //         break;

        //     case 'assignment':
        //         $out['id'] = $lmsContent['id'];
        //         if (!empty($lmsContent['quiz_id'])) {
        //             $out['id'] = $lmsContent['quiz_id'];
        //         }
        //         $out['title'] = $lmsContent['name'];
        //         $out['updated'] = $lmsContent['updated_at'];
        //         $out['body'] = $lmsContent['description'];
        //         $out['status'] = $lmsContent['published'];
        //         $out['url'] = "{$baseUrl}/assignments/{$lmsContent['id']}";

        //         break;

        //     case 'discussion_topic':
        //     case 'announcement':
        //         $out['id'] = $lmsContent['id'];
        //         $out['title'] = $lmsContent['title'];
        //         $out['updated'] = 'now';
        //         $out['body'] = $lmsContent['message'];
        //         $out['status'] = $lmsContent['published'];
        //         $out['url'] = "{$baseUrl}/discussion_topics/{$lmsContent['id']}";

        //         break;

        //         // case 'module':
        //         //     $out['id'] = $lmsContent['id'];
        //         //     $out['title'] = $lmsContent['name'];
        //         //     $out['updated'] = 'now';
        //         //     $out['body'] = '';
        //         //     break;

        //     case 'file':
        //         if ('html' !== $lmsContent['mime_class']) {
        //             break;
        //         }

        //         $out['id'] = $lmsContent['id'];
        //         $out['title'] = $lmsContent['display_name'];
        //         $out['updated'] = $lmsContent['updated_at'];
        //         $out['body'] = '';
        //         $out['status'] = !$lmsContent['hidden'];
        //         $out['url'] = "{$baseUrl}/files?preview={$lmsContent['id']}";

        //         if (isset($lmsContent['mime_class'])) {
        //             $out['fileType'] = $lmsContent['mime_class'];
        //         }

        //         break;
        // }

        // return $out;
    }

    protected function getCourseContentUrls($courseId)
    {
        return [
            // 'syllabus' =>           "courses/{$courseId}?include[]=syllabus_body",
            // 'announcement' =>       "courses/{$courseId}/discussion_topics?only_announcements=true",
            // 'assignment' =>         "courses/{$courseId}/assignments",
            // 'discussion_topic' =>   "courses/{$courseId}/discussion_topics",
            // 'file' =>               "courses/{$courseId}/files",
            // //'module' =>             "courses/{$courseId}/modules",
            // 'page' =>               "courses/{$courseId}/pages",
            // 'quiz' =>               "courses/{$courseId}/quizzes",
        ];
    }

    protected function getApiDomain(User $user)
    {
        $institution = $user->getInstitution();

        return $institution->getLmsDomain();
    }

    protected function getApiToken(User $user)
    {
        return $user->getApiKey();
    }

    protected function sortSubAccounts($a, $b)
    {
        return ($a['id'] > $b['id']) ? 1 : -1;
    }
}