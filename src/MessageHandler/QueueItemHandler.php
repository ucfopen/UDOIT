<?php

namespace App\MessageHandler;

use App\Entity\ContentItem;
use App\Entity\Course;
use App\Entity\Issue;
use App\Entity\Report;
use App\Entity\User;
use App\Message\QueueItemInterface;
use App\Services\LmsApiService;
use App\Services\UtilityService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Messenger\Handler\MessageHandlerInterface;

class QueueItemHandler implements MessageHandlerInterface
{
    /** @var EntityManagerInterface $entityManager */
    private $entityManager;

    /** @var UtilityService $util */
    private $util;

    /** @var LmsApiService $lmsApi */
    private $lmsApi;

    public function __construct(EntityManagerInterface $entityManager, UtilityService $util, LmsApiService $lmsApi)
    {
        $this->entityManager = $entityManager;
        $this->util = $util;
        $this->lmsApi = $lmsApi;
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
                $this->lmsApi->refreshLmsContent($course, $user);
        }
    }
}