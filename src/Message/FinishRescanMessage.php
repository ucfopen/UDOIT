<?php
namespace App\Message;

/**
 * Published once – after the last ScanContentItem message finishes – so that
 * a single worker can aggregate the results and mark the report “ready”.
 */
final class FinishRescanMessage
{
    public function __construct(
        private int $courseId,
        private int $userId,
        private string $batchId
    ) {}

    public function getCourseId(): int { return $this->courseId; }
    public function getUserId(): int   { return $this->userId;   }
    public function getBatchId(): string { return $this->batchId;  }
}
