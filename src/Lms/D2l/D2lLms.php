<?php

namespace App\Lms\D2l;

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

class D2lLms implements LmsInterface {

    const ACTIVITYTYPE_MODULE = 0;
    const ACTIVITYTYPE_FILE = 1;
    const ACTIVITYTYPE_LINK = 2;
    const ACTIVITYTYPE_DROPBOX = 3;
    const ACTIVITYTYPE_QUIZ = 4;
    const ACTIVITYTYPE_DISCUSSION_FORUM = 5;
    const ACTIVITYTYPE_DISCUSSION_TOPIC = 6;
    const ACTIVITYTYPE_LTI = 7;
    const ACTIVITYTYPE_CHAT = 8;
    const ACTIVITYTYPE_SCHEDULE = 9;
    const ACTIVITYTYPE_CHECKLIST = 10;
    const ACTIVITYTYPE_SELF_ASSESSMENT = 11;
    const ACTIVITYTYPE_SURVEY = 12;
    const ACTIVITYTYPE_ONLINE_ROOM = 13;

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

    private $d2lApi;

    public function __construct(
        ContentItemRepository $contentItemRepo,
        FileItemRepository $fileItemRepo,
        EntityManagerInterface $entityManager,
        UtilityService $util,
        Security $security,
        SessionService $sessionService,
        HtmlService $html
    ) {
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
        return 'd2l';
    }

    /**
     * ****************
     * OAuth Functions
     * ****************
     */
    
    public function testApiConnection(User $user)
    {
        $this->setD2lApi($user);

        $version = $this->getProductVersion('lp');
        $url = "lp/{$version}/users/whoami";
        
        $response = $this->d2lApi->apiGet($url);

        if (!$response || !empty($response->getErrors())) {
            return false;
        }

        return ($response->getStatusCode() < 400);
    }

