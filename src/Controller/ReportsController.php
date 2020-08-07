<?php


namespace App\Controller;


use App\Entity\Report;
use App\Response\ApiResponse;
use Knp\Bundle\SnappyBundle\Snappy\Response\PdfResponse;
use Knp\Snappy\Pdf;
use Mpdf\Mpdf;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mime\FileinfoMimeTypeGuesser;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Twig\Environment;

/**
 * Class ReportsController
 * @package App\Controller
 * @Route("/courses/{courseId}/reports")
 */
class ReportsController extends ApiController
{
    /**
     * @Route("/", methods={"GET"}, name="get_reports")
     * @param Request $request
     * @param $institutionId
     * @param $courseId
     * @return JsonResponse
     */
    public function getAllReports(Request $request, $courseId) {
        $apiResponse = new ApiResponse();
        try {
            // Check if user has course access FIXME: Uncomment when front end is handling auth
//            if(!$this->userHasCourseAccess($courseId)) {
//                throw new \Exception("You do not have permission to access the specified course.");
//            }

            $repository = $this->getDoctrine()->getRepository(Report::class);
            $reports = $repository->findAllInCourse($courseId);

            $apiResponse->setData($reports);
        }
        catch (\Exception $e) {
            $apiResponse->setData($e->getMessage());
        }

        // Construct Response
        $jsonResponse = new JsonResponse($apiResponse);
        $jsonResponse->setEncodingOptions($jsonResponse->getEncodingOptions() | JSON_PRETTY_PRINT);
        return $jsonResponse;
    }


    /**
     * @Route("/{reportId}", methods={"GET"}, name="get_report")
     * @param $courseId
     * @param $reportId
     */
    public function getOneReport(Request $request, $courseId, $reportId) {
        $apiResponse = new ApiResponse();
        try {
            // Check if user has access to course FIXME: Uncomment when front end is handling auth
//            if(!$this->userHasCourseAccess($courseId)) {
//                throw new \Exception("You do not have permission to access the specified course.");
//            }

            // Get Report
            $repository = $this->getDoctrine()->getRepository(Report::class);
            $report = $repository->find($reportId);

            // Check if Report is null
            if(is_null($report)) {
                throw new \Exception(sprintf("Report with ID %s does not exist", $reportId));
            }

            // Set Data
            $report->setSerializeIssues(true);
            $apiResponse->setData($report);
        }
        catch(\Exception $e) {
            $apiResponse->setData($e->getMessage());
        }

        // Construct Response
        $jsonResponse = new JsonResponse($apiResponse);
        $jsonResponse->setEncodingOptions($jsonResponse->getEncodingOptions() | JSON_PRETTY_PRINT);
        return $jsonResponse;
    }

    /**
     * @Route("/{reportId}/pdf", methods={"GET"}, name="get_report_pdf")
     * @param $courseId
     * @param $reportId
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function getPdfReport(Request $request, $courseId, $reportId) {
        try {
            // Check if user has course access
//            if(!$this->userHasCourseAccess($courseId)) {
//                throw new \Exception("You do not have permission to access the specified course.");
//            }

            // Get Report
            $repository = $this->getDoctrine()->getRepository(Report::class);
            $report = $repository->find($reportId);

            // Check if Report is null
            if(is_null($report)) {
                throw new \Exception(sprintf("Report with ID %s does not exist", $reportId));
            }

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
            $apiResponse->setData($e->getMessage());
            $jsonResponse = new JsonResponse($apiResponse);
            $jsonResponse->setEncodingOptions($jsonResponse->getEncodingOptions() | JSON_PRETTY_PRINT);
            return $jsonResponse;
        }
    }
}