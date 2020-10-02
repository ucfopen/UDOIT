<?php

namespace App\Services;

use App\Entity\ContentItem;
use App\Entity\User;
use App\Entity\Course;
use App\Entity\Issue;
use App\Entity\Report;
use App\Lms\Canvas\CanvasLms;
use App\Lms\D2l\D2lLms;
use App\Message\BackgroundQueueItem;
use App\Message\PriorityQueueItem;
use CidiLabs\PhpAlly\PhpAllyIssue;
use CidiLabs\PhpAlly\PhpAllyReport;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Messenger\MessageBusInterface;

class LmsApiService {
    const CANVAS_LMS = 'canvas';
    const D2L_LMS = 'd2l';

    /** @var SessionInterface $session */
    protected $session;

    /** @var Request $request */
    private $request;
    
    /** @var MesageBusInterface $bus */
    protected $bus;

    /** @var ManagerRegistry $doctrine */
    protected $doctrine;

    /** @var UtilityService $util */
    protected $util;

    /** @var CanvasLms $canvasLms */
    private $canvasLms;

    /** @var D2lLms $d2lLms */
    private $d2lLms;

    /** @var PhpAllyService $phpAllyService */
    private $phpAlly;

    public function __construct(
        SessionInterface $session,
        RequestStack $requestStack,
        MessageBusInterface $bus, 
        ManagerRegistry $doctrine, 
        UtilityService $util,
        CanvasLms $canvasLms,
        D2lLms $d2lLms,
        PhpAllyService $phpAlly)
    {
        $this->session = $session;
        $this->request = $requestStack->getCurrentRequest();
        $this->bus = $bus;
        $this->doctrine = $doctrine;        
        $this->util = $util;
        $this->phpAlly = $phpAlly;

        $this->canvasLms = $canvasLms;
        $this->d2lLms = $d2lLms;
    }

    public function getLmsId(?User $user = null)
    {
        if ($user) {
            return $user->getInstitution()->getLmsId();
        }
        if ($lmsId = $this->session->get('lms_id')) {
            return $lmsId;
        }
        
        return $_ENV['APP_LMS'];
    }

    public function getLms(?User $user = null)
    {
        $lmsId = $this->getLmsId($user);

        if (self::CANVAS_LMS === $lmsId) {
            return $this->canvasLms;
        } elseif (self::D2L_LMS === $lmsId) {
            return $this->d2lLms;
        } else {
            // handle other LMS classes
        }

        return false;
    }

    /**
     * Adds Course Refresh request to the Message Queue
     * 
     * @param Course[] $courses
     * @param User $user
     * @param bool $isPriority
     * 
     * @return int
     */
    public function createApiRequests($courses, User $user, $isPriority = false)
    {
        // Add courses to the Messenger Queue.
        foreach ($courses as $course) {
            // Set Course to Dirty
            $course->setDirty(true);

            if ($isPriority) {
                $this->bus->dispatch(new PriorityQueueItem($course, $user, 'refreshContent'));
            } else {
                $this->bus->dispatch(new BackgroundQueueItem($course, $user, 'refreshContent'));
            }
        }
        $this->doctrine->getManager()->flush();

        return count($courses);
    }

    /**
     * Course Refresh has these steps:
     * 1) Update course structure
     * 2) Find any updated content
     * 3) Create new report
     * 4) Link unchanged issues to new report
     * 5) Process updated content
     * 
     * @param Course $course
     * @param User $user
     */
    public function refreshLmsContent(Course $course, User $user)
    {
        $hasContent = false;
        $lms = $this->getLms($user);

        /** @var ContentItemRepository $contentItemRepo */
        $contentItemRepo = $this->doctrine->getManager()->getRepository(ContentItem::class);

        /* Step 1: Update content
        /* Update course status */
        $lms->updateCourseData($course, $user);
        
        /* Mark content items as inactive */
        $contentItemRepo->setCourseContentInactive($course);

        /* Update content items from LMS */
        $lms->updateCourseContent($course, $user);

        /* Step 2: Get list of changed content items */
        $contentItems = $contentItemRepo->getUpdatedContentItems($course);

        /* Only continue if the new content needs to be scanned (not all files) */
        foreach ($contentItems as $contentItem) {
            if ($contentItem->getBody() != '') {
                $hasContent = true;
                continue;
            }
        }

        if ($hasContent) {
            /* Step 3: Create a new report */
            $report = $this->createReport($course, $user);

            /* Step 4: Link unchanged issues to new report */
            $this->linkUnchangedIssuesToReport($report);

            /* Step 5: Process the updated content with PhpAlly and link to report */
            $this->scanContentItems($contentItems, $report);

            /* Step 6: Cleanup. Remove content item HTML. (optional) */

        }

        /* Save last_updated date on course */
        $course->setLastUpdated($this->util->getCurrentTime());
        $course->setDirty(false);
        $this->doctrine->getManager()->flush();
    }

    /**
     * Refresh content item data from the LMS
     *
     * @param ContentItem $contentItem
     * @return void
     */
    public function refreshContentItemFromLms(ContentItem $contentItem)
    {
        $lms = $this->getLms();
        $lms->updateContentItem($contentItem);
        $this->doctrine->getManager()->flush();
    }

