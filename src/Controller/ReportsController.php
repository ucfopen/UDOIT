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
     * @Route("/api/courses/{course}/reports/latest", methods={"GET"}, name="get_latest_report")
     * @param Course $course
     * 
     * @return JsonResponse
     */
    public function getLatestReport(Course $course)
    {
        $apiResponse = new ApiResponse();
        try {
            // Check if user has course access
            if (!$this->userHasCourseAccess($course)) {
                throw new \Exception("You do not have permission to access the specified course.");
            }

            if ($course->isDirty()) {
                throw new \Exception('Course syncing...');
            }
            
            $report = $course->getLatestReport();
            $apiResponse->setData($report->toArray(true));
        } catch (\Exception $e) {
            $apiResponse->addMessage($e->getMessage());
        }

        // Construct Response
        return new JsonResponse($apiResponse);
    }

    /**
     * @Route("/api/courses/{course}/reports/{report}", methods={"GET"}, name="get_report")
     * @param Course $course
     * @param Report $report
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
            
            $apiResponse->setData($report->toArray(true));
        }
        catch (\Exception $e) {
            $apiResponse->addError($e->getMessage());
        }

        // Construct Response
        return new JsonResponse($apiResponse);
    }

    /**
     * @Route("/api/courses/{course}/reports/{report}/pdf", methods={"GET"}, name="get_report_pdf")
     * @param $courseId
     * @param $reportId
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function getPdfReport(
        Request $request,
        SessionInterface $session,
        UtilityService $util,
        Course $course,
        Report $report
    ) {
        $this->request = $request;
        $this->session = $session;
        $this->util = $util;

        try {
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