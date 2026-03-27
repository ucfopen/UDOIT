<?php

namespace App\Controller;

use App\Entity\Course;
use App\Entity\Institution;
use App\Entity\Issue;
use App\Entity\User;
use App\Entity\Report;
use App\Repository\CourseRepository;
use App\Repository\UserRepository;
use App\Response\ApiResponse;
use App\Services\LmsApiService;
use App\Services\LmsUserService;
use App\Services\SessionService;
use App\Services\UtilityService;
use App\Repository\CourseUserRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Asset\Packages;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Console\Output\ConsoleOutput;
use Doctrine\ORM\EntityManagerInterface;

class AdminController extends ApiController
{
    /** @var UtilityService $util */
    private $util;

    private $session;

    private $lmsApi;

    private $courseRepo;

    private $courseUserRepo;
    private $lms;
    private $lmsUser;

    private Packages $packages;
    private ManagerRegistry $doctrine;

    public function __construct(Packages $packages, ManagerRegistry $doctrine)
    {
        $this->packages = $packages;
        $this->doctrine = $doctrine;
    }

    #[Route('/admin', name: 'admin')]
    public function index(
        UtilityService $util,
        SessionService $sessionService,
        LmsApiService $lmsApi,
        LmsUserService $lmsUser,
        CourseRepository $courseRepo
    ) {
        $this->util = $util;
        $this->session = $sessionService->getSession();
        $this->lmsApi = $lmsApi;
        $this->lmsUser = $lmsUser;
        $this->courseRepo = $courseRepo;

        $user = $this->getUser();
        if (!$user) {
            $this->util->exitWithMessage('User authentication failed.');
        }
        $apiStatus = $lmsUser->validateApiKey($user);
        if (!$apiStatus['success']) {
            $this->session->set('destination', 'admin');
            return $this->redirectToRoute('authorize');
        }

        $cssUrl = $this->packages->getUrl('build/admin.css');
        $jsUrl  = $this->packages->getUrl('build/admin.js');

        return new Response(
            '<!DOCTYPE html><html dir="ltr"><head>'
            . '<meta charset="UTF-8"><title>UDOIT Admin</title>'
            . '<link rel="stylesheet" href="' . htmlspecialchars($cssUrl, ENT_QUOTES, 'UTF-8') . '">'
            . '</head><body style="margin:0">'
            . '<div id="root"></div>'
            . '<script src="' . htmlspecialchars($jsUrl, ENT_QUOTES, 'UTF-8') . '"></script>'
            . '</body></html>',
            200,
            ['Content-Type' => 'text/html; charset=UTF-8']
        );
    }

    #[Route('/api/admin/settings', name: 'api_admin_settings', methods: ['GET'])]
    public function settingsApi(
        UtilityService $util,
        SessionService $sessionService,
        LmsApiService $lmsApi,
        CourseRepository $courseRepo
    ): JsonResponse {
        $this->util = $util;
        $this->session = $sessionService->getSession();
        $this->lmsApi = $lmsApi;
        $this->courseRepo = $courseRepo;

        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthenticated'], 401);
        }

