<?php

namespace App\Lms\Canvas;

use App\Entity\ContentItem;
use App\Entity\Course;
use App\Lms\LmsInterface;
use App\Repository\ContentItemRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

class CanvasLms implements LmsInterface {
    const CANVAS_TEST_BASE_URL = 'https://canvas.test.instructure.com';
    const CANVAS_BETA_BASE_URL = 'https://canvas.beta.instructure.com';
    const CANVAS_PROD_BASE_URL = 'https://canvas.instructure.com';
    
    /** @var SessionInterface $session */
    private $session;

    private $lmsDomain;
    private $lmsAccountId;
    private $lmsCourseId;
    private $lmsRootAccountId;
    private $lmsUserId;

    /** @var ContentItemRepository $contentItemRepo */
    private $contentItemRepo;
    /** @var CanvasApi $canvasApi */
    private $canvasApi;
    /** @var EntityManagerInterface $entityManager */
    private $entityManager;

    public function __construct(SessionInterface $session, 
        ContentItemRepository $contentItemRepo,
        CanvasApi $canvasApi,
        EntityManagerInterface $entityManager)
    {
        $this->session = $session;
        $this->contentItemRepo = $contentItemRepo;
        $this->canvasApi = $canvasApi;
        $this->entityManager = $entityManager;
    }

    public function getId() 
    {
        return 'canvas';
    }

    public function getLmsDomain()
    {
        if (!isset($this->lmsDomain)) {
            $this->lmsDomain = $this->session->get('lms_api_domain');
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
            'url:GET|/api/v1/accounts'
        ];

        return implode('%20', $scopes);
    }

    public function getLmsRootAccountId()
    {
        if (!isset($this->lmsRootAccountId)) {
            $this->lmsRootAccountId = $this->session->get('custom_canvas_root_account_id');
        }
        return $this->lmsRootAccountId;
    }

    public function testApiConnection()
    {
        $url = 'users/self';
        $response = $this->canvasApi->apiGet($url);

        if (!$response || !empty($response->getErrors())) {
            return false;
        }

        return $response->getContent();
    }

    public function getCourseContentUrls($courseId)
    {
        return [
            'syllabus' =>           "courses/{$courseId}?include[]=syllabus_body",
            'announcements' =>      "courses/{$courseId}/discussion_topics?only_announcements=true",
            'assignment' =>         "courses/{$courseId}/assignments",
            'discussion_topic' =>   "courses/{$courseId}/discussion_topics",
            'file' =>               "courses/{$courseId}/files",
            'module' =>             "courses/{$courseId}/modules",
            'page' =>               "courses/{$courseId}/pages",
            //'quiz' =>               "courses/{$courseId}/quizzes",
        ];
    }

    /**
     * Undocumented function
     *
     * @param Course $course
     * 
     * @return ContentItem[]
     */
    public function getCourseContent(Course $course) 
    {
        $content = $contentItems = [];
        $urls = $this->getCourseContentUrls($course->getLmsCourseId());

        foreach ($urls as $contentType => $url) {
            $response = $this->canvasApi->apiGet($url);

            if ($response->getErrors()) {
                // add errors to flash bag
                print "HERE";
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
                $out['body'] = $lmsContent['syllabus_body'];
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
                $out['id'] = $lmsContent['id'];
                $out['title'] = $lmsContent['title'];
                $out['updated'] = $lmsContent['last_reply_at'];
                $out['body'] = $lmsContent['message'];
                break;

            case 'module':
                $out['id'] = $lmsContent['id'];
                $out['title'] = $lmsContent['name'];
                $out['updated'] = 'now';
                $out['body'] = '';
                break;

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