    public function getOauthUri(Institution $institution, UserSession $session)
    {
        $query = [
            'client_id' => $institution->getApiClientId(),
            'scope' => $this->getScopes(),
            'response_type' => 'code',
            'redirect_uri' => LmsUserService::getOauthRedirectUri(),
            'state' => $session->getUuid(),
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
        $session = $this->sessionService->getSession();
        $baseUrl = $session->get('iss');

        $lmsParams = [];
        $params = array_merge($globalParams, $lmsParams);
        $queryStr = http_build_query($params);

        return "{$baseUrl}/d2l/lti/authenticate?{$queryStr}";
    }

    public function getKeysetUrl()
    {
        $session = $this->sessionService->getSession();
        
        return $session->get('iss') . '/d2l/.well-known/jwks';
    }

    public function saveTokenToSession($token)
    {
        $session = $this->sessionService->getSession();

        $contextFields = (array) $token->{'https://purl.imsglobal.org/spec/lti/claim/context'};
        foreach ($contextFields as $key => $val) {
            $session->set('lms_course_' . $key, $val);
        }

        $brightspaceFields = (array) $token->{'http://www.brightspace.com'};
        foreach ($brightspaceFields as $key => $val) {
            $session->set('lms_' . $key, $val);
        }
    }

    /**
     * ****************
     * Course Functions
     * ****************
     */
    public function updateCourseData(Course $course, User $user)
    {
        $this->setD2lApi($user);

        $version = $this->getProductVersion('lp');
        $url = "lp/{$version}/courses/{$course->getLmsCourseId()}";

        $response = $this->d2lApi->apiGet($url);

        if (!$response || !empty($response->getErrors())) {
            foreach ($response->getErrors() as $error) {
                $this->util->createMessage($error, 'error', $course, $user);
            }
            return;
        }
        $content = $response->getContent();

        $course->setTitle($content['Name']);
        $course->setActive(true);

        if (isset($content['Department'])) {
            $course->setLmsAccountId($content['Department']['Identifier']);
        }

        if (isset($content['Semester']['Identifier'])) {
            $course->setLmsTermId($content['Semester']['Identifier']);
        }

        $this->entityManager->flush();  
    }

    public function updateCourseContent(Course $course, User $user)
    {
        $lmsItems = $contentItems = [];

        $this->setD2lApi($user);

        // get overview
        $overview = $this->getCourseOverview($course);
        if ($overview) {
            $lmsItems[] = $overview;
        }

        // get table of contents
        $tocItems = $this->getTableOfContents($course);
        if (!empty($tocItems)) {
            $lmsItems = array_merge($lmsItems, $tocItems);
        }

        foreach ($lmsItems as $lmsContent) {
            if (empty($lmsContent)) {
                continue;
            }
            if (isset($lmsContent['fileName'])) {
                $this->updateFileItem($course, $lmsContent);
            }
            else {
                $contentItems[] = $this->createContentItem($lmsContent, $course);
            }
        }

        // push any updates made to content items to DB
        $this->entityManager->flush();

        return $contentItems;
    }
    

    public function updateContentItem(ContentItem $contentItem)
    {
        $user = $this->security->getUser();
        $this->setD2lApi($user);

        $url = $this->getContentItemApiUrl($contentItem);
        $response = $this->d2lApi->apiGet($url);

        if ($response->getErrors()) {
            $log = '';
            foreach ($response->getErrors() as $err) {
                $log .= ' | Msg: ' . $err;
            }

            $this->util->createMessage('Error retrieving content. Please try again.', 'error', $contentItem->getCourse(), $user);
            $this->util->createMessage($log, 'error', $contentItem->getCourse(), $user, true);
        } 
        else {
            $content = $response->getContent();

            switch ($contentItem->getContentType()) {
                case 'file':
                    $contentItem->setBody($content);
                    break;
                case 'link':
                    $contentItem->setBody($content['Url']);
                    break;
                case 'dropbox':
                    $contentItem->setBody($content['CustomInstructions']['Html']);
                    break;
                case 'quiz.instruction':
                    $contentItem->setBody($content['Instructions']['Text']['Html']);
                    break;
                case 'quiz.description':
                    $contentItem->setBody($content['Description']['Text']['Html']);
                    break;
                case 'quiz.header':
                    $contentItem->setBody($content['Header']['Text']['Html']);
                    break;
                case 'quiz.footer':
                    $contentItem->setBody($content['Footer']['Text']['Html']);
                    break;
                case 'discussion_forum':
                    $contentItem->setBody($content['Description']['Html']);
                    break;
                case 'discussion_topic':
                    //$contentItem->setBody($content['Description']['Html']);
                    break;
                case 'checklist':
                    $contentItem->setBody($content['Description']['Html']);
                    break;
                case 'survey':
                    $contentItem->setBody($content['Description']['Text']['Html']);
                    break;
                default:
            }

            $this->entityManager->flush();
        }
    }

    public function postContentItem(ContentItem $contentItem)
    {
        $user = $this->security->getUser();
        $this->setD2lApi($user);

        $url = $this->getContentItemApiUrl($contentItem); 
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
            
            $lmsResponse = $this->d2lApi->apiFilePut($url, $filepath);
        }
        else {
            $lmsResponse = $this->d2lApi->apiPut($url, ['body' => \json_encode($options)]);
        }

        if ($errors = $lmsResponse->getErrors()) {
            foreach ($errors as $error) {
                $this->util->createMessage(\json_encode($error));
            }
        }

        return $lmsResponse;
    }

    public function getCourseUrl(Course $course, User $user)
    {
        return "https://{$this->baseUrl}/d2l/home/{$course->getLmsCourseId()}";
    }

    public function getContentTypes()
    {
        return [
            'file',
            'link',
            'dropbox',
            'quiz.instruction',
            'quiz.description',
            'quiz.header',
            'quiz.footer',
            'discussion_forum',
            'discussion_topic',
            'checklist',
            'survey.description',
            'survey.submission',
            'survey.footer',
        ];
    }

    /*
     * **************
     * FILE ITEMS
     * **************
     */
    public function updateFileItem(Course $course, $file)
    {
        $fileItem = $this->fileItemRepo->findOneBy([
            'lmsFileId' => $file['id'],
            'course' => $course,
        ]);

        if (!$fileItem) {
            $domainName = $course->getInstitution()->getLmsDomain();
            $lmsUrl = "https://{$domainName}/d2l/le/content/{$course->getLmsCourseId()}/viewContent/{$file['id']}/View";
            
            $fileItem = new FileItem();
            $fileItem->setCourse($course)
                ->setFileName($file['fileName'])
                ->setFileType($file['fileType'])
                ->setLmsFileId($file['id'])
                ->setDownloadUrl($file['url'])
                ->setLmsUrl($lmsUrl)
                ->setActive(true);
            $this->entityManager->persist($fileItem);
        }

        $fileItem->update($file);
        $this->entityManager->flush();
    }

