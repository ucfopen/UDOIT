<?php

namespace App\Controller;

use App\Entity\Course;
use App\Message\BackgroundQueueItem;
use App\Message\PriorityQueueItem;
use App\MessageHandler\QueueItemHandler;
use App\Repository\CourseRepository;
use App\Response\ApiResponse;
use App\Services\LmsApiService;
use App\Services\UtilityService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class SyncController extends AbstractController
{
    protected $maxAge = '1D';

    /** @var UtilityService $util */
    protected $util;

    /**
     * @Route("/api/sync/{course}", name="request_sync")
     */
    public function requestSync(Course $course, LmsApiService $lmsApi)
    {
        $response = new ApiResponse();
        $user = $this->getUser();

        if($course) {
            if ($course->isActive()) {
                if (!$course->isDirty()) {
                    $lmsApi->addCoursesToBeScanned([$course], $user, true);
                    $response->setData(1);
                }
            }
            else {
                $response->setData(0);
                $response->addMessage('msg.sync.course_inactive', 'error');
            }
        }
        else {
            $response->setData(0);
            $response->addMessage('msg.sync.failed', 'error');
        }

        return new JsonResponse($response);
    }

    /**
     * @Route("/cron/sync", name="cron_sync")
     */
    public function cronSync(LmsApiService $lmsApi)
    {
        /** @var CourseRepository $courseRepository */
        $courseRepository = $this->getDoctrine()->getRepository(Course::class);
        $courses = $courseRepository->findCoursesNeedingUpdate($this->maxAge);
        $user = $this->getUser();

        $count = $lmsApi->addCoursesToBeScanned($courses, $user);

        return new JsonResponse($count);
    }
}
