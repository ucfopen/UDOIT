<?php

namespace App\Lms\Canvas;

use App\Entity\ContentItem;
use App\Entity\Course;
use App\Entity\FileItem;
use App\Entity\Institution;
use App\Entity\User;
use App\Entity\UserSession;
use App\Lms\LmsInterface;
use App\Repository\ContentItemRepository;
use App\Repository\FileItemRepository;
use App\Services\HtmlService;
use App\Services\LmsUserService;
use App\Services\SessionService;
use App\Services\UtilityService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\Security;

class CanvasLms implements LmsInterface {
    const CANVAS_TEST_BASE_URL = 'https://canvas.test.instructure.com';
    const CANVAS_BETA_BASE_URL = 'https://canvas.beta.instructure.com';
    const CANVAS_PROD_BASE_URL = 'https://canvas.instructure.com';

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

    /** @var SessionService $sessionService */
    private $sessionService;

    /** @var App\Services\HtmlService */
    private $html;

    public function __construct(
        ContentItemRepository $contentItemRepo,
        FileItemRepository $fileItemRepo,
        EntityManagerInterface $entityManager,
        UtilityService $util,
        Security $security,
        SessionService $sessionService,
        HtmlService $html)
    {
        $this->contentItemRepo = $contentItemRepo;
        $this->fileItemRepo = $fileItemRepo;
        $this->entityManager = $entityManager;
        $this->util = $util;
        $this->security = $security;
        $this->sessionService = $sessionService;
        $this->html = $html;
    }

    public function getId()
    {
        return 'canvas';
    }

    /**
     * ********************
     * LTI Authentication
     * ********************
     */

    public function getLtiAuthUrl($globalParams)
    {
        $session = $this->sessionService->getSession();
        $baseUrl = $_ENV['JWK_BASE_URL'];

        $lmsParams = [];
        $params = array_merge($globalParams, $lmsParams);
        $queryStr = http_build_query($params);

        return "{$baseUrl}api/lti/authorize_redirect?{$queryStr}";
    }

    public function getKeysetUrl()
    {
        $baseUrl = $_ENV['JWK_BASE_URL'];

        return "{$baseUrl}api/lti/security/jwks";
    }

    public function saveTokenToSession($token)
    {}

    /**
     * ********************
     * OAuth Authentication
     * ********************
     */

    public function getOauthUri(Institution $institution, UserSession $session)
    {
        $query = [
            'client_id' => $institution->getApiClientId(),
            'scope' => $this->getScopes(),
            'response_type' => 'code',
            'redirect_uri' => LmsUserService::getOauthRedirectUri(),
            'state' => $session->getUuid()
        ];
        $baseUrl = $this->util->getCurrentDomain();

        return "https://{$baseUrl}/login/oauth2/auth?" . http_build_query($query);
    }

    public function getOauthTokenUri(Institution $institution)
    {
        $baseUrl = $this->util->getCurrentDomain();

        return "https://{$baseUrl}/login/oauth2/token";
    }


    public function testApiConnection(User $user)
    {
        $url = 'users/self';
        $apiDomain = $this->getApiDomain($user);
        $apiToken = $this->getApiToken($user);

        $canvasApi = new CanvasApi($apiDomain, $apiToken);
        $response = $canvasApi->apiGet($url);

        return ($response->getStatusCode() < 400);
    }

    /**
     * ****************
     * Course Functions
     * ****************
     */

    public function updateCourseData(Course $course, User $user)
    {
        $url = "courses/{$course->getLmsCourseId()}?include[]=term";
        $apiDomain = $this->getApiDomain($user);
        $apiToken = $this->getApiToken($user);

        $canvasApi = new CanvasApi($apiDomain, $apiToken);
        $response = $canvasApi->apiGet($url);

        if (!$response || !empty($response->getErrors())) {
            foreach ($response->getErrors() as $error) {
                $this->util->createMessage($error, 'error', $course, $user);
            }
            return;
        }
        $content = $response->getContent();

        $course->setTitle($content['name']);
        $course->setLmsAccountId($content['account_id']);
        $course->setActive(true);

        if (isset($content['term']['id'])) {
            $course->setLmsTermId($content['term']['id']);
        }

        $this->entityManager->flush();
    }

