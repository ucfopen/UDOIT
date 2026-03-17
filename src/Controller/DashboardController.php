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
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Asset\Packages;
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

    private Packages $packages;

    public function __construct(ManagerRegistry $doctrine, Packages $packages)
    {
        $this->doctrine = $doctrine;
        $this->packages = $packages;
    }

    #[Route('/dashboard', name: 'dashboard')]
    public function index(
        UtilityService $util,
        SessionService $sessionService,
        LmsUserService $lmsUser,
        LmsApiService $lmsApi): Response
    {
        $this->util = $util;
        $this->session = $sessionService->getSession();
        $this->lmsApi = $lmsApi;

        /** @var \App\Entity\User */
        $user = $this->getUser();
        if (!$user) {
            $this->util->exitWithMessage('User authentication failed.');
        }
        $apiStatus = $lmsUser->validateApiKey($user);
        if (!$apiStatus['success']) {
            if ($this->session->get('oauthAttempted', false)) {
                $this->util->exitWithMessage('API authentication failed. Contact your administrator.');
            }

            return $this->redirectToRoute('authorize');
        }

        $cssUrl = $this->packages->getUrl('build/app.css');
        $jsUrl  = $this->packages->getUrl('build/app.js');

        return new Response(
            '<!DOCTYPE html><html dir="ltr"><head>'
            . '<meta charset="UTF-8"><title>UDOIT</title>'
            . '<link rel="stylesheet" href="' . htmlspecialchars($cssUrl, ENT_QUOTES, 'UTF-8') . '">'
            . '</head><body style="margin:0">'
            . '<div id="root"></div>'
            . '<script src="' . htmlspecialchars($jsUrl, ENT_QUOTES, 'UTF-8') . '"></script>'
            . '</body></html>',
            200,
            ['Content-Type' => 'text/html; charset=UTF-8']
        );
    }

    #[Route('/api/settings', name: 'api_settings', methods: ['GET'])]
    public function settingsApi(
        UtilityService $util,
        SessionService $sessionService,
        LmsApiService $lmsApi): JsonResponse
    {
        $this->util = $util;
        $this->session = $sessionService->getSession();
        $this->lmsApi = $lmsApi;

        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthenticated'], 401);
        }

        $lmsCourseId = $this->session->get('lms_course_id');
        if (!$lmsCourseId) {
            return new JsonResponse(['error' => 'Missing LMS course ID'], 400);
        }

        $courseRepo = $this->doctrine->getRepository(Course::class);
        $course = $courseRepo->findOneBy(['lmsCourseId' => $lmsCourseId]);

        if (!$course) {
            $course = $this->createCourse($user->getInstitution(), $lmsCourseId);
        }

        return new JsonResponse([
            'settings' => $this->getSettings($course),
            'messages' => $this->util->getUnreadMessages(true),
        ]);
    }

    protected function getSettings(Course $course): array
    {
        /** @var User $user */
        $user = $this->getUser();
        /** @var \App\Entity\Institution $institution */
        $institution = $user->getInstitution();

        $metadata = $institution->getMetadata();

        /** $lang should be two letters, and match an available JSON file in the /translations folder. */
        $lang = ($_ENV['DEFAULT_LANG'] ? $_ENV['DEFAULT_LANG'] : 'en');
        $lang = (!empty($metadata['lang'])) ? $metadata['lang'] : $lang;
        $lang = (array_key_exists("lang", $user->getRoles()) ? $user->getRoles()["lang"] : $lang);
        $excludedRuleIds = (!empty($metadata['excludedRuleIds'])) ? $metadata['excludedRuleIds'] : $_ENV['PHPALLY_EXCLUDED_RULES'];

        $lms = $this->lmsApi->getLms();

        return [
            'apiUrl' => !empty($_ENV['BASE_URL']) ? $_ENV['BASE_URL'] : false,
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
}
