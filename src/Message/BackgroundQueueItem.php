<?php 

namespace App\Message;

use App\Entity\Course;
use App\Entity\User;

class BackgroundQueueItem implements QueueItemInterface
{
    private $courseId;
    private $userId;
    private $task;
    private $data;

    public function __construct(Course $course, User $user, $task, $data = [])
    {
        $this->courseId = $course->getId();
        $this->userId = $user->getId();
        $this->task = $task;
        $this->data = $data;
    }

    public function getCourseId()
    {
        return $this->courseId;
    }

    public function getUserId() 
    {
        return $this->userId;
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