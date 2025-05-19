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
use App\Services\LmsUserService;
use App\Services\SessionService;
use App\Services\UtilityService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Messenger\MessageBusInterface;

use Symfony\Component\Console\Output\ConsoleOutput;

class CanvasLms implements LmsInterface {
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

    public function __construct(
        ContentItemRepository $contentItemRepo,
        FileItemRepository $fileItemRepo,
        EntityManagerInterface $entityManager,
        UtilityService $util,
        Security $security,
        SessionService $sessionService,
        MessageBusInterface $bus
    )
    {
        $this->contentItemRepo = $contentItemRepo;
        $this->fileItemRepo = $fileItemRepo;
        $this->entityManager = $entityManager;
        $this->util = $util;
        $this->security = $security;
        $this->sessionService = $sessionService;
        $this->bus = $bus;
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

    public function getLtiAuthUrl($params)
    {
        $session = $this->sessionService->getSession();
        $baseUrl = !empty(getenv('JWK_BASE_URL')) ? getenv('JWK_BASE_URL') : $session->get('iss');
        $baseUrl = rtrim($baseUrl, '/');

        $queryStr = http_build_query($params);

        return "{$baseUrl}/api/lti/authorize_redirect?{$queryStr}";
    }

    public function getKeysetUrl()
    {
        $session = $this->sessionService->getSession();
        $baseUrl = !empty(getenv('JWK_BASE_URL')) ? getenv('JWK_BASE_URL') : $session->get('iss');
        $baseUrl = rtrim($baseUrl, '/');

        return "{$baseUrl}/api/lti/security/jwks";
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
        if (!$baseUrl) {
            $baseUrl = $institution->getLmsDomain();
        }

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


    public function updateCourseContent(Course $course, User $user): array
    {
        $printOutput = new ConsoleOutput();
        $startTime = microtime(true);
        $printOutput->writeln("Running FUNCTION updateCourseContent " . microtime(true));

        // Step 1: Prepare concurrency
        $urls       = $this->getCourseContentUrls($course->getLmsCourseId());
        $apiDomain  = $this->getApiDomain($user);
        $apiToken   = $this->getApiToken($user);
        $canvasApi  = new CanvasApi($apiDomain, $apiToken);

        // We'll map contentType -> pending ResponseInterface
        $pendingResponses = [];

        // Initiate all requests asynchronously
        foreach ($urls as $contentType => $url) {
            $pendingResponses[$contentType] = $canvasApi->apiGetAsync($url);
        }

        // Step 2: Process responses in parallel
        $client       = $canvasApi->getHttpClient();
        $contentItems = [];

        // We'll use Symfony's stream() to read them as they complete
        foreach ($client->stream($pendingResponses) as $response => $chunk) {

            /////////////////////////////////////////////////////
            // Used to get and see x-rate-limit-remaining
            $info = $response->getInfo();
            $headers = $info['response_headers'] ?? [];

            foreach ($headers as $header) {
                // Look for the header that starts with "x-rate-limit-remaining:" (case-insensitive)
                if (stripos($header, 'x-rate-limit-remaining:') === 0) {
                    // Split at the colon and trim the result to get the header value
                    $parts = explode(':', $header, 2);
                    $xRateLimitRemaining = trim($parts[1]);
                    $printOutput->writeln("x-rate-limit-remaining " . $xRateLimitRemaining);
                    break;
                }
            }
            //////////////////////////////////////////////////////

            if ($chunk->isFirst()) {
                // The first chunk indicates the start of this response
                // (often we do nothing here)
            }

            if ($chunk->isLast()) {
                // The final chunk means this response is fully finished
                $contentType = array_search($response, $pendingResponses, true);
                if (false === $contentType) {
                    // Should never happen, but just in case
                    continue;
                }

                // Use our new method to build LmsResponse
                $canvasResponse = $canvasApi->completeApiGet($response);

                // Now handle the data
                if ($canvasResponse->getErrors()) {
                    $this->util->createMessage(
                        'Error retrieving content. Failed API Call: ' . $urls[$contentType],
                        'error',
                        $course,
                        $user
                    );
                    continue;
                }

                // Some content types (like 'syllabus') return a single object,
                // others return an array
                $list = ('syllabus' === $contentType)
                    ? [$canvasResponse->getContent()]
                    : $canvasResponse->getContent();

                // Exactly like your existing loop:
                foreach ($list as $content) {
                    // Special handling for some file and assignment checks
                    if ($contentType === 'file'
                        && in_array($content['mime_class'], $this->util->getUnscannableFileMimeClasses())
                    ) {
                        $this->updateFileItem($course, $content);
                        continue;
                    }
                    if ($contentType === 'assignment' && isset($content['quiz_id'])) {
                        // quizzes counted as assignments => skip
                        continue;
                    }
                    if ($contentType === 'assignment' && isset($content['discussion_topic'])) {
                        // discussion topics set as assignments => skip
                        continue;
                    }

                    // Create or update ContentItem entity
                    $lmsContent = $this->normalizeLmsContent($course, $contentType, $content);
                    if (!$lmsContent) {
                        continue;
                    }

                    // If needed, fetch page/body details, etc.
                    if ('page' === $contentType) {
                        // e.g. fetch page body
                        $pageUrl = "courses/{$course->getLmsCourseId()}/pages/{$lmsContent['id']}";
                        // synchronous or asynchronous again if you'd like
                        $pageResp = $canvasApi->apiGet($pageUrl);
                        $pageObj  = $pageResp->getContent();
                        if (!empty($pageObj['body'])) {
                            $lmsContent['body'] = $pageObj['body'];
                        }
                    }

                    if ('file' === $contentType && 'html' === $content['mime_class']) {
                        // get raw HTML
                        $html = @file_get_contents($content['url']);
                        if ($html) {
                            $lmsContent['body'] = $html;
                        }
                    }

                    $contentItem = $this->contentItemRepo->findOneBy([
                        'contentType'  => $contentType,
                        'lmsContentId' => $lmsContent['id'],
                        'course'       => $course,
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

                    // Compare body for certain content types that don't have an updated date
                    if (in_array($contentType, ['syllabus', 'discussion_topic', 'announcement', 'quiz'])) {
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

        // $printOutput->writeln("n:ew contentItem" .json_encode( $contentItems));

        $printOutput->writeln("Running FUNCTION updateCourseContent START ". $startTime ." END " . microtime(true));

        // Now flush once at the end
        $this->entityManager->flush();

        return $contentItems;
    }


    public function getCourseSections(Course $course, User $user)
    {
        $sections = [];
        $lmsCourseId = $course->getLmsCourseId();
        $apiDomain = $this->getApiDomain($user);
        $apiToken = $this->getApiToken($user);

        $canvasApi = new CanvasApi($apiDomain, $apiToken);
        $urls = $this->getCourseContentUrls($lmsCourseId);

        $sectionUrl = $urls['module'];
        $response = $canvasApi->apiGet($sectionUrl);

        if ($response->getErrors()) {
            $this->util->createMessage('Error retrieving content. Failed API Call: ' . $url, 'error', $course, $user);
        }
        else {
            $contentList = $response->getContent();

            foreach ($contentList as $content) {
                $formattedSection = [];
                $formattedSection['id'] = $content['id'];
                $formattedSection['title'] = $content['name'];
                $formattedSection['status'] = $content['published'];
                $formattedSection['items'] = [];

                if(isset($content['items'])){
                    foreach ($content['items'] as $item) {
                        $formattedSection['items'][] = $item;
                    }
                }

                else {
                  $itemUrl = $sectionUrl . '/' . $content['id'] . '/items';
                  $itemApi = new CanvasApi($apiDomain, $apiToken);
                  $itemResponse = $itemApi->apiGet($itemUrl);

                  if ($itemResponse->getErrors()) {
                      $this->util->createMessage('Error retrieving content. Failed API Call: ' . $url, 'error', $course, $user);
                  }
                  else {
                    $itemList = $itemResponse->getContent();
                    if(isset($itemList)) {
                        foreach ($itemList as $item) {
                            $formattedSection['items'][] = $item;
                        }
                    }
                  }
              }
              $sections[] = $formattedSection;
            }
        }
        return $sections;
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

    public function updateContentItem(ContentItem $contentItem)
    {
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

            $fileResponse = $canvasApi->apiFilePost($url, $options, $filepath, $contentItem->getTitle());
            $fileObj = $fileResponse->getContent();

            if (isset($fileObj['id'])) {
                $contentItem->setLmsContentId($fileObj['id']);
                $this->entityManager->flush();
            }

            return $fileResponse;
        }

        return $canvasApi->apiPut($url, ['body' => $options]);
    }

    public function postFileItem(FileItem $file, string $newFileName)
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

        $fileResponse = $canvasApi->apiFilePost($url, $options, $filepath, $newFileName);
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
        $printOutput = new ConsoleOutput();
        $printOutput->writeln("getAccountTerms() called | user: ". $user);
        $session = $this->sessionService->getSession();
        $terms = $session->get("terms", []);

        if (empty($terms)) {
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

            $session->set("terms", $terms);
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
        $url = "accounts/{$accountId}";
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
        $url = "accounts/{$accountId}/sub_accounts?recursive=true";
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

            case 'quiz':
                $options['quiz[description]'] = $html;
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
            'quiz' => "courses/{$lmsCourseId}/quizzes/{$lmsContentId}",
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
                $out['url'] = "{$baseUrl}/assignments/syllabus";

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

            case 'quiz':
                $out['id'] = $lmsContent['id'];
                $out['title'] = $lmsContent['title'];
                $out['updated'] = 'now';
                $out['body'] = $lmsContent['description'];
                $out['status'] = $lmsContent['published'];
                $out['url'] = "{$baseUrl}/quizzes/{$lmsContent['id']}";

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
            'module' =>             "courses/{$courseId}/modules?include[]=items",
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
            'url:GET|/api/v1/courses/:course_id/pages/:url_or_id',
            'url:PUT|/api/v1/courses/:course_id/pages/:url_or_id',

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
        return ($a['id'] > $b['id']) ? 1 : -1;
    }

}