    /**
     * Get content from Canvas and update content items
     *
     * @param Course $course
     * @param User $user
     *
     * @return ContentItem[]
     */
    public function updateCourseContent(Course $course, User $user)
    {
        $content = $contentItems = [];
        $urls = $this->getCourseContentUrls($course->getLmsCourseId());
        $apiDomain = $this->getApiDomain($user);
        $apiToken = $this->getApiToken($user);

        $canvasApi = new CanvasApi($apiDomain, $apiToken);

        foreach ($urls as $contentType => $url) {
            $response = $canvasApi->apiGet($url);

            if ($response->getErrors()) {
                $this->util->createMessage('Error retrieving content. Failed API Call: ' . $url, 'error', $course, $user);
            }
            else {
                if ('syllabus' === $contentType) {
                    $contentList = [$response->getContent()];
                }
                else {
                    $contentList = $response->getContent();
                }

                foreach ($contentList as $content) {
                    if (('file' === $contentType) && (in_array($content['mime_class'], $this->util->getUnscannableFileMimeClasses()))) {
                        $this->updateFileItem($course, $content);
                        continue;
                    }

                    if ('assignment' === $contentType && isset($content['quiz_id'])) {
                        continue;
                    }

                    $lmsContent = $this->normalizeLmsContent($course, $contentType, $content);
                    if (!$lmsContent) {
                        continue;
                    }

                    /* get page content */
                    if ('page' === $contentType) {
                        $url = "courses/{$course->getLmsCourseId()}/pages/{$lmsContent['id']}";
                        $pageResponse = $canvasApi->apiGet($url);
                        $pageObj = $pageResponse->getContent();

                        if (!empty($pageObj['body'])) {
                            $lmsContent['body'] = $pageObj['body'];
                        }
                    }

                    /* get HTML file content */
                    if (('file' === $contentType) && ('html' === $content['mime_class'])) {
                        $lmsContent['body'] = file_get_contents($content['url']);
                    }

                    $contentItem = $this->contentItemRepo->findOneBy([
                        'contentType' => $contentType,
                        'lmsContentId' => $lmsContent['id'],
                        'course' => $course,
                    ]);

                    if (!$contentItem) {
                        $contentItem = new ContentItem();
                        $contentItem->setCourse($course)
                            ->setLmsContentId($lmsContent['id'])
                            ->setActive(true)
                            ->setUpdated($this->util->getCurrentTime())
                            ->setContentType($contentType);
                        $this->entityManager->persist($contentItem);
                    }

                    // some content types don't have an updated date, so we'll compare content
                    // to find out if content has changed.
                    if (in_array($contentType, ['syllabus', 'discussion_topic', 'announcement'])) {
                        if ($contentItem->getBody() === $lmsContent['body']) {
                            if ($contentItem->getUpdated()) {
                                $lmsContent['updated'] = $contentItem->getUpdated()->format('c');
                            }
                        }
                    }

                    $contentItem->update($lmsContent);
                    $contentItems[] = $contentItem;
                }
            }
        }

        // push any updates made to content items to DB
        $this->entityManager->flush();

        return $contentItems;
    }


    public function updateFileItem(Course $course, $file)
    {
        $fileItem = $this->fileItemRepo->findOneBy([
            'lmsFileId' => $file['id'],
            'course' => $course,
        ]);

        if (!$fileItem) {
            $fileItem = new FileItem();
            $fileItem->setCourse($course)
                ->setFileName($file['filename'])
                ->setFileType($file['mime_class'])
                ->setLmsFileId($file['id'])
                ->setDownloadUrl($file['url'])
                ->setActive(true);
            $this->entityManager->persist($fileItem);
        }

        $domainName = $course->getInstitution()->getLmsDomain();
        $lmsUrl = "https://{$domainName}/courses/{$course->getLmsCourseId()}/files?preview={$file['id']}";
        $fileItem->setLmsUrl($lmsUrl);

        // normalize file keys
        $file['fileName'] = $file['filename'];
        $file['fileType'] = $file['mime_class'];
        $file['status'] = !$file['locked'];
        $file['fileSize'] = $file['size'];
        $file['updated'] = $file['updated_at'];

        $fileItem->update($file);
        $this->entityManager->flush();
    }

    public function updateContentItem(ContentItem $contentItem) {
        $user = $this->security->getUser();
        $apiDomain = $this->getApiDomain($user);
        $apiToken = $this->getApiToken($user);
        $url = $this->getContentTypeUrl($contentItem);
        $contentType = $contentItem->getContentType();

        $canvasApi = new CanvasApi($apiDomain, $apiToken);

        $response = $canvasApi->apiGet($url);

        if ($response->getErrors()) {
            $log = '';
            foreach ($response->getErrors() as $err) {
                $log .= ' | Msg: ' . $err;
            }

            $this->util->createMessage('Error retrieving content. Please try again.', 'error', $contentItem->getCourse(), $user);
            $this->util->createMessage($log, 'error', $contentItem->getCourse(), $user, true);
        }
        else {
            $apiContent = $response->getContent();
            $lmsContent = $this->normalizeLmsContent($contentItem->getCourse(), $contentType, $apiContent);

            /* get HTML file content */
            if ('file' === $contentType) {
                if ('html' === $apiContent['mime_class']) {
                    $lmsContent['body'] = file_get_contents($apiContent['url']);
                }
            }

            $contentItem->update($lmsContent);
            $this->entityManager->flush();
        }
    }

