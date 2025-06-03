<?php

namespace App\MessageHandler;

use App\Message\FullRescanMessage;
use App\Services\LmsFetchService;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\UserRepository;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

use Symfony\Component\Messenger\MessageBusInterface;
use App\Message\ScanContentItem;

use Symfony\Component\Uid\Uuid;   // for unique batch ids
use App\Services\BatchCounterService;

#[AsMessageHandler]
class FullRescanHandler
{
    private LmsFetchService $lmsFetch;
    private EntityManagerInterface $em;
    private UserRepository $users;
    private MessageBusInterface $bus;
    private BatchCounterService $counter;

    public function __construct(
        LmsFetchService          $lmsFetch,
        EntityManagerInterface   $em,
        UserRepository           $users,
        MessageBusInterface      $bus,
        BatchCounterService      $counter
    ) {
        $this->lmsFetch     = $lmsFetch;
        $this->em           = $em;
        $this->users        = $users;
        $this->bus          = $bus;
        $this->counter      = $counter;
    }

    public function __invoke(FullRescanMessage $message): void
    {
        $course = $this->em->getRepository(\App\Entity\Course::class)->find($message->getCourseId());
        $user   = $this->em->getRepository(\App\Entity\User::class)->find($message->getUserId());

        // ---------- 1. Sanity check ----------
        if (!$course || !$user) {
            error_log(sprintf(
                'FullRescanHandler: Missing course or user. course_id=%s, user_id=%s',
                $message->getCourseId(),
                $message->getUserId()
            ));
            return;
        }

        // ---------- 2.  Patch the missing “request” context ----------
        // a) API token that would normally live in the session
        $user->setApiKey($message->getApiKey());

        // b) LMS meta that Utility / LmsApiService expect
        $institution = $user->getInstitution();          // already attached entity
        $institution->setLmsId($message->getLmsId());
        $institution->setLmsDomain($message->getLmsDomain());
        // (No flush needed – we just need the values in memory while the job runs.)

        // ---------- 3.  Normal guard clauses ----------
        if (!$course->isActive() || $course->isDirty()) {
            error_log(sprintf(
                'FullRescanHandler: Skipping rescan. Course is not active or is dirty. course_id=%s, user_id=%s',
                $message->getCourseId(),
                $message->getUserId()
            ));
            return;
        }

        // ---------- 4.  Do the work ----------
        try {
            // Refresh LMS data and get only the list of *changed* items
            $updatedItems = $this->lmsFetch->refreshLmsContent($course, $user, true);

            $batchId = Uuid::v4()->toRfc4122();          // random UUID
            $total = \count($updatedItems);

            // -------- initialise shared counter (atomic) ----------
            $this->counter->init($batchId, $total);

            $idx   = 0;
            foreach ($updatedItems as $ci) {
                $idx++;
                // $isLast = ($idx === $total);          // true for the final item
                $this->bus->dispatch(
                    new ScanContentItem(
                        contentItemId: $ci->getId(),
                        userId:        $user->getId(),
                        // isLast:        $isLast,
                        batchId:       $batchId
                    )
                );
            }

            // Nothing else to do here – individual workers will pick up the
            // ScanContentItem messages and perform the scans in parallel.
        } catch (\Throwable $e) {
            error_log(sprintf(
                'FullRescanHandler: Exception during rescan. course_id=%s, user_id=%s, error=%s',
                $message->getCourseId(),
                $message->getUserId(),
                $e->getMessage()
            ));
        }
    }

}
