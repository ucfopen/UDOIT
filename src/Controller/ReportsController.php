<?php


namespace App\Controller;

use App\Entity\Course;
use App\Entity\Report;
use App\Response\ApiResponse;
use App\Services\UtilityService;
use Knp\Bundle\SnappyBundle\Snappy\Response\PdfResponse;
use Knp\Snappy\Pdf;
use Mpdf\Mpdf;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
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
     * @Route("/api/courses/{course}/reports/{report}", methods={"GET"}, name="get_report")
     * @param $courseId
     * @param $reportId
     */
    public function getOneReport(
        Course $course,
        Report $report
    ) {
        $apiResponse = new ApiResponse();
        try {
            // Check if user has course access
            if (!$this->userHasCourseAccess($course)) {
                throw new \Exception("You do not have permission to access the specified course.");
            }

            if ($report->getCourse()->getId() != $course->getId()) {
                throw new \Exception('Invalid report ID. This report does not belong to the given course.');
            }

            $report->setIncludeIssues(true);
            
            $apiResponse->setData($report);
        }
        catch (\Exception $e) {
            $apiResponse->addError($e->getMessage());
        }

        // Construct Response
        return new JsonResponse($apiResponse);
    }

    /**
     * @Route("/api/courses/{courseId}/reports/{reportId}/pdf", methods={"GET"}, name="get_report_pdf")
     * @param $courseId
     * @param $reportId
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function getPdfReport(
        Request $request,
        SessionInterface $session,
        UtilityService $util,
        int $courseId,
        int $reportId
    ) {
        $this->request = $request;
        $this->session = $session;
        $this->util = $util;

        try {
            // Check if user has course access
            $report = $this->getReportById($courseId, $reportId);

            // Generate Twig Template
            $html = $this->renderView(
                    'report.html.twig',
                        ['report' => $report]
            );

            // Generate PDF
            $mPdf = new Mpdf();
            $mPdf->WriteHTML($html);

            return new PdfResponse(
                $mPdf->Output(),
                array(
                    'Content-Type'          => 'application/pdf',
                    'Content-Disposition'   => 'attachment; filename="file.pdf"'
                )
            );
        }
        catch(\Exception $e) {
            $apiResponse = new ApiResponse();
            $jsonResponse = new JsonResponse($apiResponse);
            $jsonResponse->setEncodingOptions($jsonResponse->getEncodingOptions() | JSON_PRETTY_PRINT);
            return $jsonResponse;
        }
    }
}