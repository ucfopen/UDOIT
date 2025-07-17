<?php
namespace App\Message;

class FullRescanMessage
{
    private int $courseId;
    private int $userId;
    private string $apiKey;
    private string $lmsId;
    private string $lmsDomain;
    private string $batchId;
    private bool $force = false;

    public function __construct(
        int $courseId,
        int $userId,
        string $apiKey,
        string $lmsId,
        string $lmsDomain,
        string $batchId,
        bool $force = false
    ) {
        $this->courseId = $courseId;
        $this->userId = $userId;
        $this->apiKey = $apiKey;
        $this->lmsId = $lmsId;
        $this->lmsDomain = $lmsDomain;
        $this->batchId = $batchId;
        $this->force = $force;
    }

    public function getApiKey(): string { return $this->apiKey; }
    public function getLmsId(): string { return $this->lmsId; }
    public function getLmsDomain(): string { return $this->lmsDomain; }
    public function getCourseId() { return $this->courseId; }
    public function getUserId() { return $this->userId; }
    public function getBatchId(): string { return $this->batchId; }
    public function isForce(): bool { return $this->force; }
}
