<?php

namespace App\MessageHandler;

use App\Message\ScanContentItem;
use App\Entity\ContentItem;
use App\Entity\User;
use App\Services\LmsFetchService;
use App\Services\ScannerService;
use App\Services\UtilityService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Console\Output\ConsoleOutput;
use App\Message\FinishRescanMessage;
use Symfony\Component\Messenger\MessageBusInterface;

#[AsMessageHandler]
final class ScanContentItemHandler
{
    public function __construct(
        private LmsFetchService        $lmsFetch,
        private ScannerService         $scanner,
        private UtilityService         $util,
        private EntityManagerInterface $em,
        private MessageBusInterface    $bus,
    ) {}

    public function __invoke(ScanContentItem $msg): void
    {
        /* --------------------------------------------------------------------
         * 1.   Resolve the entities needed for this tiny job
         * ------------------------------------------------------------------ */
        /** @var ContentItem|null $item */
        $item = $this->em->getRepository(ContentItem::class)
                            ->find($msg->getContentItemId());

        /** @var User|null $user */
        $user = $this->em->getRepository(User::class)
                            ->find($msg->getUserId());

        if (!$item || !$user) {
            $this->util->createMessage(
                sprintf(
                    'ScanContentItemHandler: Missing entity. ContentItem ID: %s, User ID: %s',
                    $msg->getContentItemId(),
                    $msg->getUserId()
                ),
                'error',
                null,
                null,
                true
            );
            return;             // nothing to do – corrupted message?
        }

        /* --------------------------------------------------------------------
         * 2.   Remove the previous Issues linked to this ContentItem
         * ------------------------------------------------------------------ */
        $this->lmsFetch->deleteContentItemIssues([$item]);

        /* --------------------------------------------------------------------
         * 3.   Re‑scan the ContentItem with the configured scanner
         * ------------------------------------------------------------------ */
        $failure = null;

        try {
            // 3️⃣ – run the scanner, build issues, etc.
            $report = $this->scanner->scanContentItem($item, null, $this->util);  // existing line

            /* ────────────────────────────────────────────────────────────────
            * ✨ NEW: Persist every Issue returned by the scanner
            * ───────────────────────────────────────────────────────────── */
            if ($report) {
                foreach ($report->getIssues() as $issueDto) {
                    if (isset($issueDto->isGeneric) && $issueDto->isGeneric) {
                        $this->lmsFetch->createGenericIssue($issueDto, $item);
                    } else {
                        $this->lmsFetch->createIssue($issueDto, $item);
                    }
                }
                // Flush once so rows are written before we clear the metadata flag
                $this->em->flush();
            }

            // current success-path code
        } catch (\Throwable $e) {
            // remember the error – we still have to clear the flag
            $failure = $e;
            $this->util->createMessage($e->getMessage(), 'error', $item->getCourse(), null, true);
        } finally {
            /* 4 ️⃣  ALWAYS clear “scan_pending” + batch */
            $meta = $item->getMetadata() ? json_decode($item->getMetadata(), true) : [];
            unset($meta['scan_pending'], $meta['batch']);
            $item->setMetadata($meta ? json_encode($meta) : null);
            $this->em->flush();

            // 5 ️⃣  Re‑count pending items for this batch (native SQL – DQL
            //      does not recognise JSON_EXTRACT)
            $table = $this->em->getClassMetadata(ContentItem::class)->getTableName();
            $sql   = "SELECT COUNT(id)
                        FROM {$table}
                       WHERE JSON_EXTRACT(metadata, '$.batch') = :batch
                         AND JSON_EXTRACT(metadata, '$.scan_pending') = true";

            $pending = (int) $this->em->getConnection()->fetchOne($sql, [
                'batch' => $msg->getBatchId(),
            ]);

            if ($pending === 0) {
                $this->bus->dispatch(
                    new FinishRescanMessage(
                        $item->getCourse()->getId(),
                        $user->getId()
                    )
                );
            }

            $this->em->clear();

            // let Messenger retry the job if it actually failed
            if ($failure) {
                throw $failure;
            }
        }
    }
}
