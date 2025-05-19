<?php

namespace App\Message;

final class ScanContentItem
{
    public function __construct(
        private int $contentItemId,
        private int $userId
    ) {}

    public function getContentItemId(): int { return $this->contentItemId; }
    public function getUserId(): int       { return $this->userId; }
}
