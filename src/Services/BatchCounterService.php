<?php

namespace App\Services;

use Symfony\Contracts\Service\Attribute\Required;
use Predis\Client;
/**
 * Stores “how many ScanContentItem jobs are still running in this batch?”
 *
 * • We use Redis’ native DECR command so the operation is atomic
 *   even when dozens of workers finish at the same time.
 */
final class BatchCounterService
{
    private Client $redis;

    #[Required]
    public function setRedis(Client $redis): void   // autowired: “redis://…” DSN
    {
        $this->redis = $redis;
    }

    private function key(string $batchId): string
    {
        return sprintf('scan_batch_remaining:%s', $batchId);
    }

    /** Initialise the counter once, right after you dispatch the batch */
    public function init(string $batchId, int $total): void
    {
        $this->redis->set($this->key($batchId), $total);
    }

    /** Called by each worker when it *finishes* its item.
     *  Returns TRUE IFF the caller was the last one. */
    public function finishedOne(string $batchId): bool
    {
        $left = $this->redis->decr($this->key($batchId));   // atomic!
        if ($left > 0) {
            return false;
        }
        // last worker: clean up and tell caller “yes, you’re last”
        $this->redis->del($this->key($batchId));
        return true;
    }
}
