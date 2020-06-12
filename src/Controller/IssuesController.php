<?php


namespace App\Controller;


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
     * Creates report and redirects route to GET report
     * @Route("/", methods={"GET"}, name="get_issues")
     * @param $courseId ID of requested course
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function getNewReport(Request $request, $courseId) {
        // TODO: Perform course scan here, return newly created report id
        $reportId = 1;
        $params = ['request' => $request, 'courseId' => $courseId, 'reportId' => $reportId];
        return $this->redirectToRoute('get_report', $params);
    }

    /**
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

            //TODO: Fix Issue here
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