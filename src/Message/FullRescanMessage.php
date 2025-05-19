<?php
namespace App\Message;

class FullRescanMessage
{
    private int $courseId;
    private int $userId;
    private string $apiKey;
    private string $lmsId;
    private string $lmsDomain;

    public function __construct(int $courseId, int $userId, string $apiKey, string $lmsId, string $lmsDomain) {
        $this->courseId = $courseId;
        $this->userId = $userId;
        $this->apiKey = $apiKey;
        $this->lmsId = $lmsId;
        $this->lmsDomain = $lmsDomain;
    }

    public function getApiKey(): string { return $this->apiKey; }
    public function getLmsId(): string { return $this->lmsId; }
    public function getLmsDomain(): string { return $this->lmsDomain; }
    public function getCourseId() { return $this->courseId; }
    public function getUserId() { return $this->userId; }
}
