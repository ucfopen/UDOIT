<?php

namespace App\Services;

use App\Entity\ContentItem;
use App\Entity\Course;
use App\Entity\FileItem;
use App\Entity\Issue;
use App\Entity\Report;
use App\Entity\User;
use App\Services\LmsApiService;
use App\Services\PhpAllyService;
use CidiLabs\PhpAlly\PhpAllyIssue;
use Doctrine\Persistence\ManagerRegistry;

class LmsFetchService {

    /** @var App\Services\LmsApiService $lmsApi */
    protected $lmsApi;

    /** @var PhpAllyService $phpAllyService */
    private $phpAlly;

    /** @var ManagerRegistry $doctrine */
    protected $doctrine;

    /** @var UtilityService $util */
    protected $util;

    public function __construct(
        LmsApiService $lmsApi,
        PhpAllyService $phpAlly,
        ManagerRegistry $doctrine,
        UtilityService $util
    )
    {
        $this->lmsApi = $lmsApi;
        $this->phpAlly = $phpAlly;
        $this->doctrine = $doctrine;
        $this->util = $util;
    }

    /**
     * Course Refresh has these steps:
     * 1) Update course structure
     * 2) Find any updated content
     * 3) Create new report
     * 4) Link unchanged issues to new report
     * 5) Process updated content
     * 
     * @param Course $course
     * @param User $user
     */
    public function refreshLmsContent(Course $course, User $user)
    {
        $hasContent = false;
        $lms = $this->lmsApi->getLms($user);

        /** @var \App\Repository\ContentItemRepository $contentItemRepo */
        $contentItemRepo = $this->doctrine->getManager()->getRepository(ContentItem::class);

        /** @var \App\Repository\FileItemRepository $fileItemRepo */
        $fileItemRepo = $this->doctrine->getManager()->getRepository(FileItem::class);

        /* Step 1: Update content
        /* Update course status */
        $lms->updateCourseData($course, $user);

        /* Mark content items as inactive */
        $contentItemRepo->setCourseContentInactive($course);
        $fileItemRepo->setCourseFileItemsInactive($course);
        $this->doctrine->getManager()->flush();

        /* Update content items from LMS */
        $lms->updateCourseContent($course, $user);

        /* Step 2: Get list of changed content items */
        $contentItems = $contentItemRepo->getUpdatedContentItems($course);

        /* Only continue if the new content needs to be scanned (not all files) */
        foreach ($contentItems as $contentItem) {
            if ($contentItem->getBody() != '') {
                $hasContent = true;
                break;
            }
        }

        if ($hasContent) {
            // /* Step 3: Create a new report */
            // $report = $this->createReport($course, $user);

            /* Step 4: Delete issues for updated content items */
            $this->deleteContentItemIssues($contentItems);

            /* Step 5: Process the updated content with PhpAlly and link to report */
            $this->scanContentItems($contentItems);

            /* Step 6: Create report from all active issues */
            $this->createReport($course, $user);

            /* Step 6: Cleanup. Remove inactive content items */
            //$contentItemRepo->removeInactiveContentItems();
        }

        /* Save last_updated date on course */
        $course->setLastUpdated($this->util->getCurrentTime());
        $course->setDirty(false);
        $this->doctrine->getManager()->flush();
    }

    /**
     * Refresh content item data from the LMS
     *
     * @param ContentItem $contentItem
     * @return void
     */
    public function refreshContentItemFromLms(ContentItem $contentItem)
    {
        $lms = $this->lmsApi->getLms();
        $lms->updateContentItem($contentItem);
        $this->doctrine->getManager()->flush();
    }

    /**
     * Create new report
     *
     * @param Course $course
     * @param User $user
     * @return Report
     */
    public function createReport(Course $course, User $user)
    {
        $contentFixed = $contentResolved = $filesReviewed = $errors = $suggestions = 0;
        $scanRules = [];

        /** @var \App\Entity\ContentItem[] $contentItems */
        $contentItems = $course->getContentItems();

        foreach ($contentItems as $contentItem) {
            /** @var \App\Entity\Issue[] $issues */
            $issues = $contentItem->getIssues()->toArray();

            foreach ($issues as $issue) {
                if (Issue::$issueStatusFixed === $issue->getStatus()) {
                    $contentFixed++;
                } else if (Issue::$issueStatusResolved === $issue->getStatus()) {
                    $contentResolved++;
                } else {
                    if (Issue::$issueError === $issue->getType()) {
                        $errors++;
                    } else {
                        $suggestions++;
                    }
                }

                /* Scan rule data */
                $ruleId = $issue->getScanRuleId();
                if (!isset($scanRules[$ruleId])) {
                    $scanRules[$ruleId] = 0;
                }

                $scanRules[$ruleId]++;
            }
        }

        /** @var \App\Entity\FileItem[] $fileItems */
        $fileItems = $course->getFileItems();
        foreach ($fileItems as $file) {
            if ($file->getReviewed()) {
                $filesReviewed++;
            }
        }

        $report = new Report();
        $report->setCreated($this->util->getCurrentTime());
        $report->setReady(false);
        $report->setCourse($course);
        $report->setErrors($errors);
        $report->setSuggestions($suggestions);
        $report->setContentFixed($contentFixed);
        $report->setContentResolved($contentResolved);
        $report->setFilesReviewed($filesReviewed);
        $report->setData(\json_encode(['scanRules' => $scanRules]));
        $report->setAuthor($user);

        $this->doctrine->getManager()->persist($report);
        $this->doctrine->getManager()->flush();

        return $report;
    }

    /**
     * Performs PHPAlly scan on each Content Item.
     * @param array $contentItems
     * @param Report $report
     */
    private function scanContentItems(array $contentItems)
    {
        // Scan each update content item for issues
        /** @var \App\Entity\ContentItem $contentItem */
        foreach ($contentItems as $contentItem) {
            // Scan Content Item with PHPAlly
            $phpAllyReport = $this->phpAlly->scanContentItem($contentItem);
            if ($phpAllyReport) {
                // Add Issues to report
                foreach ($phpAllyReport->getIssues() as $issue) {
                    // Create issue entity 
                    $this->createIssue($issue, $contentItem);
                }
            }
        }
        $this->doctrine->getManager()->flush();
    }

    public function createIssue(PhpAllyIssue $issue, ContentItem $contentItem)
    {
        $issueEntity = new Issue();

        $issueEntity->setType($issue->getType());
        $issueEntity->setStatus(Issue::$issueStatusActive);
        $issueEntity->setContentItem($contentItem);
        $issueEntity->setScanRuleId($issue->getRuleId());
        $issueEntity->setHtml($issue->getHtml());
        $issueEntity->setPreviewHtml($issue->getPreview());

        $contentItem->addIssue($issueEntity);

        $this->doctrine->getManager()->persist($issueEntity);

        return $issueEntity;
    }

    private function deleteContentItemIssues($contentItems)
    {
        /** @var \App\Repository\IssueRepository $issueRepo */
        $issueRepo = $this->doctrine->getManager()->getRepository(Issue::class);

        foreach ($contentItems as $contentItem) {
            $issueRepo->deleteContentItemIssues($contentItem);
        }
    }
}