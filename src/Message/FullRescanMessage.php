<?php

namespace App\Message;

use App\Message\QueueItemInterface;

final class FullRescanMessage implements QueueItemInterface
{
    private int $courseId;
    private int $userId;

    public function __construct(int $courseId, int $userId)
    {
        $this->courseId = $courseId;
        $this->userId = $userId;
    }

    public function getCourseId(): int
    {
        return $this->courseId;
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function getTask(): string
    {
        return 'fullRescan';
    }

    public function getData(): array
    {
        return ['courseId' => $this->courseId];
    }
}
