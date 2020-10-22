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
        $reports = [];

        $user = $this->getUser();

        // TODO: Handle no user
        

        if ($lmsCourseId = $this->get('session')->get('lms_course_id')) {
            $repository = $this->getDoctrine()->getRepository(Course::class);
            /** @var Course $course */
            $course = $repository->findOneBy(['lmsCourseId' => $lmsCourseId]);

            if ($course) {
                $activeReport = $course->getLatestReport();
                $reportArr = $activeReport->toArray(true);
                $reports = $course->getReports();
            }
            else {
                $institution = $user->getInstitution();
                $course = $this->util->createCourse($institution, $lmsCourseId);
                $reportArr = false;
            }

            if ($course) {
                $this->lmsApi->createApiRequests([$course], $user, true);
            }
        }

        return $this->render('default/index.html.twig', [
            'data' => [
                'report' => $reportArr,
                'reports' => $reports->toArray(),
                'settings' => $this->getSettings($course),
                'messages' => $this->util->getUnreadMessages(true),
            ],
        ]);
    }

    /**
     * 
     *
     * @param Course $course
     * @return void
     */
    protected function getSettings(Course $course) 
    {
        /** @var User $user */
        $user = $this->getUser();
        /** @var \App\Entity\Institution $institution */
        $institution = $user->getInstitution();
        $clientToken = base64_encode($user->getUsername());

        $metadata = $institution->getMetadata();
        $lang = (!empty($metadata['lang'])) ? $metadata['lang'] : $_ENV['DEFAULT_LANG'];
        $excludedRuleIds = (!empty($metadata['excludedRuleIds'])) ? $metadata['excludedRuleIds'] : $_ENV['PHPALLY_EXCLUDED_RULES'];

        return [
            'apiUrl' => !empty($_ENV['BASE_URL']) ? $_ENV['BASE_URL'] : false,
            'clientToken' => $clientToken,
            'user' => $user,
            'course' => $course,
            'institution' => $institution,
            'language' => $lang,
            'labels' => $this->util->getTranslation($lang),
            'excludedRuleIds' => $excludedRuleIds,
        ];
    }

}
