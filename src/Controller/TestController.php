<?php

namespace App\Controller;

use App\Repository\ContentItemRepository;
use App\Repository\CourseRepository;
use App\Services\LmsApiService;
use App\Services\PhpAllyService;
use App\Services\UtilityService;
use CidiLabs\PhpAlly\PhpAlly;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class TestController extends AbstractController
{
    /**
     * @Route("/test", name="test")
     */
    public function index(UtilityService $util, 
        CourseRepository $courseRepo, 
        ContentItemRepository $contentItemRepo, 
        PhpAllyService $phpAllyService,
        LmsApiService $lmsApi)
    {
        $out = [];
        
        $course = $courseRepo->find(59);
        
        
        $item = $contentItemRepo->find(93);

        $lmsApi->postContentItemToLms($item);


        return new JsonResponse($item);
    }
}
