<?php


namespace App\Controller;


use App\Entity\Report;
use App\Response\ApiResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Class IssuesController
 * @package App\Controller
 * @Route("/courses/{courseId}/issues")
 */
class IssuesController extends AbstractController
{
    /**
     * @Route("/", methods={"GET"}, name="one_course")
     * @param $courseId ID of requested course
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function getNewReport($courseId) {
        // TODO: Assert user has permissions to perform action
        // TODO: Perform course scan here, return newly created report id
        // TODO: Handle Exceptions
        $reportId = 1;

        // Get Report
        $repository = $this->getDoctrine()->getRepository(Report::class);
        $report = $repository->find($reportId);

        // Construct API Response
        $apiResponse = new ApiResponse();
        $apiResponse->setData($report);
        $jsonResponse = new JsonResponse($apiResponse);
        $jsonResponse->setEncodingOptions($jsonResponse->getEncodingOptions() | JSON_PRETTY_PRINT);

        return $jsonResponse;
    }

    /**
     * @Route("/{issueId}", methods={"GET"}, name="fix_issue")
     * FIXME: Change method to "PUT" when implementing
     * @param $courseId
     * @param $issueId
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function fixIssue($courseId, $issueId) {
        // TODO: Assert user has permissions to perform action
        // TODO: Handle Exceptions
        return $this->render('course_api/index.html.twig', [
            'controller_name' => sprintf("Course (%s) Issues: (%s)", $courseId, $issueId)
        ]);
    }



}