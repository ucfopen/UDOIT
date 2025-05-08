<?php

namespace App\MessageHandler;

use App\Entity\Course;
use App\Message\FullRescanMessage;
use App\Services\LmsFetchService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Messenger\Handler\MessageHandlerInterface;

class FullRescanHandler implements MessageHandlerInterface
{
    private LmsFetchService $lmsFetch;
    private EntityManagerInterface $em;

    public function __construct(
        LmsFetchService $lmsFetch,
        EntityManagerInterface $em
    ) {
        $this->lmsFetch = $lmsFetch;
        $this->em = $em;
    }

    public function __invoke(FullRescanMessage $message)
    {
        // Retrieve the Course entity
        /** @var Course|null $course */
        $course = $this->em->getRepository(Course::class)
            ->find($message->getCourseId());
        if (!$course) {
            return; // or log an error, etc.
        }

        // Perform the scan
        // Note: If refreshLmsContent needs a specific user,
        // either pass a user ID in the message or use a "system user."
        // $user = ... // get your user context or system user
        // $this->lmsFetch->refreshLmsContent($course, $user);

        // Optionally log success, send notifications, etc.
    }
}
