<?php

namespace App\MessageHandler;

use App\Message\FullRescanMessage;
use App\Services\LmsFetchService;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\UserRepository;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

use Symfony\Component\Messenger\MessageBusInterface;
use App\Message\ScanContentItem;

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
        $this->lmsFetch = $lmsFetch;
        $this->em       = $em;
        $this->users    = $users;
        $this->bus      = $bus;
    }

    public function __invoke(FullRescanMessage $message): void
    {
        $course = $this->em->getRepository(\App\Entity\Course::class)->find($message->getCourseId());
        $user   = $this->em->getRepository(\App\Entity\User::class)->find($message->getUserId());

        // ---------- 1. Sanity check ----------
        if (!$course || !$user) {
            return;                 // log if you like
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
            return;
        }

        // ---------- 4.  Do the work ----------
        try {
            // Refresh LMS data and get only the list of *changed* items
            $updatedItems = $this->lmsFetch->refreshLmsContent($course, $user, true);

            // Fan‑out: enqueue a ScanContentItem job for each item
            foreach ($updatedItems as $ci) {
                $this->bus->dispatch(
                    new ScanContentItem($ci->getId(), $user->getId())
                );
            }

            // Nothing else to do here – individual workers will pick up the
            // ScanContentItem messages and perform the scans in parallel.
        } catch (\Throwable $e) {
            // log / Sentry, etc.
        }
    }

}
