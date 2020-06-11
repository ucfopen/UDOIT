<?php


namespace App\Controller;


use App\Entity\Report;
use App\Response\ApiResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Class ReportsController
 * @package App\Controller
 * @Route("/courses/{courseId}/reports")
 */
class ReportsController extends AbstractController
{
    /**
     * @Route("/", methods={"GET"}, name="all_reports")
     * @param $courseId
     */
    public function allReports($courseId) {
        // TODO: Assert user has permissions to perform action
        // TODO: Handle Exceptions
        // Get Reports
        $repository = $this->getDoctrine()->getRepository(Report::class);
        $reports = $repository->findAllInCourse($courseId);

        // Construct Response
        $apiResponse = new ApiResponse();
        $apiResponse->setData($reports);
        $jsonResponse = new JsonResponse($apiResponse);
        $jsonResponse->setEncodingOptions($jsonResponse->getEncodingOptions() | JSON_PRETTY_PRINT);
        return $jsonResponse;
    }


    /**
     * @Route("/{reportId}", methods={"GET"}, name="specific_report")
     * @param $courseId
     * @param $reportId
     */
    public function oneReport($reportId) {
        // TODO: Assert user has permissions to perform action
        // TODO: Handle Exceptions
        // Get Report
        $repository = $this->getDoctrine()->getRepository(Report::class);
        $report = $repository->find($reportId);
        $report->setSerializeIssues(true);

        // Construct Response
        $apiResponse = new ApiResponse();
        $apiResponse->setData($report);
        $jsonResponse = new JsonResponse($apiResponse);
        $jsonResponse->setEncodingOptions($jsonResponse->getEncodingOptions() | JSON_PRETTY_PRINT);
        return $jsonResponse;
    }

    /**
     * @Route("/{reportId}/pdf", methods={"GET"}, name="pdf_report")
     * @param $courseId
     * @param $reportId
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function pdfReport($courseId, $reportId) {
        // TODO: Assert user has permissions to perform action
        // TODO: Handle Exceptions
        return $this->render('course_api/index.html.twig', [
            'controller_name' => sprintf("Course (%s) PDF Reports: %s", $courseId, $reportId)
        ]);
    }
}