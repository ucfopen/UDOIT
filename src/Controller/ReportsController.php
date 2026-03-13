<?php


namespace App\Controller;

use App\Entity\Course;
use App\Entity\Report;
use App\Response\ApiResponse;
use App\Services\SessionService;
use App\Services\UtilityService;
use Doctrine\Persistence\ManagerRegistry;
use Mpdf\Mpdf;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Console\Output\ConsoleOutput;


class ReportsController extends ApiController
{
    private $util;

    private ManagerRegistry $doctrine;

    public function __construct(ManagerRegistry $doctrine)
    {
        $this->doctrine = $doctrine;
    }

    #[Route('/api/courses/{course}/reports', methods: ['GET'], name: 'get_reports')]
    public function getAllReports(
        SessionService $sessionService,
        UtilityService $util,
        Course $course
    ): JsonResponse {
        $this->util = $util;

        $apiResponse = new ApiResponse();
        try {
            // Check if user has course access
            if (!$this->userHasCourseAccess($course, $sessionService)) {
                throw new \Exception("msg.no_permissions");
            }

            /** @var ReportRepository $repository */
            $repository = $this->doctrine->getRepository(Report::class);
            $reports = $repository->findAllInCourse($course);

            $apiResponse->setData($reports);
        }
        catch (\Exception $e) {
            $apiResponse->addError($e->getMessage());
        }

        // Construct Response
        return new JsonResponse($apiResponse);
    }

    #[Route('/api/courses/{course}/reports/latest', methods: ['GET'], name: 'get_latest_report')]
    public function getLatestReport(SessionService $sessionService, Course $course): JsonResponse
    {
        $apiResponse = new ApiResponse();
        $reportArr = false;

        try {
            // Check if user has course access
            if (!$this->userHasCourseAccess($course, $sessionService)) {
                throw new \Exception('msg.no_permissions'); //"You do not have permission to access the specified course.");
            }

            if ($course->isDirty()) {
                throw new \Exception('msg.course_scanning');
            }

            $report = $course->getLatestReport();

            if (!$report) {
                throw new \Exception('msg.no_report_created');
            }
            
            $reportArr = $report->toArray();
            $reportArr['files'] = $course->getFileItems();
            $reportArr['issues'] = $course->getAllIssues();
            $reportArr['contentItems'] = $course->getContentItems();
            $reportArr['scanRules'] = $report->getData();
            $apiResponse->setData($reportArr);

            $prevReport = $course->getPreviousReport();
            if ($prevReport && ($prevReport->getIssueCount() == $report->getIssueCount())) {
                $apiResponse->addMessage('msg.no_new_content', 'success', 5000);
            }
            else {
                $apiResponse->addMessage('msg.new_content', 'success', 5000);
            }

        } catch (\Exception $e) {
            if ('msg.course_scanning' === $e->getMessage()) {
                $apiResponse->addMessage($e->getMessage(), 'info', 0, false);
            }
            else {
                $apiResponse->addMessage($e->getMessage(), 'alert', 0);
            }
        }

        // Construct Response
        return new JsonResponse($apiResponse);
    }

    #[Route('/api/reports/{report}/setdata', methods: ['POST'], name: 'set_report_data')]
    public function setReportData(
        SessionService $sessionService, 
        Request $request, 
        Report $report): JsonResponse
    {
        $apiResponse = new ApiResponse();

        try {
            $course = $report->getCourse();
            if (!$this->userHasCourseAccess($course, $sessionService)) {
                throw new \Exception("msg.no_permissions");
            }

            $data = json_decode($request->getContent(), true);
            $newData = json_decode($report->getData(), true);
            foreach ($data as $key => $value) {
                if (isset($newData[$key])) {
                    $newData[$key] = $value;
                }
            }
            $report->setData(json_encode($newData));
            $this->doctrine->getManager()->flush();

            $apiResponse->setData($report);
        } catch (\Exception $e) {
            $apiResponse->addError($e->getMessage(), 'info', 0, false);
        }

        // Construct Response
        return new JsonResponse($apiResponse);
    }
}
