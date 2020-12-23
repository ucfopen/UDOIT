<?php

namespace App\MessageHandler;

use App\Entity\Course;
use App\Entity\User;
use App\Message\QueueItemInterface;
use App\Services\LmsFetchService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Messenger\Handler\MessageHandlerInterface;

class QueueItemHandler implements MessageHandlerInterface
{
    /** @var EntityManagerInterface $entityManager */
    private $entityManager;

    /** @var LmsFetchService $lmsFetch */
    private $lmsFetch;

    public function __construct(EntityManagerInterface $entityManager, LmsFetchService $lmsFetch)
    {
        $this->entityManager = $entityManager;
        $this->lmsFetch = $lmsFetch;
    }

    public function __invoke(QueueItemInterface $item)
    {
        $task = $item->getTask();

        $userId = $item->getUserId();
        $userRepo = $this->entityManager->getRepository(User::class);
        $user = $userRepo->find($userId);

        $courseId = $item->getCourseId();
        $courseRepository = $this->entityManager->getRepository(Course::class);  
        $course = $courseRepository->find($courseId);
        
        switch ($task) {
            case 'refreshContent':
                $this->lmsFetch->refreshLmsContent($course, $user);
        }
    }
}