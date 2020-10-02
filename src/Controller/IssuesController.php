<?php

namespace App\Controller;

use App\Entity\Issue;
use App\Response\ApiResponse;
use App\Services\PhpAllyService;
use App\Services\UfixitService;
use App\Services\UtilityService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class IssuesController extends ApiController
{
    /**
     * UFIXIT endpoint. Takes an array of updates for future changes in the course.
     * 
     * @Route("/api/issues/{issue}/fix", methods={"POST","GET"}, name="fix_issue")
     * @param Issue $issue
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function fixIssue(Request $request, UfixitService $ufixit, PhpAllyService $phpAlly, UtilityService $util, Issue $issue) {
        $apiResponse = new ApiResponse();
        $user = $this->getUser();

        try {
            // Check if user has access to course
            $course = $issue->getContentItem()->getCourse();
            if(!$this->userHasCourseAccess($course)) {
                throw new \Exception("You do not have permission to access this issue.");
            }

            // Get fixed content
            //$fixedHtml = $request->request->get('html');
            // for testing
            $fixedHtml = $request->query->get('html');

            // Run fixed content through PhpAlly to validate it
            $report = $phpAlly->scanHtml($fixedHtml);
            if ($issues = $report->getIssues()) {
                $apiResponse->addData('issues', $issues);
            }
            if ($errors = $report->getErrors()) {
                $apiResponse->addData('errors', $errors);
            }

            if (!empty($issues) || !empty($errors)) {
                throw new \Exception('Updated content does not pass all UDOIT tests.');
            }

            // Save content to LMS
            $ufixit->saveContentToLms($issue, $fixedHtml);

            // Update issue
            $issue->setStatus(true);
            $issue->setFixedBy($user);
            $issue->setFixedOn($util->getCurrentTime());
            $this->getDoctrine()->getManager()->flush();

            // Create response
            $apiResponse->addMessage('Your fix has been saved.');
            $apiResponse->setData(['issue' => $issue]);
        }
        catch(\Exception $e) {
            $apiResponse->addError($e->getMessage());
        }

        // Format Response JSON
        $jsonResponse = new JsonResponse($apiResponse);
        $jsonResponse->setEncodingOptions($jsonResponse->getEncodingOptions() | JSON_PRETTY_PRINT);
        return $jsonResponse;
    }
}