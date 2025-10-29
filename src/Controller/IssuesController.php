<?php

namespace App\Controller;

use App\Entity\Issue;
use App\Response\ApiResponse;
use App\Services\LmsPostService;
use App\Services\EqualAccessService;
use App\Services\PhpAllyService;
use App\Services\UtilityService;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Console\Output\ConsoleOutput;

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
        $output = new ConsoleOutput();

        try {
            // Check if user has access to course
            $course = $issue->getContentItem()->getCourse();
            if(!$this->userHasCourseAccess($course)) {
                throw new \Exception("You do not have permission to access this issue.");
            }

            // Get updated issue
            $issueUpdate = \json_decode($request->getContent(), true);
            $sourceHtml = $issueUpdate['sourceHtml'];
            $newHtml = $issueUpdate['newHtml'];
            $fullPageHtml = $issueUpdate['fullPageHtml'];
            $xpath = $issueUpdate['xpath'];
            $markAsReviewed = $issueUpdate['markAsReviewed'];

            $reviewUpdated = false;
            $oldStatus = $issue->getStatus();
            if($markAsReviewed === false && ($oldStatus === 2 || $oldStatus === 3)) {
                $reviewUpdated = true;
            }
            if($markAsReviewed === true && ($oldStatus === 0 || $oldStatus === 1)) {
                $reviewUpdated = true;
            }

            $contentUpdated = true;
            // Check if new HTML is different from original HTML
            if ($newHtml !== '' && ($sourceHtml === $newHtml || $issue->getPreviewHtml() === $newHtml || $issue->getNewHtml() === $newHtml)) {
              $contentUpdated = false;
            }

            if(!$reviewUpdated && !$contentUpdated) {
                throw new \Exception('form.error.same_html');
            }

            $issue->setPreviewHtml($sourceHtml);
            $issue->setNewHtml($newHtml);
            $issue->setHtml($xpath);
            $this->doctrine->getManager()->flush();

            // Save content to LMS
            $lmsPost->saveContentToLms($issue, $user, $fullPageHtml);

            // Add messages to response
            $unreadMessages = $util->getUnreadMessages();
            if (empty($unreadMessages)) {
                $apiResponse->addMessage('form.msg.success_saved', 'success');

                // Update issue status
                // Note: If the review was updated, the content was, too, by adding the reviewed class.
                // So if "mark as reviewed" is UNchecked, we can't know if the content was otherwise fixed.
                // We will assume it was, since a human has definitely looked at it.
                $newStatus = Issue::$issueStatusActive;
                if($reviewUpdated && $markAsReviewed) {
                    if($issue->getStatus() === Issue::$issueStatusFixed) {
                        $newStatus = Issue::$issueStatusFixedAndResolved;
                    } else if($issue->getStatus() === Issue::$issueStatusActive) {
                        $newStatus = Issue::$issueStatusResolved;
                    }
                } else if ($reviewUpdated && !$markAsReviewed) {
                    $newStatus = Issue::$issueStatusFixed;
                } else if ($contentUpdated) {
                    $newStatus = Issue::$issueStatusFixed;
                }

                $issue->setStatus($newStatus);
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

        $contentItem = $issue->getContentItem();
        if ($contentItem->getContentType() == "quiz_question") {
          $apiResponse->addMessage('msg.sync.quiz_question', 'alert');
        }

        return new JsonResponse($apiResponse);
    }

    // Rescan an issue in PhpAlly
    // TODO: implement equal access into this
    #[Route('/api/issues/{issue}/scan', name: 'scan_issue')]
    public function scanIssue(Issue $issue, PhpAllyService $phpAlly, UtilityService $util, EqualAccessService $equalAccess)
    {
        $apiResponse = new ApiResponse();

        $issueRule = 'CidiLabs\\PhpAlly\\Rule\\'.$issue->getScanRuleId();
        $report = $phpAlly->scanHtml($issue->getHtml(), [$issueRule], $issue->getContentItem()->getCourse()->getInstitution());
        // $equalAccess->logToServer("scanIssue in issuescontroller");

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

    // Get an issue's corresponding content item
    #[Route('/api/issues/{issue}/content', methods: ['GET'], name: 'get_issue_content')]
    public function getIssueContent(Issue $issue)
    {

      $apiResponse = new ApiResponse();
      $contentItem = $issue->getContentItem();

      try {
        $apiResponse->setData([
            'contentItem' => [
                'id' => $contentItem->getId(),
                'title' => $contentItem->getTitle(),
                'contentType' => $contentItem->getContentType(),
                'url' => $contentItem->getUrl(),
                'body' => $contentItem->getBody(),
            ]
        ]);
      } catch (\Exception $e) {
        $apiResponse->addError($e->getMessage());
      }

      return new JsonResponse($apiResponse);
    }
}
