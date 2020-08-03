<?php

namespace App\MessageHandler;

use App\Entity\ContentItem;
use App\Entity\Course;
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

    protected function refreshLmsContent(Course $course)
    {
        // create new Report entity
        $report = new Report();
        $report->setCourse($course);
        $report->setCreated(new \DateTime('now'));
        $report->setReady(false);
        
        $this->entityManager->persist($report);
        $this->entityManager->flush();

        // get content via LMS content API
        $contentItems = $this->getUpdatedLmsContent($report);
//        $contentItems = $course->getContentItems(); // FIXME: REMOVE AND USE PREVIOUS LINE

        // continue if report has content to scan
        foreach ($contentItems as $contentItem) {
            // get additional content for each content item

            // clear out old issues for a content item
             $contentItem->clearIssues();

            // run PhpAlly on content

            // create new issues for a content item
            foreach ($contentItem->getIssues() as $issue) {
                $report->addIssue($issue);
            }
        }

        // save report to DB
        $report->setReady(true);
        $this->entityManager->persist($report);
        $this->entityManager->flush();

        // mark course as clean
        $course->setLastUpdated(new \DateTime());
        $course->setDirty(false);
        $this->entityManager->persist($course);
        $this->entityManager->flush();
    }

    protected function getUpdatedLmsContent(Report $report)
    {
        $oldContentItems = [];
        $updatedContentItems = [];
        $course = $report->getCourse();

        // mark all contentItems as inactive.
        /** @var ContentItemRepository $contentItemRepo */
        $contentItemRepo = $this->entityManager->getRepository(ContentItem::class);
        $contentItemRepo->setCourseContentInactive($course);

        // use LMS API to get all content for this course
        // we mark content as active when it's updated.
        $lms = $this->util->getLms();
        
        /** @var ContentItem[] $lmsContent */
        $contentItems = $lms->getCourseContent($course);

        // filter out any content that was updated older than the course 'last_updated'
        foreach ($contentItems as $ind => $contentItem) {
            
            // skip content that hasn't been updated since last check
            if ($contentItem->getUpdated() < $course->getLastUpdated()) {
                foreach ($contentItem->getIssues() as $issue) {
                    $issue->addReport($report);
                }
                
                unset($contentItems[$ind]);
            }
        }

        $this->entityManager->flush();

        return $contentItems;
    }


}