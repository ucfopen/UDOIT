<?php

namespace App\Controller;

use App\Entity\Account;
use App\Entity\Course;
use App\Entity\Institution;
use App\Entity\Issue;
use App\Entity\User;
use App\Entity\Report;
use App\Repository\CourseRepository;
use App\Repository\UserRepository;
use App\Repository\AccountRepository;
use App\Repository\ReportRepository;
use App\Repository\TermRepository;
use App\Response\ApiResponse;
use App\Services\LmsApiService;
use App\Services\LmsUserService;
use App\Services\SessionService;
use App\Services\UtilityService;
use App\Services\InitialStateService;
use App\Repository\CourseUserRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Asset\Packages;
use Symfony\Component\Console\Output\ConsoleOutput;
use Doctrine\ORM\EntityManagerInterface;
use DateTime;

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
        CourseRepository $courseRepo,
        InitialStateService $initialStateService,
        AccountRepository $accountRepo,
        ReportRepository $reportRepo,
        TermRepository $termRepo,
    ): JsonResponse {
        $this->util = $util;
        $this->session = $sessionService->getSession();
        $this->lmsApi = $lmsApi;
        $this->courseRepo = $courseRepo;
        $this->accountRepo = $accountRepo;
        $this->reportRepo = $reportRepo;
        $this->termRepo = $termRepo;
        $output = new ConsoleOutput();

        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthenticated'], 401);
        }

        $preferences = $initialStateService->getPreferences($user);

        $lms = $lmsApi->getLms();

        if (!($accountId = $this->session->get('lms_account_id'))) {
            $this->util->exitWithMessage('Account ID not found.');
        }
 
        $accounts = $accountRepo->getSubAccounts($user, $accountId);
        $terms = $termRepo->getAllTerms($user);
        $stats = $this->calculateDashboardStats($user, $accountRepo, $courseRepo, $reportRepo, $accountId, null);

        return new JsonResponse([
            'messages'     => $util->getUnreadMessages(true),
            'preferences'  => $preferences,
            'instanceInfo' => $initialStateService->getInstanceInfo($user),
            'labels'       => $initialStateService->getLabels($preferences),
            'accounts'     => $accounts,
            'termInfo'     => $terms,
            'accountId'    => $accountId,
            'stats'        => $stats, 
        ]);
    }

    #[Route('/api/admin/courses/account/{lmsAccountId}/term/{lmsTermId}', methods: ['GET'], name: 'admin_courses')]
    public function getCoursesData(
        int $lmsAccountId,
        int $lmsTermId,
        AccountRepository $accountRepo,
        CourseRepository $courseRepo,
        ReportRepository $reportRepo,
        UtilityService $util,
        LmsApiService $lmsApi,
        UserRepository $userRepo,
        CourseUserRepository $courseUserRepo,
        EntityManagerInterface $em,
        Request $request
    ) {
        $apiResponse = new ApiResponse();
        $user = $this->getUser();
        
        $this->accountRepo = $accountRepo;
        $this->courseRepo = $courseRepo;
        $this->reportRepo = $reportRepo;

        $this->lms = $lmsApi->getLms();
        $this->util = $util;

        if($lmsTermId == -1) {
            $lmsTermId = null;
        }

        $page = max(1, $request->query->getInt('page', 1));
        $perPage = min(100, max(1, $request->query->getInt('perPage', 10)));
        $search = trim((string) $request->query->get('search', ''));
        $sortBy = (string) $request->query->get('sortBy', 'lastUpdated');
        $direction = (string) $request->query->get('direction', 'desc');
        $accounts = $accountRepo->getAccountTree($user, $lmsAccountId);

        $paginatedCourses = $courseRepo->findCoursesByAccountPaginated(
            $user,
            $accounts,
            $lmsTermId,
            $page,
            $perPage,
            $search ?: null,
            $sortBy,
            $direction
        );
        $courses = $paginatedCourses['courses'];
        $totalCourses = $paginatedCourses['total'];
        $stats = null;
        if ($search == null){
            $stats  = $this->calculateDashboardStats($user, $accountRepo, $courseRepo, $reportRepo, $lmsAccountId, $lmsTermId);
        }

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
        
        $data = [
            "courses" => $results,
            "stats" => $stats,
            "pagination" => [
                "page" => $page,
                "perPage" => $perPage,
                "total" => $totalCourses,
                "totalPages" => (int) ceil($totalCourses / $perPage),
            ],
        ];

        $apiResponse->addLogMessages($util->getUnreadMessages());
        $apiResponse->setData($data);

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
                $apiResponse->addMessage("No course was found with the given course ID", 'error', 0);
                return new JsonResponse($apiResponse);
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


    #[Route('/api/admin/accounts/{lmsAccountId}', methods: ['GET'], name: 'admin_get_accounts')]
    public function getSubAccounts(int $lmsAccountId, SessionService $sessionService, UtilityService $util, AccountRepository $accountRepo, CourseRepository $courseRepo, ReportRepository $reportRepo) {
        $apiResponse = new ApiResponse();
        $session = $sessionService->getSession();
        $this->accountRepo = $accountRepo;
        $this->courseRepo = $courseRepo;
        $this->reportRepo = $reportRepo;

         /** @var User $user */
        $user = $this->getUser();
        
        if (!($accountId = $session->get('lms_account_id'))) {
            $util->exitWithMessage('Account ID not found.');
        }

        $accounts = $accountRepo->getSubAccounts($user, $lmsAccountId);

        $apiResponse->setData($accounts);

        return $this->json($apiResponse);
    }

    #[Route('/api/admin/terms/{lmsAccountId}', methods: ['GET'], name: 'admin_get_terms_courses')]
    public function getTermsAndCourses(int $lmsAccountId, SessionService $sessionService, UtilityService $util, CourseRepository $courseRepo){
        $apiResponse = new ApiResponse();
        $session = $sessionService->getSession();
        $this->courseRepo = $courseRepo;

        /** @var User $user */
        $user = $this->getUser();

        if (!($accountId = $session->get('lms_account_id'))) {
            $util->exitWithMessage('Account ID not found.');
        }

        $courseTerms = $this->getTermsByAccount($lmsAccountId);
        $apiResponse->setData($courseTerms);

        return $this->json($apiResponse);
    }


    /** PROTECTED FUNCTIONS **/

    protected function getTermInfo($accounts): array
    {
        $lms = $this->lmsApi->getLms();
        $user = $this->getUser();
        
        $terms = $lms->getAccountTerms($user);
        $terms = $this->filterTermsByAccount($terms, $accounts);
        $defaultTerm = $this->getDefaultTerm($terms);

        $simpleTerms = [];

        foreach ($terms as $term) {
            $simpleTerms[$term['id']] = $term['name'];
        }

        return [
            'terms' => $simpleTerms,
            'defaultTerm' => $defaultTerm,
        ];
    }

    protected function getCourseData(Course $course, User $user)
    {
        $reportRepository = $this->doctrine->getRepository(Report::class);
        $updatedDate = $course->getLastUpdated();
        $account = $course->getAccount();
        $accountId = $account?->getLmsAccountId();


        $accountName = $account ? "{$account->getAccountName()} ({$accountId})" : '---';

        return [
            'id' => $course->getId(),
            'title' => $course->getTitle(),
            'accountId' => $accountId,
            'accountName' => $accountName,
            'allReports' => $reportRepository->findBy(['course' => $course->getId()]),
            'latestReport' => $course->getLatestReport(),
            'issues' => $course->getAllIssues(),
            'lastUpdated' => !empty($updatedDate) ? $updatedDate->format($this->util->getDateFormat()) : '---',
            'publicUrl' => $this->lms->getCourseUrl($course, $user),
            'termId' => $course->getTerm()?->getLmsTermId(),
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

    protected function getTermsByAccount($accountId) {
        $user = $this->getUser();
        $terms = [];
        $termCourseMap = [];
        $output = new ConsoleOutput();
        $courses = $this->courseRepo->findCoursesByAccount($user, $accountId);
        $output->writeln($accountId);
        if ($courses){
            foreach ($courses as $course) {
                $term = $course->getTerm();
                if(isset($termCourseMap[$term->getLmsTermId()])){
                    $termCourseMap[$term->getLmsTermId()][] = $course;
                }
                else{
                    $terms[] = $term;
                    $termCourseMap[$term->getLmsTermId()][] = $course;
                }
                
            }
        }
        return [$terms, $termCourseMap];
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

    protected function calculateDashboardStats(
        User $user,
        AccountRepository $accountRepo,
        CourseRepository $courseRepo,
        ReportRepository $reportRepo,
        $accountId,
        $termId
    ) 
    {
        $N_COURSES = 5;

        $stats = [];
        $accounts = $accountRepo->getAccountTree($user, $accountId); // Returns an array of key value mapping of {accountId: accountName}
        $courses = $courseRepo->getCourseCount($user, array_keys($accounts), $termId); // Returns an array of key value mapping of {lms_course_id: lms_account_id}
        $courseIds = array_keys($courses);
        $totalInstructors = $courseRepo->getProfessorCount($user, $courseIds);
        $reports = $reportRepo->findLatestByCourseIds($courseIds);

        $scannedCourseIds = [];
        $n_courses = [];

        $scanCounter = [];

        usort($reports, fn($a, $b) => $b->getActiveIssueCount() <=> $a->getActiveIssueCount());


        foreach($reports as $report){
            $scannedCourseIds[] = $report->getCourse()->getLmsCourseId();
            if (count($n_courses) < $N_COURSES){
                $retrived_course = $report->getCourse()->jsonSerialize();
                $retrived_course['totalActiveIssues'] = $report->getActiveIssueCount();
                $n_courses[] = $retrived_course;
            }
            if (isset($scanCounter[$report->getHighestScanRule()])){
                $scanCounter[$report->getHighestScanRule()] += 1;
            }
            else{
                $scanCounter[$report->getHighestScanRule()] = 1;
            }

        }

        $uniqueInstructorsUsingUdoit = $courseRepo->getProfessorCount($user, $scannedCourseIds);

        $stats["totalCourses"] = count($courses);
        $stats["scannedCourses"] = count($reports);
        $stats["totalInstructors"] = $totalInstructors;
        $stats["uniqueInstructorsUsingUdoit"] = $uniqueInstructorsUsingUdoit;
        $stats["showcaseCourses"] = $n_courses;
        $stats["scanRanked"] = $scanCounter;

        return $stats;
    }

}
