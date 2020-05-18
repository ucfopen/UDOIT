<?php

namespace App\Controller;

use App\Entity\Course;
use App\Message\BackgroundQueueItem;
use App\Message\PriorityQueueItem;
use App\Repository\CourseRepository;
use App\Response\ApiResponse;
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
     * @Route("/sync/{course}", name="request_sync")
     */
    public function requestSync(Course $course, UtilityService $util)
    {
        $this->util = $util;
        $response = new ApiResponse();
        
        if ($course->isActive() && !$course->isDirty()) {
            $count = $this->createApiRequests([$course], true);
            $this->addFlash('message', 'Sync started.');
        }

        return new JsonResponse($response);
    }

    /**
     * @Route("/cron/sync", name="cron_sync")
     */
    public function cronSync(UtilityService $util)
    {
        $this->util = $util;

        /** @var CourseRepository $courseRepository */
        $courseRepository = $this->getDoctrine()->getRepository(Course::class);
        $courses = $courseRepository->findCoursesNeedingUpdate($this->maxAge);
        $count = $this->createApiRequests($courses);

        return new JsonResponse($count);
    }

    protected function createApiRequests($courses, $isPriority = false)
    {
        $lms = $this->util->getLms();

        // add courses to the messenger
        foreach ($courses as $course) {
            if ($isPriority) {
                $this->dispatchMessage(new PriorityQueueItem($course, 'refreshContent'));
            }
            else {
                $this->dispatchMessage(new BackgroundQueueItem($course, 'refreshContent'));
            }
            
            $course->setDirty(true);
        }

        $this->getDoctrine()->getManager()->flush();

        return count($courses);
    }
}
