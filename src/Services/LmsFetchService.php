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
use App\Services\EqualAccessService;
use App\Services\ScannerService;
use CidiLabs\PhpAlly\PhpAllyIssue;
use Doctrine\Persistence\ManagerRegistry;

use Symfony\Component\Console\Output\ConsoleOutput;
class LmsFetchService {

    /** @var App\Services\LmsApiService $lmsApi */
    protected $lmsApi;

    protected $lmsUser;

    /** @var PhpAllyService $phpAllyService */
    private $phpAlly;

    /** @var ScannerService $scannerService */
    private $scanner;

    /** @var EqualAccessService $equalAccessService */
    private $equalAccess;

    /** @var AsyncEqualAccessReport $asyncEqualAccessReport */
    private $asyncReport;

    /** @var ManagerRegistry $doctrine */
    protected $doctrine;

    /** @var UtilityService $util */
    protected $util;

    const ISSUE_TYPE_SUGGESTION = 'suggestion';
    const ISSUE_TYPE_ERROR = 'error';

    public function __construct(
        LmsApiService $lmsApi,
        LmsUserService $lmsUser,
        PhpAllyService $phpAlly,
        EqualAccessService $equalAccess,
        AsyncEqualAccessReport $asyncReport,
        ScannerService $scanner,
        ManagerRegistry $doctrine,
        UtilityService $util
    )
    {
        $this->lmsApi = $lmsApi;
        $this->lmsUser = $lmsUser;
        $this->phpAlly = $phpAlly;
        $this->scanner = $scanner;
        $this->equalAccess = $equalAccess;
        $this->asyncReport = $asyncReport;
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
     */
    public function refreshLmsContent(Course $course, User $user)
    {
        $printOutput = new ConsoleOutput();
        // $printOutput->writeln("enter");
        // return;

        $lms = $this->lmsApi->getLms($user);

        $this->lmsUser->validateApiKey($user);

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
        $lms->updateCourseContentNoSync($course, $user);

        /* Step 2: Get list of changed content items */
        $contentItems = $contentItemRepo->getUpdatedContentItems($course);
        $printOutput->writeln("FIRST number of content items: " . count($contentItems));

        /* Step 3: Delete issues for updated content items */
        $this->deleteContentItemIssues($contentItems);

        /* Step 4: Process the updated content with PhpAlly and link to report */

        $printOutput->writeln("ABOUT TO Scanning content items...");
        $this->scanContentItems($contentItems);

        /* Step 5: Update report from all active issues */
        $this->updateReport($course, $user);
        $printOutput->writeln("Updated number of content items: " . count($contentItems));


        /* Save last_updated date on course */
        $course->setLastUpdated($this->util->getCurrentTime());
        $course->setDirty(false);

        $this->doctrine->getManager()->flush();
    }

    // Refresh content item data from the LMS
    // public function refreshContentItemFromLms(ContentItem $contentItem): void
    // {
    //     $lms = $this->lmsApi->getLms();
    //     $lms->updateContentItem($contentItem);
    //     $this->doctrine->getManager()->flush();
    // }

    // Uses async calls to refresh content from the LMS
    public function asyncRefreshLmsContent(Course $course, User $user)
    {
        $printOutput = new ConsoleOutput();
        $printOutput->writeln("enter");

        $lms = $this->lmsApi->getLms($user);

        $this->lmsUser->validateApiKey($user);

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

        // BEGIN ASYNC CHANGES

        /* Update content items from LMS */
        $lms->updateCourseContent($course, $user, $this);

        // /* Step 2: Update report from all active issues */
        $this->updateReport($course, $user);

        // END ASYNC CHANGES

        /* Save last_updated date on course */
        $course->setLastUpdated($this->util->getCurrentTime());
        $course->setDirty(false);

        $this->doctrine->getManager()->flush();
    }

    // Update report, or create new one for a new day
    public function updateReport(Course $course, User $user): Report
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

        $latestReport = $course->getLatestReport();
        $now = $this->util->getCurrentTime();

        if ($latestReport && ($now->format('m/d/y') === $latestReport->getCreated()->format('m/d/y'))) {
            $report = $latestReport;
        }
        else {
            $report = new Report();
            $report->setAuthor($user);
            $report->setCourse($course);
            $this->doctrine->getManager()->persist($report);
        }

        $report->setCreated($now);
        $report->setReady(false);
        $report->setErrors($errors);
        $report->setSuggestions($suggestions);
        $report->setContentFixed($contentFixed);
        $report->setContentResolved($contentResolved);
        $report->setFilesReviewed($filesReviewed);
        $report->setData(\json_encode(['scanRules' => $scanRules]));

        $this->doctrine->getManager()->flush();

        return $report;
    }


