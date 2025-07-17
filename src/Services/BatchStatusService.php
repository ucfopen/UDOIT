<?php

// src/Services/BatchStatusService.php
namespace App\Services;

use Psr\Cache\CacheItemPoolInterface;

class BatchStatusService
{
    public function __construct(private CacheItemPoolInterface $cache) {}

    public function setStatus(string $batchId, string $status, int $ttl = 86400): void
    {
        $item = $this->cache->getItem($batchId);
        $item->set($status)->expiresAfter($ttl);
        $this->cache->save($item);
    }

    public function getStatus(string $batchId): ?string
    {
        $item = $this->cache->getItem($batchId);
        return $item->isHit() ? $item->get() : null;
    }
}