    public function postContentItem(ContentItem $contentItem)
    {
        $user = $this->security->getUser();
        $apiDomain = $this->getApiDomain($user);
        $apiToken = $this->getApiToken($user);
        $url = $this->getContentTypeUrl($contentItem);
        $canvasApi = new CanvasApi($apiDomain, $apiToken);
        $options = $this->createLmsPostOptions($contentItem);

        if ('file' === $contentItem->getContentType()) {
            // Save file to temp folder
            $filepath = $this->util->getTempPath() . '/content.' . $contentItem->getId() . '.html';
            $success = file_put_contents($filepath, $contentItem->getBody());

            if (!$success) {
                $this->util->createMessage(
                    'Content failed to save locally. Please contact an administrator.',
                    'error',
                    $contentItem->getCourse()
                );
                return;
            }

            $fileResponse = $canvasApi->apiFilePost($url, $options, $filepath);
            $fileObj = $fileResponse->getContent();

            if (isset($fileObj['id'])) {
                $contentItem->setLmsContentId($fileObj['id']);
                $this->entityManager->flush();
            }

            return $fileResponse;
        }

        return $canvasApi->apiPut($url, ['body' => $options]);
    }

    public function postFileItem(FileItem $file)
    {
        $user = $this->security->getUser();
        $apiDomain = $this->getApiDomain($user);
        $apiToken = $this->getApiToken($user);
        $canvasApi = new CanvasApi($apiDomain, $apiToken);
        $url = "courses/{$file->getCourse()->getLmsCourseId()}/files/{$file->getLmsFileId()}";
        $filepath = $this->util->getTempPath() . '/file.' . $file->getId();
        $options = [
            'postUrl' => "courses/{$file->getCourse()->getLmsCourseId()}/files"
        ];

        $fileResponse = $canvasApi->apiFilePost($url, $options, $filepath);
        $fileObj = $fileResponse->getContent();

        if (isset($fileObj['id'])) {
            $file->setLmsFileId($fileObj['id']);
            $this->entityManager->flush();
        }

        return $fileResponse;
    }

    public function getCourseUrl(Course $course, User $user)
    {
        $domain = $this->getApiDomain($user);

        return "https://{$domain}/courses/{$course->getLmsCourseId()}";
    }

    /**
     * ******************
     * Account Functions
     * ******************
     */

    public function getAccountData(User $user, $accountId = null)
    {
        $session = $this->sessionService->getSession();

        if (!$accountId) {
            $accountId = $session->get('lms_account_id');
        }

        $accounts = $session->get("accounts{$accountId}", []);

        if (!$accounts) {
            $topAcct = $this->getAccountInfo($user, $accountId);
            $accounts[$accountId] = [
                'id' => $topAcct['id'],
                'name' => $topAcct['name'],
                'parentId' => $topAcct['parent_account_id'],
            ];

            $subaccounts = $this->getSubAccounts($user, $accountId);
            usort($subaccounts, [$this, 'sortSubAccounts']);

            foreach ($subaccounts as $sub) {
                $accounts[$sub['id']] = [
                    'id' => $sub['id'],
                    'name' => $sub['name'],
                    'parentId' => $sub['parent_account_id'],
                ];
            }

            $session->set("accounts{$accountId}", $accounts);
        }

        return $accounts;
    }

    public function getAccountTerms(User $user)
    {
        $terms = [];

        $url = "accounts/self/terms";
        $apiDomain = $this->getApiDomain($user);
        $apiToken = $this->getApiToken($user);

        $canvasApi = new CanvasApi($apiDomain, $apiToken);
        $response = $canvasApi->apiGet($url);

        if (!$response || !empty($response->getErrors())) {
            foreach ($response->getErrors() as $error) {
                $this->util->createMessage($error, 'error', null, $user);
            }
            return;
        }
        $content = $response->getContent();

        if (isset($content['enrollment_terms'])) {
            foreach ($content['enrollment_terms'] as $term) {
                $terms[$term['id']] = $term;
            }
        }

        return $terms;
    }

