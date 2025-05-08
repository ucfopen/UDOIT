<?php
namespace App\Message;

class FullRescanMessage implements QueueItemInterface
{
    private int $courseId;
    private int $userId;

    public function __construct(int $courseId, int $userId)
    {
        $this->courseId = $courseId;
        $this->userId = $userId;
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
        // Return a task identifier that QueueItemHandler can switch on.
        return 'refreshContent';
    }

    public function getData()
    {
        // If you need to pass additional parameters, include them here.
        return ['courseId' => $this->courseId];
    }
}