    // Performs PHPAlly scan on each Content Item.
    public function scanContentItems(array $contentItems)
    {
        $printOutput = new ConsoleOutput();
        $printOutput->writeln("Scanning content items...");

        // $testLimit = 3; // Change this number as needed
        // if (count($contentItems) > $testLimit) {
        //     $printOutput->writeln("⚠️ TESTING MODE: Limiting scan to {$testLimit} items (out of " . count($contentItems) . " total)");
        //     $contentItems = array_slice($contentItems, 0, $testLimit);
        // }
        $printOutput->writeln("Number of content items now that its been CUT: " . count($contentItems));



        $printOutput->writeln("Scanning content items...");

        $scanner = $_ENV['ACCESSIBILITY_CHECKER'];
        $equalAccessReports = null;

        // If we're using Equal Access Lambda, send all the requests to Lambda for the
        // reports at once and save them all into an array (which should be in the same order as the ContentItems)
        if ($scanner == "equalaccess_lambda" && count($contentItems) > 0) {
            // $equalAccessReports = $this->asyncReport->postMultipleAsync($contentItems);
            $equalAccessReports = $this->asyncReport->postMultipleArrayAsync($contentItems);
        }

        // if ($scanner == "equalaccess_local" && count($contentItems) > 0) {
        //     $localService = new LocalApiAccessibilityService();
        //     $printOutput->writeln("Scanning content items with local service asyncronously...");
        //     $jsons = $localService->scanMultipleContentItemsAsync($contentItems);
        //     for ($i = 0; $i < count($jsons); $i++) {
        //         $json = $jsons[$i];
        //         $contentItem = $contentItems[$i];
        //         $document = $this->scanner->getDomDocument($contentItem->getBody());
        //         $report = $this->equalAccess->generateReport($json, $document);
        //         if ($report) {
        //             foreach ($report->getIssues() as $issue) {
        //                 // Create issue entity
        //                 $this->createIssue($issue, $contentItem);
        //             }
        //         }
        //     }
        //     $this->doctrine->getManager()->flush();
        //     return;
        // }

        // Scan each update content item for issues
        /** @var \App\Entity\ContentItem $contentItem */

        $index = 1;
        foreach ($contentItems as $contentItem) {
            $printOutput->writeln("index: " . $index);
            // $printOutput->writeln("Scanning: {$contentItem->getTitle()}");
            $index = $index + 1;

            try {
                // Scan the content item with the scanner set in the environment.
                $report = $this->scanner->scanContentItem($contentItem, $equalAccessReports == null ? null : $equalAccessReports[$index++], $this->util);
                $printOutput->writeln("Finished Scan");
                $printOutput->writeln($report ? "Scan completed successfully" : "No report generated");
                if ($report) {
                    // TODO: Do something with report errors
                    if (count($report->getErrors())) {
                        foreach ($report->getErrors() as $error) {
                            $msg = $error . ', item = #' . $contentItem->getId();
                            $this->util->createMessage($msg, 'error', $contentItem->getCourse(), null, true);
                        }
                    }

                    // Add Issues to report
                    foreach ($report->getIssues() as $issue) {
                        // Create issue entity
                        $this->createIssue($issue, $contentItem);
                    }
                }

                // $this->scanner->logToServer("done!");
            }
            catch (\Exception $e) {
                $this->util->createMessage($e->getMessage(), 'error', null, null, true);
            }
        }
        $this->doctrine->getManager()->flush();

        // $this->scanner->logToServer("done!!!!!!!!!\n");
    }