        return new JsonResponse([
            'settings' => $this->getSettings(),
            'messages' => $this->util->getUnreadMessages(true),
        ]);
    }

    #[Route('/api/admin/courses/account/{accountId}/term/{termId}', methods: ['GET'], name: 'admin_courses')]
    public function getCoursesData(
        $accountId,
        $termId,
        CourseRepository $courseRepo,
        UtilityService $util,
        LmsApiService $lmsApi,
        UserRepository $userRepo,
        CourseUserRepository $courseUserRepo,
        EntityManagerInterface $em
    ) {
        $apiResponse = new ApiResponse();
        $user = $this->getUser();

        $this->lms = $lmsApi->getLms();
        $this->util = $util;

        $courses = $courseRepo->findCoursesByAccount($user, $accountId, $termId);

        $results = [];
        foreach ($courses as $course) {
            $row = $this->getCourseData($course, $user);
            $row['lmsCourseId'] = $course->getLmsCourseId();
            $row['accountId']   = $course->getAccount()?->getLmsAccountId();
            $row['accountName'] = $course->getAccount()?->getAccountName() ?? '---';
            $row['termId']      = $course->getTerm()?->getLmsTermId();
            $row['instructors'] = $course->getCourseProfessors();

            $results[] = $row;
        }

        $apiResponse->addLogMessages($util->getUnreadMessages());
        $apiResponse->setData($results);

        return new JsonResponse($apiResponse);
    }

    #[Route('/api/admin/courses/{course}/reports/latest', methods: ['GET'], name: 'admin_latest_report')]
    public function getAdminLatestReport(
        Course $course,
        UtilityService $util,
        LmsApiService $lmsApi,
        UserRepository $userRepo,
        CourseUserRepository $courseUserRepo,
        EntityManagerInterface $em,
        SessionService $sessionService
    ): JsonResponse {
        $apiResponse = new ApiResponse();
        $user = $this->getUser();

        $this->lms = $lmsApi->getLms();
        $this->util = $util;

        try {
            // Check if user has course access
            if (!$this->userHasCourseAccess($course, $sessionService)) {
                throw new \Exception('msg.no_permissions'); //"You do not have permission to access the specified course.");
            }

            if ($course->isDirty()) {
                throw new \Exception('msg.course_scanning');
            }

            $report = $course->getLatestReport();

            if (!$report) {
                throw new \Exception('msg.no_report_created');
            }

            $courseData = $this->getCourseData($course, $user);

            $courseData['instructors'] = $this->getInstructorNamesForCourse(
                $course,
                $user,
                $courseUserRepo,
                $userRepo,
                $em,
                $lmsApi
            );

            $apiResponse->setData($courseData);
            $apiResponse->addMessage('msg.sync.completed', 'success', 5000);
        } catch (\Exception $e) {
            $apiResponse->addMessage($e->getMessage(), 'info', 0, false);
        }

        // Construct Response
        return new JsonResponse($apiResponse);
    }

    #[Route('/api/admin/sync/lms/{lmsCourseId}', methods: ['GET'], name: 'admin_scan_lms_course')]
    public function scanLmsCourse(
        string $lmsCourseId,
        CourseRepository $courseRepo,
        UtilityService $util,
        LmsApiService $lmsApi,
        EntityManagerInterface $em,
        UserRepository $userRepo,
        CourseUserRepository $courseUserRepo
    ): JsonResponse {
        $apiResponse = new ApiResponse();
        $user = $this->getUser();

        $this->lms = $lmsApi->getLms();
        $this->util = $util;

        try {
            // Find or create the course
            $course = $courseRepo->findOneBy(['lmsCourseId' => $lmsCourseId]);

            if (!$course) {
                // Create new course
                $institution = $user->getInstitution();
                $course = $this->createCourseFromLmsId($institution, $lmsCourseId, $em);
            }

            // Update course data from Canvas before scanning
            // This populates title, account ID, term ID, etc.
            $this->lms->updateCourseData($course, $user);

            // Fetch instructors for the course
            $instructors = [];
            try {
                $instructors = $this->getInstructorNamesForCourse(
                    $course,
                    $user,
                    $courseUserRepo,
                    $userRepo,
                    $em,
                    $lmsApi
                );
            } catch (\Exception $e) {
                // Continue without instructors
            }

            // Return the course ID so the frontend can use the regular scan endpoint
            $apiResponse->setData([
                'courseId' => $course->getId(),
                'lmsCourseId' => $lmsCourseId,
                'instructors' => $instructors,
            ]);

        } catch (\Exception $e) {
            $apiResponse->addMessage($e->getMessage(), 'error', 0);
        }

        return new JsonResponse($apiResponse);
    }

    #[Route('/api/admin/accounts', methods: ['GET'], name: 'admin_update_accounts')]
    public function getUpdatedAccounts(
        LmsApiService $lmsApi,
        SessionService $sessionService,
        UtilityService $util
    ): JsonResponse {
        $apiResponse = new ApiResponse();
        $session = $sessionService->getSession();
        $lms = $lmsApi->getLms();

        /** @var User $user */
        $user = $this->getUser();

        if (!($accountId = $session->get('lms_account_id'))) {
            $util->exitWithMessage('Account ID not found.');
        }

        $apiResponse->setData($lms->getAccountData($user, $accountId));

        return $this->json($apiResponse);
    }

    /** PROTECTED FUNCTIONS **/

    protected function getSettings(): array
    {
        $lms = $this->lmsApi->getLms();

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

        if (!($accountId = $this->session->get('lms_account_id'))) {
            $this->util->exitWithMessage('Account ID not found.');
        }

        $accounts = $lms->getAccountData($user, $accountId);
        $terms = $lms->getAccountTerms($user);
        $terms = $this->filterTermsByAccount($terms, $accounts);
        $defaultTerm = $this->getDefaultTerm($terms);

        $simpleTerms = [];

        foreach ($terms as $term) {
            $simpleTerms[$term['id']] = $term['name'];
        }

        return [
            'apiUrl' => !empty($_ENV['BASE_URL']) ? $_ENV['BASE_URL'] : false,
            'user' => $user,
            'institution' => $institution,
            'roles' => $this->session->get('roles'),
            'language' => $lang,
            'labels' => $this->util->getTranslation($lang),
            'excludedRuleIds' => $excludedRuleIds,
            'accounts' => $accounts,
            'terms' => $simpleTerms,
            'defaultTerm' => $defaultTerm,
            'suggestionRuleIds' => !empty($_ENV['PHPALLY_SUGGESTION_RULES']) ? $_ENV['PHPALLY_SUGGESTION_RULES'] : '',
        ];
    }

    protected function getCourseData(Course $course, User $user)
    {
        $reportRepository = $this->doctrine->getRepository(Report::class);
        $updatedDate = $course->getLastUpdated();
        $accounts = $this->lms->getAccountData($user);
        $accountId = $course->getAccount()->getLmsAccountId();

        $accountName = $accountId;
        if (!empty($accounts[$accountId])) {
            $accountName = "{$accounts[$accountId]['name']} ({$accounts[$accountId]['id']})";
        }

        return [
            'id' => $course->getId(),
            'title' => $course->getTitle(),
            'accountId' => $accountId,
            'accountName' => $accountName,
            'allReports' => $reportRepository->findBy(['course' => $course->getId()]),
            'latestReport' => $course->getLatestReport(),
            'issues' => $course->getActiveIssues(),
            'lastUpdated' => !empty($updatedDate) ? $updatedDate->format($this->util->getDateFormat()) : '---',
            'publicUrl' => $this->lms->getCourseUrl($course, $user),
            'termId' => $course->getTerm()->getLmsTermId(),
            'hasReport' => (bool) $course->getLatestReport(),
            'canScan' => true,
        ];
    }

    protected function filterTermsByAccount($terms, $accounts)
    {
        $user = $this->getUser();
        $courseTerms = [];

        $courses = $this->courseRepo->findCoursesByAccount($user, $accounts);
        foreach ($courses as $course) {
            $courseTermId = $course->getTerm()->getLmsTermId();

            if (!empty($terms[$courseTermId])) {
                $courseTerms[$courseTermId] = $terms[$courseTermId];
            }
        }

        return $courseTerms;
    }

    protected function getDefaultTerm($terms)
    {
        $currentTime = time();


        foreach ($terms as $term) {
            if (empty($term["start_at"]) || empty($term["end_at"])) {
                continue;
            }
            $startTime = strtotime($term["start_at"]);
            $endTime = strtotime($term["end_at"]);

            if (($startTime <= $currentTime) && ($currentTime <= $endTime)) {
                return $term['id'];
            }

        }

        //Return a default case just in case we dont find one.
        $defaultReturn = current($terms);
        return $defaultReturn['id'];

    }



    /**
     * Return a de-duplicated, sorted list of instructor display names for a course.
     * Will refresh the local mapping from Canvas if empty or older than $ttlMinutes.
     */
    protected function getInstructorNamesForCourse(
        Course $course,
        User $actingUser,
        CourseUserRepository $courseUserRepo,
        UserRepository $userRepo,
        EntityManagerInterface $em,
        LmsApiService $lmsApi,
        int $ttlMinutes = 1440
    ) {

        $rows = $courseUserRepo->findByCourse($course);
        $lastFetched = $courseUserRepo->maxFetchedAt($course);

        $stale = !$rows
            || !$lastFetched
            || $lastFetched < (new \DateTimeImmutable())->modify("-{$ttlMinutes} minutes");

        if ($stale) {
            try {
                $lmsClient = $lmsApi->getLms();
                $this->syncInstructors($course, $actingUser, $lmsClient, $courseUserRepo, $userRepo, $em);
                $rows = $courseUserRepo->findByCourse($course);
            } catch (\Throwable $e) {
                // optionally log
            }
        }

        $namesSet = [];
        foreach ($rows as $cu) {
            $name = trim((string) ($cu->getUser()?->getName() ?? $cu->getDisplayName()));
            if ($name !== '') {
                $namesSet[$name] = true;
            }
        }

        $names = array_keys($namesSet);
        sort($names, SORT_NATURAL | SORT_FLAG_CASE);
        return $names;
    }

    private function syncInstructors(
        Course $course,
        User $actingUser,
        object $lms,
        CourseUserRepository $courseUserRepo,
        UserRepository $userRepo,
        EntityManagerInterface $em
    ) {
        $teachers = $lms->getCourseTeachers($actingUser, $course->getLmsCourseId()) ?? [];

        foreach ($teachers as $t) {
            $lmsUserId   = (string) ($t['id'] ?? '');
            if ($lmsUserId === '') {
                continue;
            }
            $displayName = $t['name'] ?? null;

            $maybeUser = $userRepo->findOneBy([
                'institution' => $course->getInstitution(),
                'lmsUserId'   => $lmsUserId,
            ]);

            $courseUserRepo->upsertFromApi($course, $lmsUserId, $displayName, $maybeUser);
        }

        $em->flush();

    }

    protected function createCourseFromLmsId(Institution $institution, $lmsCourseId, EntityManagerInterface $em)
    {
        $course = new Course();
        $course->setInstitution($institution);
        $course->setLmsCourseId($lmsCourseId);
        $course->setTitle("New Course: ID#{$lmsCourseId}");
        $course->setActive(true);
        $course->setDirty(false);

        $em->persist($course);
        $em->flush();

        return $course;
    }
}
