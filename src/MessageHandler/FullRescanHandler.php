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

#[AsMessageHandler]
class FullRescanHandler
{
    private LmsFetchService $lmsFetch;
    private EntityManagerInterface $em;
    private UserRepository $users;
    private MessageBusInterface $bus;

    public function __construct(
        LmsFetchService          $lmsFetch,
        EntityManagerInterface   $em,
        UserRepository           $users,
        MessageBusInterface      $bus
    ) {
        $this->lmsFetch     = $lmsFetch;
        $this->em           = $em;
        $this->users        = $users;
        $this->bus          = $bus;
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
            $updatedItems = $this->lmsFetch->fullRefreshLmsContent($course, $user, $message->isForce());

            // ------------------------------------------------------------------
            // Mark every item as “pending” for this batch so we can reliably
            // detect when the last worker finishes (metadata flag approach).
            // ------------------------------------------------------------------
            $batchId = $message->getBatchId();          // random UUID
            foreach ($updatedItems as $ci) {
                $meta = $ci->getMetadata() ? json_decode($ci->getMetadata(), true) : [];
                $meta['scan_pending'] = true;
                $meta['batch']        = $batchId;   // will be defined right below
                $ci->setMetadata(json_encode($meta));
            }
            // Persist the flags *before* any ScanContentItem jobs are queued
            $this->em->flush();

            foreach ($updatedItems as $ci) {
                $this->bus->dispatch(
                    new ScanContentItem(
                        contentItemId: $ci->getId(),
                        userId:        $user->getId(),
                        isLast:        false,          // obsolete – kept for BC
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
