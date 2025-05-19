<?php

namespace App\MessageHandler;

use App\Entity\Course;
use App\Entity\User;
use App\Message\FullRescanMessage;
use App\Services\LmsFetchService;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\UserRepository;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
class FullRescanHandler
{
    private LmsFetchService $lmsFetch;
    private EntityManagerInterface $em;
    private UserRepository $users;

    public function __construct(
        LmsFetchService $lmsFetch,
        EntityManagerInterface $em,
        UserRepository $users
    ) {
        $this->lmsFetch = $lmsFetch;
        $this->em       = $em;
        $this->users    = $users;
    }

    public function __invoke(FullRescanMessage $message): void
    {
        /** @var Course|null $course */
        $course = $this->em->getRepository(Course::class)->find($message->getCourseId());

        /** @var User|null $user */
        $user   = $this->em->getRepository(User::class)->find($message->getUserId());

        /* ---------- 1. Sanity check ---------- */
        if (!$course || !$user) {
            return;                 // log if you like
        }

        /* ---------- 2.  Patch the missing “request” context ---------- */
        // a) API token that would normally live in the session
        $user->setApiKey($message->getApiKey());

        // b) LMS meta that Utility / LmsApiService expect
        $institution = $user->getInstitution();          // already attached entity
        $institution->setLmsId($message->getLmsId());
        $institution->setLmsDomain($message->getLmsDomain());
        // (No flush needed – we just need the values in memory while the job runs.)

        /* ---------- 3.  Normal guard clauses ---------- */
        if (!$course->isActive() || $course->isDirty()) {
            return;
        }

        /* ---------- 4.  Do the work ---------- */
        try {
            $prevReport = $course->getPreviousReport();
            $this->lmsFetch->refreshLmsContent($course, $user, /* force */ true);

            $report = $course->getLatestReport();
            if (!$report) {
                return;             // or log
            }

            // … optional logging / notifications …
        } catch (\Throwable $e) {
            // log / Sentry, etc.
        }
    }

}
