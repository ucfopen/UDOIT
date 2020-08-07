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
class IssuesController extends ApiController
{
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
//            // Check if user has access to course FIXME: Uncomment when front end is handling auth
//            if(!$this->userHasCourseAccess($courseId)) {
//                throw new \Exception("You do not have permission to access the specified course.");
//            }

            // Get Request Info
            $requestBody = json_decode($request->getContent( ), true);
            $issueRequest = new IssueRequest($issueId, $requestBody["scanRuleId"], $requestBody["data"]);

            // Get Issue
            $repository = $this->getDoctrine()->getRepository(Issue::class);
            $issue = $repository->find($issueId);

            // Check if Issue exists
            if(is_null($issue)) {
                throw new \Exception(sprintf("Issue with ID %s could not be found", $issueId));
            }

            // TODO: Make fix here

            $apiResponse->setData($issueRequest);
        }
        catch(\Exception $e) {
            $apiResponse->setData($e->getMessage());
        }

        // Format Response JSON
        $jsonResponse = new JsonResponse($apiResponse);
        $jsonResponse->setEncodingOptions($jsonResponse->getEncodingOptions() | JSON_PRETTY_PRINT);
        return $jsonResponse;
    }
}