    public function postFileItem(FileItem $file)
    {
        return true;
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


    /**
     * *******************
     * PROTECTED FUNCTIONS
     * *******************
     */

    protected function setD2lApi(User $user) 
    {
        $apiDomain = $this->getApiDomain($user);
        $apiToken = $this->getApiToken($user);
        
        $this->d2lApi = new D2lApi($apiDomain, $apiToken);
    }

    protected function getProductVersion($productCode = null) 
    {
        $versions = [
            'lp' => '1.30',
            'le' => '1.51',
        ];

        if ($productCode) {
            return $versions[$productCode];
        }

        return $versions;
    }

    protected function getScopes()
    {
        $scopes = [
            'core:*:*',
            'content:*:*',
            'quizzing:*:*',
            'discussions:*:*',
            'checklists:*:*',
            'surveys:*:*',
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
        $contentType = $contentItem->getContentType();
        $html = $contentItem->getBody();

        $richTextInput = [
            'Type' => 'Html',
            'Content' => $html,
        ];

        $url = $this->getContentItemApiUrl($contentItem);
        $content = $this->d2lApi->apiGet($url)->getContent();

        switch ($contentType) {
            // case 'overview':
            //     $options[''] = $html;
            //     break;
            case 'dropbox':
                $content['CustomInstructions'] = $richTextInput;
                break;
            case 'topic':
                $content['Description'] = $richTextInput;
                break;
            case 'module':
                $content['Description'] = $richTextInput;
                break;
            case 'file':
                // file is saved on disk, so nothing is required here
                break;
            case 'quiz.instruction':
            case 'quiz.description':
            case 'quiz.header':
            case 'quiz.footer':
                $quizKeys = [
                    'quiz.instruction' => 'Instructions',
                    'quiz.description' => 'Description',
                    'quiz.footer' => 'Footer',
                    'quiz.header' => 'Header',
                ];

                $content = $this->convertQuizReadDataToQuizData($content);
                $content[$quizKeys[$contentType]]['Text'] = $richTextInput;
                break;
            case 'checklist':
                $content['Description'] = $richTextInput;
                break;
            case 'survey.description':
            case 'survey.submission':
            case 'survey.footer':
                if ('survey.description' === $contentType) {
                    $content['Description']['Text'] = $richTextInput;
                }
                else {
                    $content['Description']['Text'] = [
                        'Type' => 'Html',
                        'Content' => $content['Description']['Text']['Html'],
                    ];
                }

                if ('survey.submission' === $contentType) {
                    $content['Submission'] = $richTextInput;
                } else {
                    $content['Submission'] = [
                        'Type' => 'Html',
                        'Content' => $content['Submission']['Html'],
                    ];
                }
                
                if ('survey.footer' === $contentType) {
                    $content['Footer']['Text'] = $richTextInput;
                } else {
                    $content['Footer']['Text'] = [
                        'Type' => 'Html',
                        'Content' => $content['Footer']['Text']['Html'],
                    ];
                }
                break;
            case 'discussion_forum':
                $content['Description']['Html'] = $html;
                break;
            case 'discussion_topic':
                $content['Description'] = $richTextInput;
                break;
        }

        return $content;
    }

    protected function richTextInput($content) 
    {
        $type = (!empty($content['Html'])) ? 'Html' : 'Text';

        return [
            'Type' => $type,
            'Content' => $content[$type],
        ];
    }

    protected function convertQuizReadDataToQuizData($content)
    {
        unset($content['QuizId']);

        $content['Description']['Text'] = $this->richTextInput($content['Description']['Text']);
        //$content['Description']['IsDisplayed'] = !empty($content['Description']['Text']['Html']);
        
        $content['Instructions']['Text'] = $this->richTextInput($content['Instructions']['Text']);
        //$content['Instructions']['IsDisplayed'] = !empty($content['Instructions']['Text']['Html']);
        
        $content['Footer']['Text'] = $this->richTextInput($content['Footer']['Text']);
        //$content['Footer']['IsDisplayed'] = !empty($content['Footer']['Text']['Html']);
        
        $content['Header']['Text'] = $this->richTextInput($content['Header']['Text']);
        //$content['Header']['IsDisplayed'] = !empty($content['Header']['Text']['Html']);
        
        $content['NumberOfAttemptsAllowed'] = $content['AttemptsAllowed']['NumberOfAttemptsAllowed'];
        unset($content['AttemptsAllowed']);
        unset($content['ActivityId']);

        return $content;
    }

    protected function getContentItemApiUrl(ContentItem $contentItem)
    {
        $contentType = $contentItem->getContentType();
        $lmsCourseId = $contentItem->getCourse()->getLmsCourseId();
        $lmsContentId = $contentItem->getLmsContentId();
            
        return $this->getApiContentUrl($contentType, $lmsCourseId, $lmsContentId);
    }

    protected function getApiContentUrl($contentType, $lmsCourseId, $lmsContentId)
    {
        $leCode = $this->getProductVersion('le');

        $contentTypeParts = explode('.', $contentType);
        if (count($contentTypeParts) > 1) {
            $contentType = reset($contentTypeParts);
        }

        $lmsContentTypeUrls = [
            'checklist' => "le/{$leCode}/{$lmsCourseId}/checklists/{$lmsContentId}",
            'dropbox' => "le/{$leCode}/{$lmsCourseId}/dropbox/folders/{$lmsContentId}",
            'file' => "le/{$leCode}/{$lmsCourseId}/content/topics/{$lmsContentId}/file",
            'module' => "le/{$leCode}/{$lmsCourseId}/content/modules/{$lmsContentId}",
            'overview' => "le/{$leCode}/{$lmsCourseId}/overview",
            'survey' => "le/{$leCode}/{$lmsCourseId}/surveys/{$lmsContentId}",
            'topic' => "le/{$leCode}/{$lmsCourseId}/content/topics/{$lmsContentId}",
            'quiz' => "le/{$leCode}/{$lmsCourseId}/quizzes/{$lmsContentId}",
            'discussion_forum' => "le/{$leCode}/{$lmsCourseId}/discussions/forums/{$lmsContentId}",
        ];

        return $lmsContentTypeUrls[$contentType];
    }

    protected function getApiContent($contentType, $lmsCourseId, $lmsContentId)
    {
        $url = $this->getApiContentUrl($contentType, $lmsCourseId, $lmsContentId);
        $response = $this->d2lApi->apiGet($url);
        
        return $response->getContent();
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

    protected function getCourseOverview(Course $course)
    {
        $leCode = $this->getProductVersion('le');
        $url = "le/{$leCode}/{$course->getLmsCourseId()}/overview";
        $lmsDomain = $course->getInstitution()->getLmsDomain();
        $baseUrl = "https://{$lmsDomain}/d2l/home/{$course->getLmsCourseId()}";

        $response = $this->d2lApi->apiGet($url);
        $lmsContent = $response->getContent();

        if (empty($lmsContent)) {
            return null;
        }

        return [
            'id' => $course->getLmsCourseId(),
            'title' => 'Overview',
            'updated' => 'now',
            'status' => true,
            'url' => $baseUrl,
            'body' => $lmsContent['Description']['Html'],
            'contentType' => 'overview',
        ];
    }

    protected function getTableOfContents(Course $course)
    {
        $lmsItems = [];

        $leCode = $this->getProductVersion('le');
        $url = "le/{$leCode}/{$course->getLmsCourseId()}/content/toc";

        $response = $this->d2lApi->apiGet($url);
        $content = $response->getContent();

        if (isset($content['Modules'])) {
            foreach ($content['Modules'] as $module) {
                if (isset($module['Title'])) {
                    $lmsItems = array_merge($lmsItems, $this->getItemsFromModule($module, $course));
                }
            }
        }

        return $lmsItems;
    }

    protected function getItemsFromModule($module, Course $course)
    {
        $lmsItems = [];

        $domainName = $course->getInstitution()->getLmsDomain();
        $contentUrl = "https://{$domainName}/d2l/le/content/{$course->getLmsCourseId()}/Home";
        
        // add module if description not empty
        if (!empty($module['Description']['Html'])) {
            $lmsItems[] = [
                'id' => $module['ModuleId'],
                'title' => $module['Title'],
                'contentType' => 'module',
                'updated' => 'now',
                'status' => true,
                'url' => $contentUrl,
                'body' =>  $module['Description']['Html'],
            ];
        }

        foreach ($module['Modules'] as $submodule) {
            $lmsItems = array_merge($lmsItems, $this->getItemsFromModule($submodule, $course));
        }

        foreach ($module['Topics'] as $topic) {
            $topicUrl = "https://{$domainName}/d2l/le/content/{$course->getLmsCourseId()}/viewContent/{$topic['TopicId']}/View";
                
            if (!empty($topic['Description']['Html'])) {
                $lmsItems[] = [
                    'id' => $topic['TopicId'],
                    'title' => $topic['Title'],
                    'contentType' => 'topic',
                    'updated' => 'now',
                    'status' => true,
                    'url' => $topicUrl,
                    'body' => $topic['Description']['Html'],
                ];
            }

            $topicLmsItems = $this->getItemsFromTopic($topic, $course);            
            foreach ($topicLmsItems as $topicLmsItem) {
                if (!empty($topicLmsItem)) {
                    $topicLmsItem += [
                        'updated' => 'now',
                        'status' => true,
                        'url' => $topicUrl,
                    ];
                    $lmsItems[] = $topicLmsItem;
                }
            }
        }

        return $lmsItems;
    }

    protected function getItemsFromTopic($topic, Course $course)
    {
        $lmsItems = [];

        if (!isset($topic['ActivityType'])) {
            return false;
        }

        switch ($topic['ActivityType']) {
            case self::ACTIVITYTYPE_FILE:
                if (strpos($topic['Url'], '.htm')) {
                    $lmsItems[] = $this->handleHtmlFileActivity($topic, $course);
                }        
                else {
                    $lmsItems[] = $this->handleOtherFileActivity($topic, $course);
                }        
                break;
            case self::ACTIVITYTYPE_LINK:
                $lmsItems[] = $this->handleLinkActivity($topic, $course);
                break;
            case self::ACTIVITYTYPE_DROPBOX:
                $lmsItems[] = $this->handleDropboxActivity($topic, $course);
                break;
            case self::ACTIVITYTYPE_QUIZ:
                $lmsItems = $this->handleQuizActivity($topic, $course);
                break;
            case self::ACTIVITYTYPE_DISCUSSION_FORUM:
                $lmsItems[] = $this->handleDiscussionForumActivity($topic, $course);
                break;
            case self::ACTIVITYTYPE_DISCUSSION_TOPIC:
                // $lmsItems[] = $this->handleDiscussionTopicActivity($topic, $course);
                // break;
            case self::ACTIVITYTYPE_CHECKLIST:
                $lmsItems[] = $this->handleChecklistActivity($topic, $course);
                break;
            case self::ACTIVITYTYPE_SURVEY:
                $lmsItems = $this->handleSurveyActivity($topic, $course);
                break;
            default:
        }

        return $lmsItems;
    }

    protected function handleOtherFileActivity($topic, Course $course) 
    {
        $urlParts = explode('/', $topic['Url']);
        $fileName = end($urlParts);
        $fileParts = explode('.', $fileName);
        $fileType = end($fileParts);
        $domain = $course->getInstitution()->getLmsDomain();
        
        return [
            'updated' => $topic['LastModifiedDate'],
            'id' => $topic['TopicId'],
            'title' => $topic['Title'],
            'fileName' => $fileName,
            'fileType' => $fileType,
            'fileSize' => null,
            'status' => !$topic['IsLocked'],
            'hidden' => $topic['IsHidden'],
            'url' => "https://{$domain}{$topic['Url']}",
        ];
    }

    protected function handleHtmlFileActivity($topic, Course $course)
    {
        $content = $this->getApiContent('file', $course->getLmsCourseId(), $topic['TopicId']);
        
        if (empty($content)) {
            return false;
        }

        return [
            'id' => $topic['TopicId'],
            'title' => $topic['Title'],
            'contentType' => 'file',
            'body' => $content,
        ];
    }

    protected function handleLinkActivity($topic, Course $course)
    {
        return [
            'id' => $topic['TopicId'],
            'title' => $topic['Title'],
            'contentType' => 'link',
            'body' => $topic['Url'],
        ];
    }

    protected function handleDropboxActivity($topic, Course $course)
    {
        $content = $this->getApiContent('dropbox', $course->getLmsCourseId(), $topic['ToolItemId']);

        if (empty($content['CustomInstructions']['Html'])) {
            return false;
        }

        if (!empty($content['Attachments'])) {
            foreach ($content['Attachments'] as $attachment) {
                // $file = [

                // ];
                // $this->updateFileItem($course, $file);
            }
        }

        return [
            'id' => $topic['ToolItemId'],
            'title' => $topic['Title'],
            'contentType' => 'dropbox',
            'body' => $content['CustomInstructions']['Html'],
        ];
    }

    protected function handleQuizActivity($topic, Course $course)
    {
        $quizItems = [];
        $quiz = $this->getApiContent('quiz', $course->getLmsCourseId(), $topic['ToolItemId']);

        if (!empty($quiz['Instructions']['Text']['Html'])) {
            $quizItems[] = [
                'id' => $quiz['QuizId'],
                'title' => $quiz['Name'],
                'contentType' => 'quiz.instruction',
                'body' => $quiz['Instructions']['Text']['Html'],
            ];
        }

        if (!empty($quiz['Description']['Text']['Html'])) {
            $quizItems[] = [
                'id' => $quiz['QuizId'],
                'title' => $quiz['Name'],
                'contentType' => 'quiz.description',
                'body' => $quiz['Description']['Text']['Html'],
            ];
        }

        if (!empty($quiz['Header']['Text']['Html'])) {
            $quizItems[] = [
                'id' => $quiz['QuizId'],
                'title' => $quiz['Name'],
                'contentType' => 'quiz.header',
                'body' => $quiz['Header']['Text']['Html'],
            ];
        }

        if (!empty($quiz['Footer']['Text']['Html'])) {
            $quizItems[] = [
                'id' => $quiz['QuizId'],
                'title' => $quiz['Name'],
                'contentType' => 'quiz.footer',
                'body' => $quiz['Footer']['Text']['Html'],
            ];
        }

        return $quizItems;
    }

    protected function handleDiscussionForumActivity($forum, Course $course)
    {
        $content = $this->getApiContent('discussion_forum', $course->getLmsCourseId(), $forum['ToolItemId']);

        return [
            'id' => $forum['ToolItemId'],
            'title' => $forum['Title'],
            'contentType' => 'discussion_forum',
            'body' => !empty($content['Description']['Html']) ? $content['Description']['Html'] : '',
        ];
    }

    protected function handleDiscussionTopicActivity($topic, Course $course)
    {
        
    }

    protected function handleChecklistActivity($topic, Course $course)
    {
        $content = $this->getApiContent('checklist', $course->getLmsCourseId(), $topic['ToolItemId']);

        if (empty($content['Description']['Html'])) {
            return false;
        }

        // TODO: get checklist items and categories

        return [
            'id' => $topic['ToolItemId'],
            'title' => $topic['Title'],
            'contentType' => 'checklist',
            'body' => $content['Description']['Html'],
        ];
    }

    protected function handleSurveyActivity($topic, Course $course)
    {
        $items = [];
        $content = $this->getApiContent('survey', $course->getLmsCourseId(), $topic['ToolItemId']);

        if (!empty($content['Description']['Text']['Html'])) {
            $items[] = [
                'id' => $topic['ToolItemId'],
                'title' => $topic['Title'],
                'contentType' => 'survey.description',
                'body' => $content['Description']['Text']['Html'],
            ];
        }
        if (!empty($content['Submission']['Html'])) {
            $items[] = [
                'id' => $topic['ToolItemId'],
                'title' => $topic['Title'],
                'contentType' => 'survey.submission',
                'body' => $content['Submission']['Html'],
            ];
        }
        if (!empty($content['Footer']['Text']['Html'])) {
            $items[] = [
                'id' => $topic['ToolItemId'],
                'title' => $topic['Title'],
                'contentType' => 'survey.footer',
                'body' => $content['Footer']['Text']['Html'],
            ];
        }
        
        return $items;
    }

    protected function createContentItem($lmsContent, Course $course) 
    {
        $contentItem = $this->contentItemRepo->findOneBy([
            'contentType' => $lmsContent['contentType'],
            'lmsContentId' => $lmsContent['id'],
            'course' => $course,
        ]);

        if (!$contentItem) {
            $contentItem = new ContentItem();
            $contentItem->setCourse($course)
                ->setLmsContentId($lmsContent['id'])
                ->setTitle($lmsContent['title'])
                ->setPublished($lmsContent['status'])
                ->setActive(true)
                ->setUpdated($this->util->getCurrentTime())
                ->setContentType($lmsContent['contentType']);
            $this->entityManager->persist($contentItem);
            $this->entityManager->flush();
        }

        // some content types don't have an updated date, so we'll compare content
        // to find out if content has changed.
        if (in_array($lmsContent['contentType'], ['overview'])) {
            if ($contentItem->getBody() === $lmsContent['body']) {
                if ($contentItem->getUpdated()) {
                    $lmsContent['updated'] = $contentItem->getUpdated()->format('c');
                }
            }
        }

        $contentItem->update($lmsContent);
        
        return $contentItem;
    }
}