    // Performs PHPAlly scan on each Content Item.
    public function asyncScanContentItems(array $contentItems)
    {
        $printOutput = new ConsoleOutput();

        $scanner = $_ENV['ACCESSIBILITY_CHECKER'];
        $equalAccessReports = null;

        // If we're using Equal Access Lambda, send all the requests to Lambda for the
        // reports at once and save them all into an array (which should be in the same order as the ContentItems)
        if ($scanner == "equalaccess_lambda" && count($contentItems) > 0) {
            // $equalAccessReports = $this->asyncReport->postMultipleAsync($contentItems);
            $equalAccessReports = $this->asyncReport->postMultipleArrayAsync($contentItems);
        }

        // Scan each update content item for issues
        /** @var \App\Entity\ContentItem $contentItem */

        $index = 0;
        foreach ($contentItems as $contentItem) {

            try {
                // Scan the content item with the scanner set in the environment.
                $report = $this->scanner->scanContentItem($contentItem, $equalAccessReports == null ? null : $equalAccessReports[$index++], $this->util);
                $printOutput->writeln("Finished Scan");
                $printOutput->writeln($report);
                if ($report) {
                    // TODO: Do something with report errors
                    if (count($report->getErrors())) {
                        foreach ($report->getErrors() as $error) {
                            $msg = $error . ', item = #' . $contentItem->getId();
                            $this->util->createMessage($msg, 'error', $contentItem->getCourse(), null, true);
                        }
                    }

                    // Add Issues to report
                    foreach ($report->getIssues() as $issue) {
                        // Create issue entity
                        $this->createIssue($issue, $contentItem);
                        $this->doctrine->getManager()->flush();
                        $this->doctrine->getManager()->clear();


                    }
                }

                // $this->scanner->logToServer("done!");
            }
            catch (\Exception $e) {
                $this->util->createMessage($e->getMessage(), 'error', null, null, true);
            }
        }
        $this->doctrine->getManager()->flush();

        // $this->scanner->logToServer("done!!!!!!!!!\n");
    }

    public function createIssue(PhpAllyIssue $issue, ContentItem $contentItem)
    {
        $issueEntity = new Issue();
        $meta = $contentItem->getCourse()->getInstitution()->getMetadata();
        $issueType = self::ISSUE_TYPE_ERROR;

        if (isset($meta['SUGGESTION_RULES'])) {
            if (isset($meta['SUGGESTION_RULES'][$issue->getRuleId()])) {
                $issueType = self::ISSUE_TYPE_SUGGESTION;
            }
        }
        if (isset($_ENV['PHPALLY_SUGGESTION_RULES'])) {
            if (strpos($_ENV['PHPALLY_SUGGESTION_RULES'], $issue->getRuleId()) !== false) {
                $issueType = self::ISSUE_TYPE_SUGGESTION;
            }
        }

        $issueEntity->setType($issueType);
        $issueEntity->setStatus(Issue::$issueStatusActive);
        $issueEntity->setContentItem($contentItem);
        $issueEntity->setScanRuleId($issue->getRuleId());
        $issueEntity->setHtml($issue->getHtml());
        $issueEntity->setPreviewHtml($issue->getPreview());
        $issueEntity->setMetadata($issue->getMetadata());

        $contentItem->addIssue($issueEntity);

        $this->doctrine->getManager()->persist($issueEntity);

        return $issueEntity;
    }

    public function deleteContentItemIssues($contentItems)
    {
        /** @var \App\Repository\IssueRepository $issueRepo */
        $issueRepo = $this->doctrine->getManager()->getRepository(Issue::class);

        foreach ($contentItems as $contentItem) {
            $issueRepo->deleteContentItemIssues($contentItem);
        }
    }
}