    public function getContentTypes()
    {
        return [
            'announcement',
            'assignment',
            'discussion_topic',
            'file',
            'page',
            'quiz',
            'syllabus'
        ];
    }


    /**********************
     * PROTECTED FUNCTIONS
     **********************/

    protected function getAccountInfo(User $user, $accountId)
    {
        $url = "accounts/${accountId}";
        $apiDomain = $this->getApiDomain($user);
        $apiToken = $this->getApiToken($user);

        $canvasApi = new CanvasApi($apiDomain, $apiToken);
        $response = $canvasApi->apiGet($url);

        if (!$response || !empty($response->getErrors())) {
            foreach ($response->getErrors() as $error) {
                $this->util->createMessage($error, 'error', null, $user);
            }
            return;
        }

        return $response->getContent();
    }

    protected function getSubAccounts(User $user, $accountId)
    {
        $url = "accounts/${accountId}/sub_accounts?recursive=true";
        $apiDomain = $this->getApiDomain($user);
        $apiToken = $this->getApiToken($user);

        $canvasApi = new CanvasApi($apiDomain, $apiToken);
        $response = $canvasApi->apiGet($url);

        if (!$response || !empty($response->getErrors())) {
            foreach ($response->getErrors() as $error) {
                $this->util->createMessage($error, 'error', null, $user);
            }
            return;
        }

        return $response->getContent();
    }

    protected function createLmsPostOptions(ContentItem $contentItem)
    {
        $options = [];
        $contentType = $contentItem->getContentType();
        $html = $contentItem->getBody();

        switch ($contentType) {
            case 'syllabus':
                $options['course[syllabus_body]'] = $html;
                break;

            case 'page':
                $options['wiki_page[body]'] = $html;
                break;

            case 'assignment':
                $options['assignment[description]'] = $html;
                break;

            case 'discussion_topic':
            case 'announcement':
                $options['message'] = $html;
                break;

            case 'file':
                $lmsCourseId = $contentItem->getCourse()->getLmsCourseId();
                $options['postUrl'] = "courses/{$lmsCourseId}/files";
                $options['body'] = $html;
                break;

                // case 'module':
                // break;

        }

        return $options;
    }

    protected function getContentTypeUrl(ContentItem $contentItem)
    {
        $contentType = $contentItem->getContentType();
        $lmsCourseId = $contentItem->getCourse()->getLmsCourseId();
        $lmsContentId = $contentItem->getLmsContentId();

        $lmsContentTypeUrls = [
            'announcement' => "courses/{$lmsCourseId}/discussion_topics/{$lmsContentId}",
            'assignment' => "courses/{$lmsCourseId}/assignments/{$lmsContentId}",
            'discussion_topic' => "courses/{$lmsCourseId}/discussion_topics/{$lmsContentId}",
            'file' => "courses/{$lmsCourseId}/files/{$lmsContentId}",
            'module' => "courses/{$lmsCourseId}/modules/{$lmsContentId}",
            'page' => "courses/{$lmsCourseId}/pages/{$lmsContentId}",
            //'quiz' => "courses/{$lmsCourseId}/quizzes/{$lmsContentId}",
            'syllabus' => "courses/{$lmsCourseId}?include[]=syllabus_body",
        ];

        return $lmsContentTypeUrls[$contentType];
    }

    protected function normalizeLmsContent(Course $course, $contentType, $lmsContent)
    {
        $out = [];
        $domainName = $course->getInstitution()->getLmsDomain();
        $baseUrl = "https://{$domainName}/courses/{$course->getLmsCourseId()}";

        switch ($contentType) {
            case 'syllabus':
                $out['id'] = $lmsContent['id'];
                $out['title'] = $lmsContent['name'];
                $out['updated'] = 'now';
                $out['status'] = false;
                $out['url'] = $baseUrl;

                if (array_key_exists('syllabus_body', $lmsContent)) {
                    $out['body'] = $lmsContent['syllabus_body'];
                    $out['status'] = true;
                }

                break;

            case 'page':
                $out['id'] = $lmsContent['url'];
                $out['title'] = $lmsContent['title'];
                $out['updated'] = $lmsContent['updated_at'];
                $out['body'] = (!empty($lmsContent['body'])) ? $lmsContent['body'] : '';
                $out['status'] = $lmsContent['published'];
                $out['url'] = "{$baseUrl}/pages/{$lmsContent['url']}";

                break;

            case 'assignment':
                $out['id'] = $lmsContent['id'];
                $out['title'] = $lmsContent['name'];
                $out['updated'] = $lmsContent['updated_at'];
                $out['body'] = $lmsContent['description'];
                $out['status'] = $lmsContent['published'];
                $out['url'] = "{$baseUrl}/assignments/{$lmsContent['id']}";

                break;

            case 'discussion_topic':
            case 'announcement':
                $out['id'] = $lmsContent['id'];
                $out['title'] = $lmsContent['title'];
                $out['updated'] = 'now';
                $out['body'] = $lmsContent['message'];
                $out['status'] = $lmsContent['published'];
                $out['url'] = "{$baseUrl}/discussion_topics/{$lmsContent['id']}";

                break;

                // case 'module':
                //     $out['id'] = $lmsContent['id'];
                //     $out['title'] = $lmsContent['name'];
                //     $out['updated'] = 'now';
                //     $out['body'] = '';
                //     break;

            case 'file':
                if ('html' !== $lmsContent['mime_class']) {
                    break;
                }

                $out['id'] = $lmsContent['id'];
                $out['title'] = $lmsContent['display_name'];
                $out['updated'] = $lmsContent['updated_at'];
                $out['body'] = '';
                $out['status'] = !$lmsContent['hidden'];
                $out['url'] = "{$baseUrl}/files?preview={$lmsContent['id']}";

                if (isset($lmsContent['mime_class'])) {
                    $out['fileType'] = $lmsContent['mime_class'];
                }

                break;
        }

        return $out;
    }

