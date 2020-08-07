<?php

namespace App\MessageHandler;

use App\Entity\ContentItem;
use App\Entity\Course;
use App\Entity\Issue;
use App\Entity\Report;
use App\Message\QueueItemInterface;
use App\Services\UtilityService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Messenger\Handler\MessageHandlerInterface;

class QueueItemHandler implements MessageHandlerInterface
{
    /** @var EntityManagerInterface $entityManager */
    private $entityManager;

    /** @var UtilityService $util */
    private $util;

    public function __construct(EntityManagerInterface $entityManager, UtilityService $util)
    {
        $this->entityManager = $entityManager;
        $this->util = $util;
    }

    public function __invoke(QueueItemInterface $item)
    {
        $task = $item->getTask();

        $courseId = $item->getCourseId();
        $courseRepository = $this->entityManager->getRepository(Course::class);  
        $course = $courseRepository->find($courseId);

        switch ($task) {
            case 'refreshContent':
                $this->refreshLmsContent($course);
        }
    }

    /**
     * Processes each updated content item
     * If there are updated items, a new report is created and persisted to DB
     * @param Course $course
     */
    public function refreshLmsContent(Course $course)
    {
        // Get new content
        $contentItems = $this->getUpdatedLmsContent($course);

        // Check if there is new content to scan
        if (!empty($contentItems)) {
            // Create New Report
            $report = new Report();
            $report->setCreated(new \DateTime());
            $report->setReady(false);
            $report->setCourse($course);
            $report->setErrors(0);
            $report->setSuggestions(0);

            // Scan Content Items with PHP Ally and associate new issues/suggestions.
            $this->scanContentItems($contentItems, $report);


            // Set Report as Ready and update.
            $report->setReady(true);
            $this->entityManager->persist($report);
            $this->entityManager->flush();
        }

        // Mark course as clean and set last_updated
        $course->setLastUpdated(new \DateTime());
        $course->setDirty(false);
        $this->entityManager->persist($course);
        $this->entityManager->flush();
    }

    /**
     * Uses the LMS's API to query Course Content.
     * Then updates/creates new Entity records and returns all newly created/updated Content.
     * @param Course $course
     * @return ContentItem[]|void
     */
    protected function getUpdatedLmsContent(Course $course)
    {
        // mark all contentItems as inactive.
        /** @var ContentItemRepository $contentItemRepo */
        $contentItemRepo = $this->entityManager->getRepository(ContentItem::class);
        $contentItemRepo->setCourseContentInactive($course);

        // use LMS API to get all content for this course
        // we mark content as active when it's updated.
        $lms = $this->util->getLms();

        /** @var ContentItem[] $lmsContent */
        $contentItems = $lms->getCourseContent($course);

        $courseLastUpdated = $course->getLastUpdated();

        // filter out any content that was updated older than the course 'last_updated'
        foreach ($contentItems as $ind => $contentItem) {
            // Unset unchanged content items
            if ($contentItem->getUpdated() < $courseLastUpdated) {
                unset($contentItems[$ind]);
            }
        }

        $this->entityManager->flush();

        return $contentItems;
    }

    /**
     * Performs PHPAlly scan on each Content Item.
     * @param array $contentItems
     * @param Report $report
     */
    private function scanContentItems(array $contentItems, Report $report) {
        $issueRepo = $this->entityManager->getRepository('App:Issue');
        // Scan each update content item for issues
        foreach ($contentItems as $contentItem) {
            // Set all previous Issues to Inactive
            $issueRepo->setContentItemIssuesInactive($contentItem);

            // Scan Content Item with PHPAlly
            $newIssues = $this->generateDummyIssues(10);

            // Add Issues to ContentItem
            $this->addIssues($newIssues, $contentItem, $report);

            // Save Report. Note: Report will persist after each content item sync for real-time updates on front-end.
            $this->entityManager->persist($report);
            $this->entityManager->flush();
        }
    }

    /**
     * Adds genereated issues to its Content Item and Report
     * @param array $issues
     * @param ContentItem $contentItem
     * @param Report $report
     */
    private function addIssues(array $issues, ContentItem $contentItem, Report $report) {
        $errorCount = $report->getErrors();
        $suggestionCount = $report->getSuggestions();
        foreach ($issues as $issue) {
            $newIssueType = $issue->getType();

            // Add to Error Suggestion Count
            if ($newIssueType == "error") {
                $errorCount++;
            }
            elseif ($newIssueType == "suggestion") {
                $suggestionCount++;
            }

            // Set Entity Data
            $issue->setContentItem($contentItem);
            $report->addIssue($issue);
            $this->entityManager->persist($issue);
        }
        // Add Errors
        $report->setErrors($errorCount);
        $report->setSuggestions($suggestionCount);
    }

    // FIXME: Remove this when PHPAlly is connection
    private function generateDummyIssues($num) {
        $issues = [];
        for($i = 0; $i < $num; $i++) {
            $issue = new Issue();
            $issue->setType(($i % 2) ? "error" : "suggestion");
            $issue->setStatus(true);
            $issue->setScanRuleId(rand(1,10));
            $issue->setHtml('<p>This is a dummy issue.</p>');
            $issues[] = $issue;
        }
        return $issues;
    }
}