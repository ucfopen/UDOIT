<?php

namespace App\Controller;

use App\Entity\Course;
use App\Entity\ContentItem;
use App\Repository\CourseRepository;
use App\Response\ApiResponse;
use App\Services\LmsApiService;
use App\Services\LmsFetchService;
use App\Services\PhpAllyService;
use App\Services\EqualAccessService;
use App\Services\ScannerService;
use App\Services\UtilityService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Console\Output\ConsoleOutput;

use App\Message\FullRescanMessage;
use Symfony\Component\Messenger\MessageBusInterface;
use App\Services\BatchStatusService;
use Symfony\Component\Uid\Uuid;

class SyncController extends ApiController
{
    protected $maxAge = '1D';
    private MessageBusInterface $bus;

    public function __construct(MessageBusInterface $bus)
    {
        $this->bus = $bus;
    }


    /** @var UtilityService $util */
    protected $util;

    #[Route('/api/sync/{course}', name: 'request_sync')]
    public function requestSync(Course $course, LmsFetchService $lmsFetch) {
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

            // Check to see if the CODE (based on version number) has been updated since the last scan.
            // If so (or if we can't tell), force a full rescan.
            $force = true;
            $previousReport = $course->getLatestReport();
            if($previousReport) {
                $data = json_decode($previousReport->getData());
                $currentVersionNumber = !empty($_ENV['VERSION_NUMBER']) ? $_ENV['VERSION_NUMBER'] : '';
                if(isset($data->versionNumber) && $data->versionNumber === $currentVersionNumber) {
                    $force = false;
                }
            }

            $lmsFetch->refreshLmsContent($course, $user, $force);

            $report = $course->getLatestReport();

            if (!$report) {
                throw new \Exception('msg.no_report_created');
            }

            $reportArr = $report->toArray();
            $reportArr['files'] = $course->getFileItems();
            $reportArr['issues'] = $course->getAllIssues();
            $reportArr['contentItems'] = $course->getContentItems();
            $reportArr['contentSections'] = $lmsFetch->getCourseSections($course, $user);

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

    #[Route('/api/sync/rescan/{course}', name: 'full_rescan')]
    public function fullCourseRescan(Course $course, BatchStatusService $batchStatus): JsonResponse
    {
        $response = new ApiResponse();
        $user = $this->getUser();

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

            // ✅ Use $this->bus
            $batchId = Uuid::v4()->toRfc4122();
            $this->bus->dispatch(new FullRescanMessage(
                $course->getId(),
                $user->getId(),
                $user->getApiKey(),
                $user->getInstitution()->getLmsId(),
                $user->getInstitution()->getLmsDomain(),
                $batchId,
                true // force rescan
            ));

            // 🔑  initial status
            $batchStatus->setStatus($batchId, 'queued');

            $response->addMessage('msg.scan_queued', 'success', 5000);
            $response->setData([
                'status'  => 'queued',
                'batchId' => $batchId             // <‑‑ send to UI
            ]);

        } catch (\Exception $e) {
            $response->addMessage($e->getMessage(), 'error', 0);
        }

        return new JsonResponse($response);
    }

    #[Route('/api/sync/report/{course}', name: 'report_sync', methods: ['GET'])]
    public function getReport(Course $course, LmsFetchService $lmsFetch): JsonResponse
    {
        $response = new ApiResponse();
        $user = $this->getUser();
        $report = $course->getLatestReport();

        if (!$report) {
            throw new \Exception('msg.no_report_created');
        }

        $reportArr = $report->toArray();
        $reportArr['files'] = $course->getFileItems();
        $reportArr['issues'] = $course->getAllIssues();
        $reportArr['contentItems'] = $course->getContentItems();
        $reportArr['contentSections'] = $lmsFetch->getCourseSections($course, $user);

        $response->setData($reportArr);

        return new JsonResponse($response);

    }

    #[Route('/api/rescan/status/{batchId}', name: 'rescan_status', methods: ['GET'])]
    public function rescanStatus(string $batchId, BatchStatusService $batchStatus): JsonResponse
    {
        $response = new ApiResponse();
        $status = $batchStatus->getStatus($batchId);

        if (!$status) {
            $response->addMessage('msg.invalid_batch', 'error', 0);
            return new JsonResponse($response, 404);
        }

        $response->setData(['status' => $status]);
        return new JsonResponse($response);
    }



