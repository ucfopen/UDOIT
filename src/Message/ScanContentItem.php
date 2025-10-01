<?php
namespace App\Message;

/**
 * A unit‑of‑work message processed by ScanContentItemHandler.
 *
 *  • $contentItemId – DB id of the ContentItem to scan
 *  • $userId        – DB id of the user whose token / permissions we borrow
 *  • $isLast        – true only for the final item in a FullRescan batch;
 *                     the handler uses it to dispatch FinishRescanMessage.
 *  • $batchId       – arbitrary string (usually a UUID) grouping all items
 *                     of the same FullRescan.  Useful for debugging / logs.
 */
final class ScanContentItem
{
    public function __construct(
        private int     $contentItemId,
        private int     $userId,
        private bool    $isLast   = false,
        private ?string $batchId  = null,
    ) {}

    public function getContentItemId(): int      { return $this->contentItemId; }
    public function getUserId(): int             { return $this->userId; }
    public function isLast(): bool               { return $this->isLast; }
    public function getBatchId(): ?string        { return $this->batchId; }
}
