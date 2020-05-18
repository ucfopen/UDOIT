<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class CourseApiController extends AbstractController
{
    /**
     * @Route("/course/api", name="course_api")
     */
    public function index()
    {
        return $this->render('course_api/index.html.twig', [
            'controller_name' => 'CourseApiController',
        ]);
    }
}
