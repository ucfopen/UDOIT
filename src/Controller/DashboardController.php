<?php

namespace App\Controller;

use App\Entity\Course;
use App\Services\LmsApiService;
use App\Services\UtilityService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\Annotation\Route;

class DashboardController extends AbstractController
{
    /** @var UtilityService $util */
    protected $util;

    /** @var LmsApiService $lmsApi */
    protected $lmsApi;

    /** @var SessionInterface $session */
    protected $session;

    /**
     * @Route("/dashboard", name="dashboard")
     */
    public function index(
        UtilityService $util,
        SessionInterface $session,
        LmsApiService $lmsApi)
    {
        $this->util = $util;
        $this->lmsApi = $lmsApi;
        $this->session = $session;
        $reportArr = false;

        $user = $this->getUser();
        if (!$user) {
            $this->util->exitWithMessage('User authentication failed.');
        }

        $lmsCourseId = $this->get('session')->get('lms_course_id');
        if (!$lmsCourseId) {
            $this->util->exitWithMessage('Missing LMS course ID.');
        }

        $courseRepo = $this->getDoctrine()->getRepository(Course::class);
        /** @var Course $course */
        $course = $courseRepo->findOneBy(['lmsCourseId' => $lmsCourseId]);

        if (!$course) {
            $institution = $user->getInstitution();
            $course = $this->util->createCourse($institution, $lmsCourseId);
        }

        /* Add this course to the queue for scanning */
        $this->lmsApi->addCoursesToBeScanned([$course], $user, true);

        $activeReport = $course->getLatestReport();        
        if ($activeReport) {
            $reportArr = $activeReport->toArray();
            $reportArr['issues'] = $course->getActiveIssues();
            $reportArr['contentItems'] = $course->getContentItems();
            $reportArr['files'] = $course->getFileItems();
        }

        return $this->render('default/index.html.twig', [
            'data' => [
                'report' => $reportArr,                
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
            'roles' => $this->session->get('roles'),
            'language' => $lang,
            'labels' => $this->util->getTranslation($lang),
            'excludedRuleIds' => $excludedRuleIds,
        ];
    }

}