    /**
     * Post the content from the content item back to the LMS
     *
     * @param ContentItem $contentItem
     * @return void
     */
    public function postContentItemToLms(ContentItem $contentItem) 
    {
        $lms = $this->getLms();
        $response = $lms->postContentItem($contentItem);
    }

    /**
     * Create new report
     *
     * @param Course $course
     * @param User $user
     * @return Report
     */
    public function createReport(Course $course, User $user) 
    {
        $report = new Report();
        $report->setCreated($this->util->getCurrentTime());
        $report->setReady(false);
        $report->setCourse($course);
        $report->setErrors(0);
        $report->setSuggestions(0);
        $report->setAuthor($user);

        $this->doctrine->getManager()->persist($report);
        $this->doctrine->getManager()->flush();

        return $report;
    }

    /**
     * Performs PHPAlly scan on each Content Item.
     * @param array $contentItems
     * @param Report $report
     */
    private function scanContentItems(array $contentItems, Report $report)
    {
        // Scan each update content item for issues
        /** @var \App\Entity\ContentItem $contentItem */
        foreach ($contentItems as $contentItem) {
            // Scan Content Item with PHPAlly
            $phpAllyReport = $this->phpAlly->scanContentItem($contentItem);
            if ($phpAllyReport) {
                // Add Issues to report
                foreach ($phpAllyReport->getIssues() as $issue) {
                    // Create issue entity 
                    $issueEntity = $this->createIssue($issue, $contentItem);

                    // Add issue entity to report
                    $report->addIssue($issueEntity);
                }
            }

            $this->doctrine->getManager()->flush();
        }
    }

    public function createIssue(PhpAllyIssue $issue, ContentItem $contentItem)
    {
        $issueEntity = new Issue();

        $issueEntity->setType($issue->getType());
        $issueEntity->setStatus(false);
        $issueEntity->setContentItem($contentItem);
        $issueEntity->setScanRuleId($issue->getRuleId());
        $issueEntity->setHtml($issue->getHtml());
        $issueEntity->setPreviewHtml($issue->getPreview());

        $this->doctrine->getManager()->persist($issueEntity);

        return $issueEntity;
    }

    /**
     * All content that was not 
     *
     * @param Report $report
     * @return void
     */
    private function linkUnchangedIssuesToReport(Report $report)
    {
        /** @var ContentItemRepository $contentItemRepo */
        $contentItemRepo = $this->doctrine->getManager()->getRepository(ContentItem::class);

        /* loop through content items */
        $course = $report->getCourse();

        foreach ($contentItemRepo->getUnchangedContentItems($course) as $contentItem) {
            /* Link all issues for the content item to the new report */
            foreach ($contentItem->getIssues() as $issue) {
                $report->addIssue($issue);
            }
        }
        $this->doctrine->getManager()->flush();
    }

    /**
     * Returns true if API key has been validated.
     *
     * @param User $user
     * @return bool
     */
    public function validateApiKey(User $user)
    {
        $apiKey = $user->getApiKey();

        if (empty($apiKey)) {
            return false;
        }

        try {
            $lms = $this->getLms();
            $profile = $lms->testApiConnection($user);

            if (empty($profile)) {
                throw new \Exception('Access token is invalid or expired.');
            }

            return true;
        } catch (\Exception $e) {
            $refreshed = $this->refreshApiKey($user);
            if (!$refreshed) {
                return false;
            }

            $profile = $lms->testApiConnection($user);

            if (!$profile) {
                return false;
            }

            return true;
        }
    }

    public function refreshApiKey(User $user)
    {
        $refreshToken = $user->getRefreshToken();
        $institution = $user->getInstitution();
        $baseUrl = $institution->getLmsDomain();

        if (empty($refreshToken)) {
            return false;
        }

        $options = [
            'query' => [
                'grant_type'    => 'refresh_token',
                'client_id'     => $institution->getApiClientId(),
                'redirect_uri'  => $this->getOauthRedirectUri(),
                'client_secret' => $institution->getApiClientSecret(),
                'refresh_token' => $refreshToken,
            ],
            'verify_host' => false,
            'verify_peer' => false,
        ];

        $client = HttpClient::create();
        $requestUrl = "https://{$baseUrl}/login/oauth2/token";
        $response = $client->request('POST', $requestUrl, $options);
        $contentStr = $response->getContent(false);
        $newKey = \json_decode($contentStr, true);

        // update the token in the database
        if (isset($newKey['access_token'])) {
            $this->updateUserToken($user, $newKey);

            return true;
        } else {
            return false;
        }
    }

    public function updateUserToken(User $user, $apiKey)
    {
        if (!empty($apiKey['access_token'])) {
            $user->setApiKey($apiKey['access_token']);
        }
        if (isset($apiKey['refresh_token'])) {
            $user->setRefreshToken($apiKey['refresh_token']);
        }

        $now = new \DateTime();
        $user->setLastLogin($now);

        $this->doctrine->getManager()->flush();
    }

    public function getOauthRedirectUri()
    {
        return $this->request->server->get('APP_OAUTH_REDIRECT_URL');
    }
}