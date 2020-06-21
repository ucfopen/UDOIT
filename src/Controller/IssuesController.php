<?php


namespace App\Controller;


use App\Entity\Course;
use App\Entity\Issue;
use App\Entity\Report;
use App\Request\IssueRequest;
use App\Response\ApiResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\Serializer;

/**
 * Class IssuesController
 * @package App\Controller
 * @Route("/courses/{courseId}/issues")
 */
class IssuesController extends AbstractController
{
    // Routes
    /**
     * Gets new report of a course. Redirects the URL to the courses/{courseId}/reports/{reportId} endpoint.
     * @Route("/", methods={"GET"}, name="get_issues")
     * @param $courseId ID of requested course
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function getNewReport(Request $request, $courseId) {
        // TODO: Perform course scan here, return newly created report id
        $report = $this->getRandomReport($courseId); //TODO: Replace with actual report ID!!
        $params = ['request' => $request, 'courseId' => $courseId, 'reportId' => $report->getId()];
        return $this->redirectToRoute('get_report', $params);
    }

    /**
     * Gets a random existing report from a course. Only for development.
     * TODO: Remove as soon as we are ready to scan new courses.
     * @param $courseId
     * @return Report
     */
    private function getRandomReport($courseId) : Report {
        $repository = $this->getDoctrine()->getRepository(Course::class);
        $course = $repository->find($courseId);
        $reports = $course->getReports()->toArray();
        $randomNum = rand(0, sizeof($reports));
        return $reports[$randomNum];
    }

    /**
     * UFIXIT endpoint. Takes an array of updates for future changes in the course.
     * @Route("/{issueId}", methods={"PUT"}, name="put_issue")
     * @param $courseId
     * @param $issueId
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function fixIssue(Request $request, $courseId, $issueId) {
        $apiResponse = new ApiResponse();
        try {
            $requestBody = json_decode($request->getContent( ), true);
            $issueRequest = new IssueRequest($issueId, $requestBody["scanRuleId"], $requestBody["data"]);
            $repository = $this->getDoctrine()->getRepository(Issue::class);
            $issue = $repository->find($issueId);
            if(is_null($issue)) {
                throw new \Exception(sprintf("Issue with ID %s could not be found", $issueId));
            }
            $apiResponse->setData($issueRequest);
        }
        catch(\Exception $e) {
            // TODO: Handle Exception
        }

        // Format Response JSON
        $jsonResponse = new JsonResponse($apiResponse);
        $jsonResponse->setEncodingOptions($jsonResponse->getEncodingOptions() | JSON_PRETTY_PRINT);
        return $jsonResponse;
    }
}