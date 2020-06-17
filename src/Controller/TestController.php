<?php

namespace App\Controller;

use App\Repository\ContentItemRepository;
use App\Repository\CourseRepository;
use App\Services\UtilityService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class TestController extends AbstractController
{
    /**
     * @Route("/test", name="test")
     */
    public function index(UtilityService $util, CourseRepository $courseRepo, ContentItemRepository $contentItemRepo)
    {
        $out = [];
        
        $lms = $util->getLms();
        $course = $courseRepo->find(1);
        //$out['content'] = $lms->getCourseContent($course);

        $contentItemRepo->setCourseContentInactive($course);

        // $entityManager = $this->getDoctrine()->getManager(); 
        // $entityManager->createQuery(
        //     'UPDATE App\Entity\ContentItem SET active=0 WHERE course=:course'
        // )
        //     ->setParameter('course', $course)
        //     ->execute();

        return new JsonResponse($out);
    }
}
