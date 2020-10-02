<?php

namespace App\Controller;

use App\Entity\Course;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

abstract class ApiController extends AbstractController
{
    public function userHasCourseAccess(Course $course) : bool {
        // Check if course belongs to user's institution
        $userInstitutionId = $this->getUser()->getInstitution()->getId();
        $resourceInstitutionId = $course->getInstitution()->getId();
        return $resourceInstitutionId === $userInstitutionId;
    }
}