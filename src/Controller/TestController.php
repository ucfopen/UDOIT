<?php

namespace App\Controller;

use App\Repository\ContentItemRepository;
use App\Repository\CourseRepository;
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
    public function index(UtilityService $util, CourseRepository $courseRepo, ContentItemRepository $contentItemRepo, PhpAllyService $phpAllyService)
    {
        $out = [];
        
        //$course = $courseRepo->find(59);
        //$out['content'] = $lms->getCourseContent($course);

        //$contentItems = $contentItemRepo->getUpdatedContentItems($course);
        //$item = reset($contentItems);
        $item = $contentItemRepo->find(97);

        //$ruleIds = $phpAllyService->getRules();
        $report = $phpAllyService->scanHtml($item);

        return new JsonResponse($report);
    }
}
