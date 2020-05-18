<?php 

namespace App\Message;

use App\Entity\Course;

class BackgroundQueueItem implements QueueItemInterface
{
    private $courseId;
    private $task;
    private $data;

    public function __construct(Course $course, $task, $data = [])
    {
        $this->courseId = $course->getId();
        $this->task = $task;
        $this->data = $data;
    }

    public function getCourseId()
    {
        return $this->courseId;
    }

    public function getTask()
    {
        return $this->task;
    }

    public function getData()
    {
        return $this->data;
    }
}