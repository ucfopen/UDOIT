<?php

namespace App\Lms\Canvas;

use App\Entity\ContentItem;
use App\Entity\Course;
use App\Entity\FileItem;
use App\Entity\User;
use App\Lms\LmsInterface;
use App\Repository\ContentItemRepository;
use App\Repository\FileItemRepository;
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

    public function __construct(
        ContentItemRepository $contentItemRepo,
        FileItemRepository $fileItemRepo,
        EntityManagerInterface $entityManager,
        UtilityService $util,
        Security $security)
    {
        $this->contentItemRepo = $contentItemRepo;
        $this->fileItemRepo = $fileItemRepo;
        $this->entityManager = $entityManager;
        $this->util = $util;
        $this->security = $security;
    }

    public function getId() 
    {
        return 'canvas';
    }

    public function getScopes()
    {
        $scopes = [
            'url:GET|/api/v1/accounts',
            'url:GET|/api/v1/courses/:course_id/assignments',
            'url:GET|/api/v1/announcements',
            'url:GET|/api/v1/courses/:course_id/discussion_topics',
            'url:GET|/api/v1/courses/:course_id/files',
            'url:GET|/api/v1/courses/:course_id/modules',
            'url:GET|/api/v1/courses/:course_id/pages',
            'url:GET|/api/v1/courses/:id',
            'url:GET|/api/v1/courses'
        ];

        return implode(' ', $scopes);
    }

    public function getApiDomain(User $user) 
    {
        $institution = $user->getInstitution();

        return $institution->getLmsDomain();
    }

    public function getApiToken(User $user) 
    {
        return $user->getApiKey();
    }

    public function testApiConnection(User $user)
    {
        $url = 'users/self';
        $apiDomain = $this->getApiDomain($user);
        $apiToken = $this->getApiToken($user);

        $canvasApi = new CanvasApi($apiDomain, $apiToken);
        $response = $canvasApi->apiGet($url);

        if (!$response || !empty($response->getErrors())) {
            return false;
        }

        return ($response->getContent());
    }

    public function updateCourseData(Course $course, User $user)
    {
        $url = "courses/{$course->getLmsCourseId()}";
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
        $course->setDirty(true);
        
        $this->entityManager->flush();        
    }

    protected function getCourseContentUrls($courseId)
    {
        return [
            'syllabus' =>           "courses/{$courseId}?include[]=syllabus_body",
            'announcement' =>       "courses/{$courseId}/discussion_topics?only_announcements=true",
            'assignment' =>         "courses/{$courseId}/assignments",
            'discussion_topic' =>   "courses/{$courseId}/discussion_topics",
            'file' =>               "courses/{$courseId}/files",
            //'module' =>             "courses/{$courseId}/modules",
            'page' =>               "courses/{$courseId}/pages",
            'quiz' =>               "courses/{$courseId}/quizzes",
        ];
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
                            ->setContentType($contentType);
                        $this->entityManager->persist($contentItem);
                    }

                    // /* compare syllabus body to see if it's updated */
                    if ('syllabus' === $contentType) {
                        if ($contentItem->getBody() === $lmsContent['body']) {
                            $lmsContent['updated'] = $contentItem->getUpdated()->format('c');
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
                ->setLmsFileId($file['id']);
            $this->entityManager->persist($fileItem);
        }

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
            $this->util->createMessage('Error retrieving content. Failed API Call: ' . $url, 'error', 
                $contentItem->getCourse(), $user);
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
            $filepath = $this->util->getTempPath() . '/' . $contentItem->getId();

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

    public function postFile(ContentItem $contentItem) 
    {

    }

    public function getContentTypeUrl(ContentItem $contentItem)
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

    public function normalizeLmsContent(Course $course, $contentType, $lmsContent)
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
                
                if(array_key_exists('syllabus_body', $lmsContent)) {
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
                if (!empty($lmsContent['quiz_id'])) {
                    $out['id'] = $lmsContent['quiz_id'];
                }
                $out['title'] = $lmsContent['name'];
                $out['updated'] = $lmsContent['updated_at'];
                $out['body'] = $lmsContent['description'];
                $out['status'] = $lmsContent['published'];
                $out['url'] = "{$baseUrl}/assignments/{$lmsContent['id']}";

                break;

            case 'discussion_topic':
            case 'announcement':
                if (isset($lmsContent['posted_at'])) {
                    $out['id'] = $lmsContent['id'];
                    $out['title'] = $lmsContent['title'];
                    $out['updated'] = $lmsContent['posted_at'];
                    $out['body'] = $lmsContent['message'];
                    $out['status'] = $lmsContent['published'];
                    $out['url'] = "{$baseUrl}/discussion_topics/{$lmsContent['id']}";
                }
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

    public function createLmsPostOptions(ContentItem $contentItem)
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
}