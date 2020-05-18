<?php

namespace App\MessageHandler;

use App\Entity\Course;
use App\Entity\Report;
use App\Message\QueueItemInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Messenger\Handler\MessageHandlerInterface;

class QueueItemHandler implements MessageHandlerInterface
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
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

        // get content via LMS content API, filtering 
        $this->getUpdatedLmsContent($report);

        // continue if report has content to scan

        // get additional content for each content item

        // run PhpAlly on content
        
        // clear out old issues for a content item

        // create new issues for a content item

        // save report to DB

        // mark course as clean
    }

    protected function getUpdatedLmsContent(Report $report)
    {
        $lmsContent = [];

        // use LMS API to get all content for this course

        // filter out any content that was updated older than the course 'last_updated'

        // find contentItems that match LMS content

        // create new contentItems for new content

        // mark contentItems as inactive if they don't show up in the LMS content

        // add contentItems to report
    }


}