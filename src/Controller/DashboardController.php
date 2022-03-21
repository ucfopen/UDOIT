<?php

namespace App\Controller;

use App\Entity\Course;
use App\Entity\Institution;
use App\Entity\UserSession;
use App\Services\LmsApiService;
use App\Services\LmsUserService;
use App\Services\SessionService;
use App\Services\UtilityService;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class DashboardController extends AbstractController
{
    /** @var UtilityService $util */
    protected $util;

    /** @var UserSession $session */
    protected $session;

    /** @var LmsApiService $lmsApi */
    protected $lmsApi;

    private ManagerRegistry $doctrine;

    public function __construct(ManagerRegistry $doctrine)
    {
        $this->doctrine = $doctrine;
    }

    #[Route('/dashboard', name: 'dashboard')]
    public function index(
        UtilityService $util,
        SessionService $sessionService,
        LmsUserService $lmsUser,
        LmsApiService $lmsApi)
    {
        $this->util = $util;
        $this->session = $sessionService->getSession();
        $this->lmsApi = $lmsApi;
        $reportArr = false;

        /** @var \App\Entity\User */
        $user = $this->getUser();
        if (!$user) {
            $this->util->exitWithMessage('User authentication failed.');
        }
        if (!$this->isUiDevelopment() && !$lmsUser->validateApiKey($user)) {
            if ($this->session->get('oauthAttempted', false)) {
                $this->util->exitWithMessage('API authentication failed. Contact your administrator.');
            }

            return $this->redirectToRoute('authorize', ['auth_token' => $this->session->getUuid()]);
        }

        $lmsCourseId = $this->session->get('lms_course_id');
        if($this->isUiDevelopment() && !isset($lmsCourseId)) {
          $lmsCourseId = 616;
        }
        if (!$lmsCourseId) {
            $this->util->exitWithMessage('Missing LMS course ID.');
        }

        $courseRepo = $this->doctrine->getRepository(Course::class);
        /** @var Course $course */
        $course = $courseRepo->findOneBy(['lmsCourseId' => $lmsCourseId]);

        if (!$course) {
            $institution = $user->getInstitution();
            $course = $this->createCourse($institution, $lmsCourseId);
        }

        $activeReport = $course->getLatestReport();
        if ($activeReport) {
            $reportArr = $activeReport->toArray();
            $reportArr['issues'] = $course->getAllIssues();
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
        $clientToken = $this->session->getUuid();

        $metadata = $institution->getMetadata();
        $lang = (!empty($metadata['lang'])) ? $metadata['lang'] : $_ENV['DEFAULT_LANG'];
        $excludedRuleIds = (!empty($metadata['excludedRuleIds'])) ? $metadata['excludedRuleIds'] : $_ENV['PHPALLY_EXCLUDED_RULES'];

        $lms = $this->lmsApi->getLms();

        return [
            'apiUrl' => !empty($_ENV['BASE_URL']) ? $_ENV['BASE_URL'] : false,
            'clientToken' => $clientToken,
            'user' => $user,
            'course' => $course,
            'institution' => $institution,
            'roles' => $this->session->get('roles'),
            'language' => $lang,
            'labels' => (array) $this->util->getTranslation($lang),
            'excludedRuleIds' => $excludedRuleIds,
            'contentTypes' => $lms->getContentTypes(),
            'backgroundColor' => !empty($_ENV['BACKGROUND_COLOR']) ? $_ENV['BACKGROUND_COLOR'] : '#ffffff',
            'textColor' => !empty($_ENV['TEXT_COLOR']) ? $_ENV['TEXT_COLOR'] : '#000000',
            'suggestionRuleIds' => !empty($_ENV['PHPALLY_SUGGESTION_RULES']) ? $_ENV['PHPALLY_SUGGESTION_RULES'] : '',
            'easyRuleIds' => !empty($_ENV['EASY_FIX_RULES']) ? $_ENV['EASY_FIX_RULES'] : '',
            'visualRuleIds' => !empty($_ENV['VISUAL_RULES']) ? $_ENV['VISUAL_RULES'] : '',
            'auditoryRuleIds' => !empty($_ENV['AUDITORY_RULES']) ? $_ENV['AUDITORY_RULES'] : '',
            'cognitiveRuleIds' => !empty($_ENV['COGNITIVE_RULES']) ? $_ENV['COGNITIVE_RULES'] : '',
            'motorRuleIds' => !empty($_ENV['MOTOR_RULES']) ? $_ENV['MOTOR_RULES'] : '',
            'versionNumber' => !empty($_ENV['VERSION_NUMBER']) ? $_ENV['VERSION_NUMBER'] : '',
        ];
    }

    protected function createCourse(Institution $institution, $lmsCourseId)
    {
        $course = new Course();
        $course->setInstitution($institution);
        $course->setLmsCourseId($lmsCourseId);
        $course->setTitle("New Course: ID#{$lmsCourseId}");
        $course->setActive(true);
        $course->setDirty(false);

        $this->doctrine->getManager()->persist($course);
        $this->doctrine->getManager()->flush();

        return $course;
    }

    private function isUiDevelopment()
    {
      return $this->getParameter('app.use_development_auth') == 'YES';
    }

}
