<?php

namespace App\Controller;

use App\Entity\Issue;
use App\Response\ApiResponse;
use App\Services\LmsPostService;
use App\Services\PhpAllyService;
use App\Services\UtilityService;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class IssuesController extends ApiController
{
    private ManagerRegistry $doctrine;

    public function __construct(ManagerRegistry $doctrine)
    {
        $this->doctrine = $doctrine;
    }

    // Save change to issue HTML to LMS
    #[Route('/api/issues/{issue}/save', name: 'save_issue')]
    public function saveIssue(
        Request $request,
        LmsPostService $lmsPost,
        UtilityService $util,
        Issue $issue)
    {
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

            // // Run fixed content through PhpAlly to validate it
            // $report = $phpAlly->scanHtml($newHtml, [$issue->getScanRuleId()]);
            // if ($issues = $report->getIssues()) {
            //     $apiResponse->addData('issues', $issues);
            //     $apiResponse->addData('failed', 1);
            //     throw new \Exception('form.error.fails_tests');
            // }
            // if ($errors = $report->getErrors()) {
            //     $apiResponse->addData('errors', $errors);
            //     $apiResponse->addData('failed', 1);
            //     throw new \Exception('form.error.fails_tests');
            // }


            // Update issue HTML
            $issue->setNewHtml($newHtml);
            $this->doctrine->getManager()->flush();

            // Save content to LMS
            $lmsPost->saveContentToLms($issue, $user);

            // Add messages to response
            $unreadMessages = $util->getUnreadMessages();
            if (empty($unreadMessages)) {
                $apiResponse->addMessage('form.msg.success_saved', 'success');

                // Update issue status
                $issue->setHtml($newHtml);
                $issue->setStatus(Issue::$issueStatusFixed);
                $issue->setFixedBy($user);
                $issue->setFixedOn($util->getCurrentTime());
                $this->doctrine->getManager()->flush();

                // Update report stats
                $report = $course->getUpdatedReport();

                $apiResponse->setData([
                    'issue' => ['status' => $issue->getStatus(), 'pending' => false],
                    'report' => $report,
                ]);
            }
            else {
                $apiResponse->addLogMessages($unreadMessages);
            }
        }
        catch(\Exception $e) {
            $apiResponse->addMessage($e->getMessage(), 'error');
        }

        return new JsonResponse($apiResponse);
    }

    // Mark issue as resolved/reviewed
    #[Route('/api/issues/{issue}/resolve', methods: ['POST','GET'], name: 'resolve_issue')]
    public function markAsReviewed(Request $request, LmsPostService $lmsPost, UtilityService $util, Issue $issue): JsonResponse
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

            $issue->setNewHtml($issueUpdate['newHtml']);
            $this->doctrine->getManager()->flush();

            // Save content to LMS
            $response = $lmsPost->saveContentToLms($issue, $user);

            // Add messages to response
            $unreadMessages = $util->getUnreadMessages();
            if (empty($unreadMessages)) {
                // Update issue
                $issue->setHtml($issueUpdate['newHtml']);
                $issue->setStatus(($issueUpdate['status']) ? Issue::$issueStatusResolved : Issue::$issueStatusActive);
                $issue->setFixedBy($user);
                $issue->setFixedOn($util->getCurrentTime());

                // Update report stats
                $report = $course->getUpdatedReport();

                $this->doctrine->getManager()->flush();

                if ($issue->getStatus() == Issue::$issueStatusResolved) {
                    $apiResponse->addMessage('form.msg.success_resolved', 'success');
                } else {
                    $apiResponse->addMessage('form.msg.success_unresolved', 'success');
                }

                $apiResponse->setData([
                    'issue' => ['status' => $issue->getStatus(), 'pending' => false],
                    'report' => $report
                ]);
            } else {
                $apiResponse->addLogMessages($unreadMessages);
            }
        } catch (\Exception $e) {
            $apiResponse->addError($e->getMessage());
        }

        return new JsonResponse($apiResponse);
    }

    // Rescan an issue in PhpAlly
    #[Route('/api/issues/{issue}/scan', name: 'scan_issue')]
    public function scanIssue(Issue $issue, PhpAllyService $phpAlly, UtilityService $util)
    {
        $apiResponse = new ApiResponse();

        $issueRule = 'CidiLabs\\PhpAlly\\Rule\\'.$issue->getScanRuleId();
        $report = $phpAlly->scanHtml($issue->getHtml(), [$issueRule], $issue->getContentItem()->getCourse()->getInstitution());

        $reportIssues = $report->getIssues();
        $reportErrors = $report->getErrors();

        if (empty($reportIssues) && empty($reportErrors)) {
            $issue->setStatus(Issue::$issueStatusFixed);
            $issue->setFixedBy($this->getUser());
            $issue->setFixedOn($util->getCurrentTime());

            // Update report stats
            $report = $issue->getContentItem()->getCourse()->getUpdatedReport();
            $apiResponse->setData([
                'issue' => ['status' => $issue->getStatus(), 'pending' => false],
                'report' => $report
            ]);

            $this->doctrine->getManager()->flush();
            $apiResponse->addMessage('form.msg.manually_fixed', 'success');
        }
        else {
            $apiResponse->addMessage('form.msg.not_fixed');
        }

        // Add messages to response
        $unreadMessages = $util->getUnreadMessages();
        if (!empty($unreadMessages)) {
            $apiResponse->addLogMessages($unreadMessages);
        }

        return new JsonResponse($apiResponse);
    }
}
