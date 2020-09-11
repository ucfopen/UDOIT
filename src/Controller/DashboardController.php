<?php

namespace App\Controller;

use App\Entity\Course;
use App\Services\LmsApiService;
use App\Services\UtilityService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\Annotation\Route;

class DashboardController extends AbstractController
{
    /** @var UtilityService $util */
    protected $util;

    /** @var LmsApiService $lmsApi */
    protected $lmsApi;

    /**
     * @Route("/dashboard", name="dashboard")
     */
    public function index(
        UtilityService $util,
        LmsApiService $lmsApi)
    {
        $this->util = $util;
        $this->lmsApi = $lmsApi;

        $user = $this->getUser();

        // TODO: Handle no user

        $clientToken = base64_encode($user->getUsername());

        if ($lmsCourseId = $this->get('session')->get('lms_course_id')) {
            $repository = $this->getDoctrine()->getRepository(Course::class);
            /** @var Course $course */
            $course = $repository->findOneBy(['lmsCourseId' => $lmsCourseId]);

            if ($course) {
                $activeReport = $course->getLatestReport();
            }
            else {
                $institution = $user->getInstitution();
                $course = $this->util->createCourse($institution, $lmsCourseId);
                $activeReport = false;
            }

            // TODO: Sync content
            if ($course) {
                $this->lmsApi->createApiRequests([$course], $user, true);
            }
        }
    
        return $this->render('default/index.html.twig', [
            'data' => [
                'user' => $user,
                'course' => $course,
                'report' => $activeReport,
                'clientToken' => $clientToken,
                'messages' => $this->util->getUnreadMessages(true),
            ],
        ]);
    }

}
