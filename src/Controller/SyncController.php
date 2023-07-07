<?php

namespace App\Controller;

use App\Message\ScanMessage;
use App\Entity\Course;
use App\Entity\ContentItem;
use App\Entity\ProgressBar;
use App\Repository\CourseRepository;
use App\Response\ApiResponse;
use App\Services\LmsApiService;
use App\Services\LmsFetchService;
use App\Services\PhpAllyService;
use App\Services\UtilityService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Messenger\MessageBusInterface;
use Doctrine\Persistence\ManagerRegistry;

class SyncController extends ApiController
{
    protected $maxAge = '1D';

    /** @var UtilityService $util */
    protected $util;

    #[Route('/api/progress', name: 'progress')]
    public function hello(ManagerRegistry $doctrine) {
        $progressRepo = $doctrine->getManager()->getRepository(ProgressBar::class);
        $progressBar = $progressRepo->findOneBy([], ['id' => 'ASC']); 
        $data = [
            'total' => $progressBar->getTotal(),
            'progress' => $progressBar->getProgress(),
            'title' => $progressBar->getTitle(),
        ];
        return new JsonResponse($data);
    }

    #[Route('/api/sync/{course}', name: 'request_sync')]
    public function requestSync(Course $course, LmsFetchService $lmsFetch, MessageBusInterface $bus)
    {
        $response = new ApiResponse();
        $user = $this->getUser();
        $reportArr = false;

        try {
            if (!$this->userHasCourseAccess($course)) {
                throw new \Exception('msg.no_permissions');
            }
            if ($course->isDirty()) {
                throw new \Exception('msg.course_scanning');
            }
            if (!$course->isActive()) {
                $response->setData(0);
                throw new \Exception('msg.sync.course_inactive');
            }

            $lmsFetch->refreshLmsContent($course, $user, $bus);

            $response->addMessage('msg.worker_started', 'success', 5000);

        } catch (\Exception $e) {
            if ('msg.course_scanning' === $e->getMessage()) {
                $response->addMessage($e->getMessage(), 'info', 0, false);
            } else {
                $response->addMessage($e->getMessage(), 'error', 0);
            }
        }

        return new JsonResponse($response);
    }

    #[Route('/api/sync/getLatestReport/{course}', name: 'get_report', methods: ['GET'])]
    public function getLatestReport(Course $course) {

        $response = new ApiResponse();
        $reportArr = false;
        try {
            $report = $course->getLatestReport();

            if (!$report) {
                throw new \Exception('msg.no_report_created');
            }

            $reportArr = $report->toArray();
            $reportArr['files'] = $course->getFileItems();
            $reportArr['issues'] = $course->getAllIssues();
            $reportArr['contentItems'] = $course->getContentItems();

            $response->setData($reportArr);

            $prevReport = $course->getPreviousReport();
            if ($prevReport && ($prevReport->getIssueCount() == $report->getIssueCount())) {
                $response->addMessage('msg.no_new_content', 'success', 5000);
            } else {
                $response->addMessage('msg.new_content', 'success', 5000);
            }
        } catch (\Exception $e) {
            if ('msg.course_scanning' === $e->getMessage()) {
                $response->addMessage($e->getMessage(), 'info', 0, false);
            } else {
                $response->addMessage($e->getMessage(), 'error', 0);
            }
        }
        
        return new JsonResponse($response);
    }


    #[Route('/api/sync/content/{contentItem}', name: 'content_sync', methods: ['GET'])]
    public function requestContentSync(ContentItem $contentItem, LmsFetchService $lmsFetch, PhpAllyService $phpAlly)
    {
        $response = new ApiResponse();
        $course = $contentItem->getCourse();
        $user = $this->getUser();

        // Delete old issues
        $lmsFetch->deleteContentItemIssues(array($contentItem));

        // Rescan the contentItem
        $phpAllyReport = $phpAlly->scanContentItem($contentItem);

        // Add rescanned Issues to database
        foreach ($phpAllyReport->getIssues() as $issue) {
            // Create issue entity
            $lmsFetch->createIssue($issue, $contentItem);
        }

        // Update report
        $report = $lmsFetch->updateReport($course, $user);
        if (!$report) {
            throw new \Exception('msg.no_report_created');
        }

        $reportArr = $report->toArray();
        $reportArr['files'] = $course->getFileItems();
        $reportArr['issues'] = $course->getAllIssues();
        $reportArr['contentItems'] = $course->getContentItems();
        $response->setData($reportArr);

        return new JsonResponse($response);
    }

    #[Route('/cron/sync', name: 'cron_sync')]
    public function cronSync(LmsApiService $lmsApi)
    {
        /** @var CourseRepository $courseRepository */
        $courseRepository = $this->doctrine->getRepository(Course::class);
        $courses = $courseRepository->findCoursesNeedingUpdate($this->maxAge);
        $user = $this->getUser();

        $count = $lmsApi->addCoursesToBeScanned($courses, $user);

        return new JsonResponse($count);
    }
}