    protected function getCourseContentUrls($courseId)
    {
        return [
            'syllabus' =>           "courses/{$courseId}?include[]=syllabus_body",
            'announcement' =>       "courses/{$courseId}/discussion_topics?only_announcements=true",
            'assignment' =>         "courses/{$courseId}/assignments",
            'discussion_topic' =>   "courses/{$courseId}/discussion_topics",
            'file' =>               "courses/{$courseId}/files",
            // we're not handling module item URLs yet.
            //'module' =>             "courses/{$courseId}/modules",
            'page' =>               "courses/{$courseId}/pages",
            'quiz' =>               "courses/{$courseId}/quizzes",
        ];
    }

    protected function getScopes()
    {
        $scopes = [
            // Accounts
            'url:GET|/api/v1/accounts',
            'url:GET|/api/v1/accounts/:id',
            'url:GET|/api/v1/accounts/:account_id/sub_accounts',

            // Assignments
            'url:GET|/api/v1/courses/:course_id/assignments',
            'url:GET|/api/v1/courses/:course_id/assignments/:id',
            'url:PUT|/api/v1/courses/:course_id/assignments/:id',

            // Courses
            'url:GET|/api/v1/courses/:id',
            'url:PUT|/api/v1/courses/:id',
            'url:POST|/api/v1/courses/:course_id/files',

            // Discussion Topics
            'url:GET|/api/v1/courses/:course_id/discussion_topics',
            'url:GET|/api/v1/courses/:course_id/discussion_topics/:topic_id',
            'url:PUT|/api/v1/courses/:course_id/discussion_topics/:topic_id',

            // Enrollment Terms
            'url:GET|/api/v1/accounts/:account_id/terms',

            // Files
            'url:GET|/api/v1/courses/:course_id/files',
            'url:GET|/api/v1/courses/:course_id/files/:id',

            // Modules
            'url:GET|/api/v1/courses/:course_id/modules',
            'url:GET|/api/v1/courses/:course_id/modules/:id',
            'url:PUT|/api/v1/courses/:course_id/modules/:id',
            'url:GET|/api/v1/courses/:course_id/modules/:module_id/items',
            'url:GET|/api/v1/courses/:course_id/modules/:module_id/items/:id',
            'url:PUT|/api/v1/courses/:course_id/modules/:module_id/items/:id',

            // Pages
            'url:GET|/api/v1/courses/:course_id/pages',
            'url:GET|/api/v1/courses/:course_id/pages/:url',
            'url:PUT|/api/v1/courses/:course_id/pages/:url',

            // Quiz Questions
            'url:GET|/api/v1/courses/:course_id/quizzes/:quiz_id/questions',
            'url:GET|/api/v1/courses/:course_id/quizzes/:quiz_id/questions/:id',
            'url:PUT|/api/v1/courses/:course_id/quizzes/:quiz_id/questions/:id',

            // Quizzes
            'url:GET|/api/v1/courses/:course_id/quizzes',
            'url:GET|/api/v1/courses/:course_id/quizzes/:id',
            'url:PUT|/api/v1/courses/:course_id/quizzes/:id',

            // Users
            'url:GET|/api/v1/users/:id',
        ];

        return implode(' ', $scopes);
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
        return ($a['id'] > $b['id']) ? 1: -1;
    }
}
