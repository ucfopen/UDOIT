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
        try {
            $report = $this->scanner->scanContentItem($item, /* equalAccess */ null, $this->util);

            if ($report) {
                // propagate scan errors back into our messaging system
                foreach ($report->getErrors() as $err) {
                    $msgTxt = $err . ', item = #' . $item->getId();
                    $this->util->createMessage($msgTxt, 'error', $item->getCourse(), null, true);
                }

                // persist each reported Issue
                foreach ($report->getIssues() as $issue) {
                    $this->lmsFetch->createIssue($issue, $item);
                }
            }

            /* ----------------------------------------------------------------
             * 4.   Flush & detach to keep memory low when many jobs run
             * -------------------------------------------------------------- */
            $this->em->flush();
            $this->em->clear();

            /* --------------------------------------------------------------
             * 6.  If I was the final worker for this batch, generate the report
             * -------------------------------------------------------------- */
            // If this was the final item in the batch, fire the aggregation job
            if ($msg->isLast()) {
                $this->bus->dispatch(
                    new FinishRescanMessage($item->getCourse()->getId(), $user->getId())
                );
            }

        } catch (\Throwable $e) {
            // A single item failed – log and continue; do NOT re‑throw.
            $this->util->createMessage($e->getMessage(), 'error', $item->getCourse(), null, true);
        }
    }
}
