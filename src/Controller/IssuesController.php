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
     * @Route("/api/issues/{issue}/save", name="save_issue")
     * @param Issue $issue
     */
    public function saveIssue(Request $request, UfixitService $ufixit, PhpAllyService $phpAlly, UtilityService $util, Issue $issue) {
        $apiResponse = new ApiResponse();
        $user = $this->getUser();

        try {
            // Check if user has access to course
            $course = $issue->getContentItem()->getCourse();
            if(!$this->userHasCourseAccess($course)) {
                throw new \Exception("You do not have permission to access this issue.");
            }

            // Get updated issue
            $newHtml = $request->getContent();
            
            // Check if new HTML is different from original HTML
            if ($issue->getHtml() === $newHtml) {
                throw new \Exception('form.error.same_html');
            }

            // Run fixed content through PhpAlly to validate it
            $report = $phpAlly->scanHtml($newHtml);
            if ($issues = $report->getIssues()) {
                $apiResponse->addData('issues', $issues);
            }
            if ($errors = $report->getErrors()) {
                $apiResponse->addData('errors', $errors);
            }

            if (!empty($issues) || !empty($errors)) {
                throw new \Exception('form.error.fails_tests');
            }

            // Save content to LMS
            $lmsResponse = $ufixit->saveContentToLms($issue, $newHtml);

            // Update issue
            $issue->setStatus(Issue::$issueStatusFixed);
            $issue->setFixedBy($user);
            $issue->setFixedOn($util->getCurrentTime());
            $issue->setNewHtml($newHtml);
            $this->getDoctrine()->getManager()->flush();

            // Create response
            $apiResponse->addMessage('form.msg.success_saved', 'success');
            $apiResponse->setData(['status' => $issue->getStatus(), 'pending' => false]);
        }
        catch(\Exception $e) {
            $apiResponse->addError($e->getMessage());
        }

        // Format Response JSON
        $jsonResponse = new JsonResponse($apiResponse);
        $jsonResponse->setEncodingOptions($jsonResponse->getEncodingOptions() | JSON_PRETTY_PRINT);
        return $jsonResponse;
    }

    /**
     * Mark issue as resolved/reviewed
     * 
     * @Route("/api/issues/{issue}/resolve", methods={"POST","GET"}, name="fix_issue")
     * @param Issue $issue
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function markAsReviewed(Request $request, UfixitService $ufixit, PhpAllyService $phpAlly, UtilityService $util, Issue $issue)
    {
        $apiResponse = new ApiResponse();
        $user = $this->getUser();

        try {
            // Check if user has access to course
            $course = $issue->getContentItem()->getCourse();
            if (!$this->userHasCourseAccess($course)) {
                throw new \Exception("You do not have permission to access this issue.");
            }

            // Get updated issue
            $issueUpdate = \json_decode($request->getContent(), true);
            $issue->setStatus(($issueUpdate['status']) ? Issue::$issueStatusResolved : Issue::$issueStatusActive);

            // Update HTML with data-udoit attribute
            //$newHtml = $this->getResolvedHtml($issue);

            // Save content to LMS
            $ufixit->saveContentToLms($issue, $issueUpdate['newHtml']);

            // Update issue
            $issue->setStatus(Issue::$issueStatusResolved);
            $issue->setFixedBy($user);
            $issue->setFixedOn($util->getCurrentTime());
            //$this->getDoctrine()->getManager()->flush();

            // Create response
            $apiResponse->addMessage('form.msg.success_resolved', 'success');
            $apiResponse->setData(['status' => $issue->getStatus(), 'pending' => false]);
        } catch (\Exception $e) {
            $apiResponse->addError($e->getMessage());
        }

        // Format Response JSON
        $jsonResponse = new JsonResponse($apiResponse);
        $jsonResponse->setEncodingOptions($jsonResponse->getEncodingOptions() | JSON_PRETTY_PRINT);
        return $jsonResponse;
    }

    protected function getResolvedHtml(Issue $issue)
    {
        return $issue->getHtml();
    }
}