    #[Route('/api/sync/content/{contentItem}', name: 'content_sync', methods: ['GET'])]
    public function requestContentSync(ContentItem $contentItem, LmsFetchService $lmsFetch, ScannerService $scanner)
    {
        $printOutput = new ConsoleOutput();

        $printOutput->writeln("running content item");
        $response = new ApiResponse();
        $course = $contentItem->getCourse();
        $user = $this->getUser();
        $printOutput->writeln("running content item");
        // Delete old issues
        $lmsFetch->deleteContentItemIssues(array($contentItem));

        // Rescan the contentItem
        $report = $scanner->scanContentItem($contentItem, null, $this->util);
        $printOutput->writeln("scanned content item");

        // Add rescanned Issues to database
        foreach ($report->getIssues() as $issue) {
            if(isset($issue->isGeneric)) {
                $lmsFetch->createGenericIssue($issue, $contentItem);
            }
            else {
                $lmsFetch->createIssue($issue, $contentItem);
            }
        }

        // Update report
        $report = $lmsFetch->updateReport($course, $user, 1);
        if (!$report) {
            throw new \Exception('msg.no_report_created');
        }

        $reportArr = $report->toArray();
        $reportArr['files'] = $course->getFileItems();
        $reportArr['issues'] = $course->getAllIssues();
        $reportArr['contentItems'] = $course->getContentItems();
        $reportArr['contentSections'] = $lmsFetch->getCourseSections($course, $user);

        $response->setData($reportArr);

        return new JsonResponse($response);
    }

    #[Route('/api/async/content/{contentItem}', name: 'content_async', methods: ['GET'])]
    public function requestContentAsync(ContentItem $contentItem, LmsFetchService $lmsFetch, ScannerService $scanner)
    {
        $printOut = new ConsoleOutput();
        $response = new ApiResponse();
        $course = $contentItem->getCourse();
        $user = $this->getUser();

        // Timing: Start total execution
        $startTotal = microtime(true);

        // Timing: Start delete issues
        $startDelete = microtime(true);
        // Delete old issues
        $lmsFetch->deleteContentItemIssues(array($contentItem));
        // Timing: End delete issues
        $endDelete = microtime(true);
        $printOut->writeln('Delete ContentItem issues: ' . round(($endDelete - $startDelete) * 1000, 2) . 'ms');

        // Timing: Start scanning
        $startScan = microtime(true);
        // Rescan the contentItem
        $report = $scanner->scanContentItem($contentItem, null, $this->util);
        // Timing: End scanning
        $endScan = microtime(true);
        $printOut->writeln('Scan ContentItem: ' . round(($endScan - $startScan) * 1000, 2) . 'ms');

        // Timing: Start create issues
        $startCreateIssues = microtime(true);
        // Add rescanned Issues to database
        foreach ($report->getIssues() as $issue) {
            // Create issue entity
            $lmsFetch->createIssue($issue, $contentItem);
        }
        // Timing: End create issues
        $endCreateIssues = microtime(true);
        $printOut->writeln('Create issues: ' . round(($endCreateIssues - $startCreateIssues) * 1000, 2) . 'ms');

        // Timing: Start update report
        $startUpdateReport = microtime(true);
        // Update report
        $report = $lmsFetch->updateReport($course, $user);
        // Timing: End update report
        $endUpdateReport = microtime(true);
        $printOut->writeln('Update report: ' . round(($endUpdateReport - $startUpdateReport) * 1000, 2) . 'ms');

        if (!$report) {
            throw new \Exception('msg.no_report_created');
        }

        // Timing: Start data preparation
        $startData = microtime(true);
        $reportArr = $report->toArray();
        $reportArr['files'] = $course->getFileItems();
        $reportArr['issues'] = $course->getAllIssues();
        $reportArr['contentItems'] = $course->getContentItems();
        $response->setData($reportArr);
        // Timing: End data preparation
        $endData = microtime(true);
        $printOut->writeln('Prepare response data: ' . round(($endData - $startData) * 1000, 2) . 'ms');

        // Timing: End total execution
        $endTotal = microtime(true);
        $printOut->writeln('Total execution time: ' . round(($endTotal - $startTotal) * 1000, 2) . 'ms');

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
