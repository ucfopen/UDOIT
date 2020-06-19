<?php


namespace App\Controller;


use App\Entity\Report;
use App\Response\ApiResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Class ReportsController
 * @package App\Controller
 * @Route("/courses/{courseId}/reports")
 */
class ReportsController extends AbstractController
{
    // Routes
    /**
     * @Route("/", methods={"GET"}, name="get_reports")
     * @param $courseId
     */
    public function allReports(Request $request, $courseId) {
        $apiResponse = new ApiResponse();
        try {
            // Get Reports
            $repository = $this->getDoctrine()->getRepository(Report::class);
            $reports = $repository->findAllInCourse($courseId);
            $apiResponse->setData($reports);
        }
        catch (\Exception $e) {
            // TODO: Handle Exception
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
    public function oneReport(Request $request, $reportId) {
        $apiResponse = new ApiResponse();
        // Get Report
        try {
            $repository = $this->getDoctrine()->getRepository(Report::class);
            $report = $repository->find($reportId);
            if(is_null($report)) {
                throw new \Exception(sprintf("Report with ID %s does not exist", $reportId));
            }
            $report->setSerializeIssues(true);
            $apiResponse->setData($report);
        }
        catch(\Exception $e) {
            // TODO: Handle Exception
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
    public function pdfReport(Request $request, $courseId, $reportId) {
        $apiResponse = new ApiResponse();
        try {
            // TODO: Validate language and return strings
            $apiResponse->setData(["status" => "This API endpoint is under construction."]);
        }
        catch(Exception $e) {

        }

        $jsonResponse = new JsonResponse($apiResponse);
        $jsonResponse->setEncodingOptions($jsonResponse->getEncodingOptions() | JSON_PRETTY_PRINT);
        return $jsonResponse;
    }
}