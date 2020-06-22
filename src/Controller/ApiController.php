<?php


namespace App\Controller;


use App\Entity\Course;
use App\Entity\Institution;
use App\Entity\Report;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

abstract class ApiController extends AbstractController
{
    public function getInstitutionId() : int {
        $user = $this->getUser();
        $institution = $user->getInstitution();
        return $institution->getId();
    }

    public function userHasCourseAccess(int $courseId) : bool {
        // Get Course
        $repository = $this->getDoctrine()->getRepository(Course::class);
        $course = $repository->find($courseId);

        // Check if course belongs to user's institution
        $userInstitutionId = $this->getInstitutionId();
        $resourceInstitutionId = $course->getInstitution()->getId();
        return $resourceInstitutionId === $userInstitutionId;
    }
}