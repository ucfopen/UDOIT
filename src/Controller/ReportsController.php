<?php


namespace App\Controller;


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
     * @Route("/api/courses/{courseId}/reports", methods={"GET"}, name="get_reports")
     * @param Request $request
     * @param $courseId
     * @return JsonResponse
     */
    public function getAllReports(
        Request $request,
        SessionInterface $session,
        UtilityService $util,
        int $courseId
    ) {
        $this->request = $request;
        $this->session = $session;
        $this->util = $util;

        $apiResponse = new ApiResponse();
        try {
            // Check if user has course access
            if(!$this->userHasCourseAccess($courseId)) {
                throw new \Exception("You do not have permission to access the specified course.");
            }

            $repository = $this->getDoctrine()->getRepository(Report::class);
            $reports = $repository->findAllInCourse($courseId);

            $apiResponse->setData($reports);
        }
        catch (\Exception $e) {

        }

        // Construct Response
        $jsonResponse = new JsonResponse($apiResponse);
        $jsonResponse->setEncodingOptions($jsonResponse->getEncodingOptions() | JSON_PRETTY_PRINT);
        return $jsonResponse;
    }


    /**
     * @Route("/api/courses/{courseId}/reports/{reportId}", methods={"GET"}, name="get_report")
     * @param $courseId
     * @param $reportId
     */
    public function getOneReport(
        Request $request,
        SessionInterface $session,
        UtilityService $util,
        int $courseId,
        int $reportId
    ) {
        $this->request = $request;
        $this->session = $session;
        $this->util = $util;

        $apiResponse = new ApiResponse();
        try {
            $report = $this->getReportById($courseId, $reportId);
            $apiResponse->setData($report);

        } catch(\Exception $e) {

        }
        // Construct Response
        $jsonResponse = new JsonResponse($apiResponse);
        $jsonResponse->setEncodingOptions($jsonResponse->getEncodingOptions() | JSON_PRETTY_PRINT);
        return $jsonResponse;
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
        catch(Exception $e) {
            $apiResponse = new ApiResponse();
            $jsonResponse = new JsonResponse($apiResponse);
            $jsonResponse->setEncodingOptions($jsonResponse->getEncodingOptions() | JSON_PRETTY_PRINT);
            return $jsonResponse;
        }
    }

    private function getReportById(int $courseId, int $reportId) {
        // Check if user has course access
        if(!$this->userHasCourseAccess($courseId)) {
            $this->session->getFlashBag()->add('error', 'You do not have permission to access the specified course.');
            throw new \Exception();
        }

        // Get Report
        $repository = $this->getDoctrine()->getRepository(Report::class);
        $report = $repository->find($reportId);

        // Check if Report is null
        if(is_null($report)) {
            $this->session->getFlashBag()->add('error', sprintf('Report with ID %s does not exist or you do not have access to it.', $reportId));
            throw new \Exception();
        }
        elseif($report->getCourse()->getId() != $courseId) {
            $this->session->getFlashBag()->add('error', sprintf('You do not have access to this Report.', $reportId));
            throw new \Exception();
        }

        $report->setSerializeIssues(true);

        return $report;
    }
}