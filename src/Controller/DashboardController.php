<?php

namespace App\Controller;

use App\Entity\Course;
use App\Services\UtilityService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\Annotation\Route;

class DashboardController extends AbstractController
{
    /**
     * @Route("/dashboard", name="dashboard")
     */
    public function index(
        Request $request,
        SessionInterface $session,
        UtilityService $util)
    {
        $this->request = $request;
        $this->session = $session;
        $this->util = $util;
        $data = [];

        $user = $data['user'] = $this->getUser();
        $data['clientToken'] = base64_encode($user->getUsername());

        if ($courseId = $session->get('lms_course_id')) {
            $repository = $this->getDoctrine()->getRepository(Course::class);
            /** @var Course $course */
            $course = $data['course'] = $repository->find($courseId);

            if ($course) {
                $data['report'] = $course->getLatestReport();
            }
        }
    
        return $this->render('default/index.html.twig', [
            'data' => \json_encode($data),
        ]);
    }

}
