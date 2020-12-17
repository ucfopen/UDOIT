<?php


namespace App\Controller;

use App\Entity\Course;
use App\Entity\Report;
use App\Repository\ContentItemRepository;
use App\Repository\FileItemRepository;
use App\Response\ApiResponse;
use App\Services\UtilityService;
use Knp\Bundle\SnappyBundle\Snappy\Response\PdfResponse;
use Knp\Snappy\Pdf;
use Mpdf\Mpdf;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Mime\FileinfoMimeTypeGuesser;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Twig\Environment;


class ReportsController extends ApiController
{
    private $request;
    private $session;
    private $util;

    /**
     * @Route("/api/courses/{course}/reports", methods={"GET"}, name="get_reports")
     * @param Request $request
     * @param $courseId
     * @return JsonResponse
     */
    public function getAllReports(
        Request $request,
        SessionInterface $session,
        UtilityService $util,
        Course $course
    ) {
        $this->request = $request;
        $this->session = $session;
        $this->util = $util;

        $apiResponse = new ApiResponse();
        try {
            // Check if user has course access
            if(!$this->userHasCourseAccess($course)) {
                throw new \Exception("You do not have permission to access the specified course.");
            }

            /** @var ReportRepository $repository */
            $repository = $this->getDoctrine()->getRepository(Report::class);
            $reports = $repository->findAllInCourse($course);

            $apiResponse->setData($reports);
        }
        catch (\Exception $e) {
            $apiResponse->addError($e->getMessage());
        }

        // Construct Response
        return new JsonResponse($apiResponse);
    }

    /**
     * @Route("/api/courses/{course}/reports/latest", methods={"GET"}, name="get_latest_report")
     * @param Course $course
     * 
     * @return JsonResponse
     */
    public function getLatestReport(Course $course)
    {
        $apiResponse = new ApiResponse();
        $reportArr = false;

        try {
            // Check if user has course access
            if (!$this->userHasCourseAccess($course)) {
                throw new \Exception('msg.no_permissions'); //"You do not have permission to access the specified course.");
            }

            $report = $course->getLatestReport();

            if (!$report) {
                throw new \Exception('msg.no_report_created');
            }

            if ($course->isDirty()) {
                throw new \Exception('msg.course_scanning');
            }
            
            $reportArr = $report->toArray();
            $reportArr['files'] = $course->getFileItems();
            $reportArr['issues'] = $course->getActiveIssues();
            $reportArr['contentItems'] = $course->getContentItems();
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

    /**
     * @Route("/download/courses/{course}/reports/pdf", methods={"GET"}, name="get_report_pdf")
     * @param Course $course
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function getPdfReport(
        Request $request,
        SessionInterface $session,
        UtilityService $util,
        Course $course
    ) {
        $this->request = $request;
        $this->session = $session;
        $this->util = $util;

        try {
            /** @var User $user */
            $user = $this->getUser();
            /** @var \App\Entity\Institution $institution */
            $institution = $user->getInstitution();
          
            $metadata = $institution->getMetadata();
            $lang = (!empty($metadata['lang'])) ? $metadata['lang'] : $_ENV['DEFAULT_LANG'];
            
            $content = [];
            foreach ($course->getContentItems() as $item) {
                $issues = $item->getIssues();

                if (count($issues)) {
                    $issueCount = ['error' => [], 'suggestion' => []];
                    foreach ($issues as $issue) {
                        if (!isset($issueCount[$issue->getType()][$issue->getScanRuleId()])) {
                            $issueCount[$issue->getType()][$issue->getScanRuleId()] = 0;
                        }
                        $issueCount[$issue->getType()][$issue->getScanRuleId()]++;
                    }

                    $content[] = [
                        'title' => $item->getTitle(),
                        'type' => $item->getContentType(),
                        'issues' => $issueCount,
                    ];
                }
            }


            // Generate Twig Template
            $html = $this->renderView(
                'report.html.twig',
                [
                    'course' => $course,
                    'report' => $course->getLatestReport(),
                    'content' => $content,
                    'labels' => (array) $this->util->getTranslation($lang),
                ]
            );

            // Generate PDF
            $mPdf = new Mpdf();
            $mPdf->WriteHTML($html);

            return $mPdf->Output(); //'udoit_report.pdf', \Mpdf\Output\Destination::DOWNLOAD);
        }
        catch(\Exception $e) {
            $apiResponse = new ApiResponse();
            $apiResponse->addMessage($e->getMessage());
            
            return new JsonResponse($apiResponse);
        }
    }
}