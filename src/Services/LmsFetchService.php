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
    public function refreshLmsContent(Course $course, User $user, $force = false)
    {
        try {
            $output = new ConsoleOutput();
            $output->writeln("Refreshing LMS content. \$force value: " . var_export($force, true));
            $lms = $this->lmsApi->getLms($user);

            $this->lmsUser->validateApiKey($user);

            /** @var \App\Repository\ContentItemRepository $contentItemRepo */
            $contentItemRepo = $this->doctrine->getManager()->getRepository(ContentItem::class);

            /** @var \App\Repository\FileItemRepository $fileItemRepo */
            $fileItemRepo = $this->doctrine->getManager()->getRepository(FileItem::class);

            /* Step 1: Update content
            /* Update course status */
            $lms->updateCourseData($course, $user);

            /* Step 2: Get list of updated content items */
            /* 2.1: Mark all existing content items and files in our database as inactive */
            $contentItemRepo->setCourseContentInactive($course);
            $fileItemRepo->setCourseFileItemsInactive($course);
            $this->doctrine->getManager()->flush();

            /* Update content items from LMS.
              1. ContentItems that are in our database but no longer in the LMS remain 'inactive' and are not scanned.
              2. ContentItems that are in our database but older than the LMS's versions are re-downloaded.
              3. ContentItems that are in the LMS but not in our database are added to our database.
            */
            $contentItems = $lms->updateCourseContent($course, $user, $force);
            $output->writeln("Found " . count($contentItems) . " updated content items in the LMS.");

            /* Step 3: Delete issues for updated content items */
            $this->deleteContentItemIssues($contentItems);

            $output->writeln("Scanning content items now...");
            /* Step 4: Process the updated content with PhpAlly and link to report */
            $this->scanContentItems($contentItems);

            $output->writeln("Updating report now...");
            /* Step 5: Update report from all active issues */
            $this->updateReport($course, $user, count($contentItems));

            /* Save last_updated date on course */
            $course->setLastUpdated($this->util->getCurrentTime());
            $course->setDirty(false);

            $this->doctrine->getManager()->flush();
        }
        catch (\Exception $e) {
            throw $e; // Rethrow the exception to be caught by the controller
        }
    }

    public function fullRefreshLmsContent(Course $course, User $user, $force = false)
    {
        try {
            $output = new ConsoleOutput();
            $output->writeln("Refreshing LMS content. \$force value: " . var_export($force, true));
            $lms = $this->lmsApi->getLms($user);

            $this->lmsUser->validateApiKey($user);

            /** @var \App\Repository\ContentItemRepository $contentItemRepo */
            $contentItemRepo = $this->doctrine->getManager()->getRepository(ContentItem::class);

            /** @var \App\Repository\FileItemRepository $fileItemRepo */
            $fileItemRepo = $this->doctrine->getManager()->getRepository(FileItem::class);

            /* Step 1: Update content
            /* Update course status */
            $lms->updateCourseData($course, $user);

            /* Step 2: Get list of updated content items */
            /* 2.1: Mark all existing content items and files in our database as inactive */
            $contentItemRepo->setCourseContentInactive($course);
            $fileItemRepo->setCourseFileItemsInactive($course);
            $this->doctrine->getManager()->flush();

            /* Update content items from LMS.
              1. ContentItems that are in our database but no longer in the LMS remain 'inactive' and are not scanned.
              2. ContentItems that are in our database but older than the LMS's versions are re-downloaded.
              3. ContentItems that are in the LMS but not in our database are added to our database.
            */
            $contentItems = $lms->updateCourseContent($course, $user, $force);
            $output->writeln("Found " . count($contentItems) . " updated content items in the LMS.");

            // If this is a full rescan, skip the sync scan/report;
            // async ScanContentItemHandler + FinishRescanHandler will do that.
            if ($force) {
                // We still need to mark the course lastUpdated and dirty flag:
                $course->setLastUpdated($this->util->getCurrentTime());
                $course->setDirty(false);
                $this->doctrine->getManager()->flush();
                return $contentItems;
            }
        }
        catch (\Exception $e) {
            throw $e; // Rethrow the exception to be caught by the controller
        }
    }


    public function getCourseSections(Course $course, User $user)
    {
        $lms = $this->lmsApi->getLms($user);
        return $lms->getCourseSections($course, $user);
    }

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
    public function updateReport(Course $course, User $user, $itemsScannedCount): Report
    {
        $contentFixed = $contentResolved = $filesReviewed = $errors = $potentials = $suggestions = 0;
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
                    } else if (Issue::$issuePotential === $issue->getType()) {
                        $potentials++;
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

        $scanCounts = (object) [
          'errors' => $errors,
          'potentials' => $potentials,
          'suggestions' => $suggestions,
        ];

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
        $report->setData(\json_encode([
          'scanRules' => $scanRules,
          'scanCounts' => $scanCounts,
          'itemsScanned' => $itemsScannedCount,
          'versionNumber' => !empty($_ENV['VERSION_NUMBER']) ? $_ENV['VERSION_NUMBER'] : ''
        ]));

        $this->doctrine->getManager()->flush();

        return $report;
    }


    // Performs PHPAlly scan on each Content Item.
    private function scanContentItems(array $contentItems)
    {
        $scanner = $_ENV['ACCESSIBILITY_CHECKER'];
        $equalAccessReports = null;

        // $scanner = 'equalaccess_local';

        // If we're using Equal Access Lambda, send all the requests to Lambda for the
        // reports at once and save them all into an array (which should be in the same order as the ContentItems)
        if ($scanner == "equalaccess_lambda" && count($contentItems) > 0) {
            $equalAccessReports = $this->asyncReport->postMultipleArrayAsync($contentItems);
        }

        // Scan each update content item for issues
        /** @var \App\Entity\ContentItem $contentItem */

        $index = 0;
        foreach ($contentItems as $contentItem) {
            if($contentItem->getBody() == null) {
              continue; // Skip content items that have no body
            }

            try {
                // Scan the content item with the scanner set in the environment.
                $report = $this->scanner->scanContentItem($contentItem, $equalAccessReports == null ? null : $equalAccessReports[$index++], $this->util);

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
                        if(isset($issue->isGeneric)) {
                          $this->createGenericIssue($issue, $contentItem);
                        }
                        else {
                          $this->createIssue($issue, $contentItem);
                        }
                    }
                }
            }
            catch (\Exception $e) {
                $this->util->createMessage($e->getMessage(), 'error', null, null, true);
                throw $e; // Rethrow the exception to be caught by the controller
            }
        }
        $this->doctrine->getManager()->flush();
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

        $scanner = $_ENV['ACCESSIBILITY_CHECKER'];
        if ($scanner == 'equalaccess_lambda' || $scanner == 'equalaccess_local') {
          $issueType = $this->equalAccess->getIssueType($issue->getMetadata());
          if($issueType == 'pass') {
            // If the issue is a pass, we don't create an issue for it
            return null;
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

    public function createGenericIssue($issue, ContentItem $contentItem)
    {
        $issueEntity = new Issue();
        $meta = $contentItem->getCourse()->getInstitution()->getMetadata();
        $issueType = self::ISSUE_TYPE_ERROR;

        $scanner = $_ENV['ACCESSIBILITY_CHECKER'];
        if ($scanner == 'equalaccess_lambda' || $scanner == 'equalaccess_local') {
          $issueType = $this->equalAccess->getIssueType($issue->metadata);
        }

        $issueEntity->setType($issueType);
        $issueEntity->setStatus(Issue::$issueStatusActive);
        $issueEntity->setContentItem($contentItem);
        $issueEntity->setScanRuleId($issue->scanRuleId);
        $issueEntity->setHtml($issue->xpath);
        $issueEntity->setPreviewHtml('');
        $issueEntity->setMetadata($issue->metadata);

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
