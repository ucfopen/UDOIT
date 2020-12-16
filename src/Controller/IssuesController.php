<?php

namespace App\Controller;

use App\Entity\Course;
use App\Entity\Issue;
use App\Entity\Report;
use App\Response\ApiResponse;
use App\Services\LmsPostService;
use App\Services\PhpAllyService;
use App\Services\UfixitService;
use App\Services\UtilityService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class IssuesController extends ApiController
{
    /**
     * Save change to issue HTML to LMS
     * 
     * @Route("/api/issues/{issue}/save", name="save_issue")
     * @param Issue $issue
     */
    public function saveIssue(Request $request, LmsPostService $lmsPost, PhpAllyService $phpAlly, UtilityService $util, Issue $issue) {
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
            $lmsPost->saveContentToLms($issue, $newHtml);
            // TODO: check lmsResponse for errors

            // Update issue
            $issue->setStatus(Issue::$issueStatusFixed);
            $issue->setFixedBy($user);
            $issue->setFixedOn($util->getCurrentTime());
            $issue->setNewHtml($newHtml);

            // Update report stats
            $report = $course->getUpdatedReport();
            
            $this->getDoctrine()->getManager()->flush();

            // Create response
            $apiResponse->addMessage('form.msg.success_saved', 'success');
            $apiResponse->addLogMessages($util->getUnreadMessages());
            $apiResponse->setData([
                'issue' => ['status' => $issue->getStatus(), 'pending' => false],
                'report' => $report,
            ]);
        }
        catch(\Exception $e) {
            $apiResponse->addMessage($e->getMessage(), 'error');
        }

        return new JsonResponse($apiResponse);
    }

    /**
     * Mark issue as resolved/reviewed
     * 
     * @Route("/api/issues/{issue}/resolve", methods={"POST","GET"}, name="fix_issue")
     * @param Issue $issue
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function markAsReviewed(Request $request, LmsPostService $lmsPost, UtilityService $util, Issue $issue)
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

            // Save content to LMS
            $lmsPost->saveContentToLms($issue, $issueUpdate['newHtml']);
            // TODO: check lmsResponse for errors

            // Update issue
            $issue->setFixedBy($user);
            $issue->setFixedOn($util->getCurrentTime());

            // Update report stats
            $report = $course->getUpdatedReport();

            $this->getDoctrine()->getManager()->flush();

            // Create response
            if ($issue->getStatus() === Issue::$issueStatusResolved) {
                $apiResponse->addMessage('form.msg.success_resolved', 'success');
            }
            else {
                $apiResponse->addMessage('form.msg.success_unresolved', 'success');
            }
            $apiResponse->addLogMessages($util->getUnreadMessages());
            $apiResponse->setData([
                'issue' => ['status' => $issue->getStatus(), 'pending' => false],
                'report' => $report
            ]);
        } catch (\Exception $e) {
            $apiResponse->addError($e->getMessage());
        }

        return new JsonResponse($apiResponse);
    }
}
