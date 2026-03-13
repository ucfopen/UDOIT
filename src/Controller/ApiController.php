<?php

namespace App\Controller;

use App\Entity\Course;
use App\Services\SessionService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Console\Output\ConsoleOutput;

abstract class ApiController extends AbstractController
{
    protected function userHasCourseAccess(Course $course, SessionService $sessionService) : bool {
        $output = new ConsoleOutput();

        // Check if user actually exists
        /** @var \App\Entity\User */
        $user = $this->getUser();
        if (!$user) {
            return false;
        }

        // Check if we can get a session
        $userSession = $sessionService->getSession();
        if (!$userSession) {
            return false;
        }

        // Check if course belongs to user's institution
        $userInstitutionId = $user?->getInstitution()?->getId();
        $resourceInstitutionId = $course->getInstitution()->getId();

        if ($resourceInstitutionId !== $userInstitutionId) {
            return false;
        }

        $userCourseId = $userSession->get('lms_course_id');

        // No course ID found in the session
        if (!$userCourseId) {
            return false;
        }

        if ($course->getLmsCourseId() !== $userCourseId) {
            return false;
        }

        return true;
    }
}
