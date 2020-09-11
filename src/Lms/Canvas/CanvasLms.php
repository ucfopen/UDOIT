<?php

namespace App\Lms\Canvas;

use App\Entity\ContentItem;
use App\Entity\Course;
use App\Entity\User;
use App\Lms\LmsInterface;
use App\Repository\ContentItemRepository;
use App\Services\UtilityService;
use Doctrine\ORM\EntityManagerInterface;

class CanvasLms implements LmsInterface {
    const CANVAS_TEST_BASE_URL = 'https://canvas.test.instructure.com';
    const CANVAS_BETA_BASE_URL = 'https://canvas.beta.instructure.com';
    const CANVAS_PROD_BASE_URL = 'https://canvas.instructure.com';

    /** @var ContentItemRepository $contentItemRepo */
    private $contentItemRepo;
    
    /** @var EntityManagerInterface $entityManager */
    private $entityManager;
    
    /** @var UtilityService $util */
    private $util;

    public function __construct(
        ContentItemRepository $contentItemRepo,
        EntityManagerInterface $entityManager,
        UtilityService $util)
    {
        $this->contentItemRepo = $contentItemRepo;
        $this->entityManager = $entityManager;
        $this->util = $util;
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
            'announcement' =>      "courses/{$courseId}/discussion_topics?only_announcements=true",
            'assignment' =>         "courses/{$courseId}/assignments",
            'discussion_topic' =>   "courses/{$courseId}/discussion_topics",
            'file' =>               "courses/{$courseId}/files",
            'module' =>             "courses/{$courseId}/modules",
            'page' =>               "courses/{$courseId}/pages",
            'quiz' =>               "courses/{$courseId}/quizzes",
        ];
    }

    /**
     * Get content from Canvas and update content items
     *
     * @param Course $course
     * 
     * @return ContentItem[]
     */
    public function updateCourseContent(Course $course, User $user) 
    {
        $content = $contentItems = [];
        $courseUpdated = $course->getLastUpdated();
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
                    $lmsContent = $this->normalizeLmsContent($contentType, $content);
                    if (!$lmsContent) { continue; }

                    // /* compare content updated date with previous course updated date */
                    // $contentUpdated = new \DateTime($lmsContent['updated'], UtilityService::$timezone);
                    // if ($contentUpdated < $courseUpdated) {
                    //     continue;
                    // }

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
                    if ('file' === $contentType) {
                        if ('html' === $content['mime_class']) {
                            $lmsContent['body'] = file_get_contents($content['url']);
                        }
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
                            ->setContentType($contentType);
                        $this->entityManager->persist($contentItem);
                    }

                    /* compare syllabus body to see if it's updated */
                    if ('syllabus' === $contentType) {
                        if ($contentItem->getBody() === $lmsContent['body']) {
                            continue;
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

    public function normalizeLmsContent($contentType, $lmsContent)
    {
        $out = [];

        switch ($contentType) {
            case 'syllabus':
                $out['id'] = $lmsContent['id'];
                $out['title'] = $lmsContent['name'];
                $out['updated'] = 'now';
                
                if(array_key_exists('syllabus_body', $lmsContent)) {
                    $out['body'] = $lmsContent['syllabus_body'];
                }
                break;
                
            case 'page':
                $out['id'] = $lmsContent['url'];
                $out['title'] = $lmsContent['title'];
                $out['updated'] = $lmsContent['updated_at'];
                $out['body'] = '';

                break;

            case 'assignment':
                $out['id'] = $lmsContent['id'];
                if (!empty($lmsContent['quiz_id'])) {
                    $out['id'] = $lmsContent['quiz_id'];
                }
                $out['title'] = $lmsContent['name'];
                $out['updated'] = $lmsContent['updated_at'];
                $out['body'] = $lmsContent['description'];
                break;

            case 'discussion_topic':
            case 'announcement':
                if (isset($lmsContent['posted_at'])) {
                    $out['id'] = $lmsContent['id'];
                    $out['title'] = $lmsContent['title'];
                    $out['updated'] = $lmsContent['posted_at'];
                    $out['body'] = $lmsContent['message'];
                }
                break;

            // case 'module':
            //     $out['id'] = $lmsContent['id'];
            //     $out['title'] = $lmsContent['name'];
            //     $out['updated'] = 'now';
            //     $out['body'] = '';
            //     break;

            case 'file':
                $out['id'] = $lmsContent['id'];
                $out['title'] = $lmsContent['display_name'];
                $out['updated'] = $lmsContent['updated_at'];
                $out['body'] = '';

                break;
        }

        return $out;
    }   
}