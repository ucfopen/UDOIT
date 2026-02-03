<?php

namespace App\Controller;

use App\Entity\Course;
use App\Entity\Institution;
use App\Entity\Issue;
use App\Entity\User;
use App\Repository\CourseRepository;
use App\Repository\UserRepository;
use App\Response\ApiResponse;
use App\Services\LmsApiService;
use App\Services\LmsUserService;
use App\Services\SessionService;
use App\Services\UtilityService;
use App\Repository\CourseUserRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
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


    #[Route('/admin', name: 'admin')]
    public function index(
        UtilityService $util,
        SessionService $sessionService,
        LmsApiService $lmsApi,
        LmsUserService $lmsUser,
        CourseRepository $courseRepo)
    {
        $this->util = $util;
        $this->session = $sessionService->getSession();
        $this->lmsApi = $lmsApi;
        $this->lmsUser = $lmsUser;
        $this->courseRepo = $courseRepo;

        $user = $this->getUser();
        if (!$user) {
            $this->util->exitWithMessage('User authentication failed.');
        }
        if (!$lmsUser->validateApiKey($user)) {
            $this->session->set('destination', 'admin');
            return $this->redirectToRoute('authorize', ['auth_token' => $this->session->getUuid()]);
        }

        return $this->render('admin/index.html.twig', [
            'data' => [
                'settings' => $this->getSettings(),
                'messages' => $this->util->getUnreadMessages(true),
            ],
        ]);
    }

    #[Route('/api/admin/courses/account/{accountId}/term/{termId}', methods: ['GET'], name: 'admin_courses')]
    public function getCoursesData(
        $accountId, 
        $termId,
        CourseRepository $courseRepo,
        UtilityService $util,
        LmsApiService $lmsApi,
        Request $request,
        UserRepository $userRepo,
        CourseUserRepository $courseUserRepo,
        EntityManagerInterface $em
        )
    {
        $apiResponse = new ApiResponse();
        $results = [];
        $user = $this->getUser();
        
        $this->lms = $lmsApi->getLms();
        $this->util = $util;

        $includeSubaccounts = $request->query->get('subaccounts');
        $accounts = $this->lms->getAccountData($user, $accountId);
        if (!$includeSubaccounts) {
            $accounts = [$accountId => $accounts[$accountId]];
        }

        // Handle 'all' or 'null' termId - convert to null for API calls
        $termIdForApi = ($termId === 'all' || $termId === 'null') ? null : (int)$termId;

        // UDOIT (DB) courses - fetch all for this institution/term
        // Don't filter by account here because Canvas API handles that filtering
        // and we want to match any previously scanned courses regardless of their account
        $allAccounts = $this->lms->getAccountData($user, $accountId);
        $udoitCourses = $courseRepo->findCoursesByAccount($user, $allAccounts, $termId);
        $udoitByLmsId = [];
        foreach ($udoitCourses as $c) {
            $udoitByLmsId[(string)$c->getLmsCourseId()] = $c;
        }

        // Canvas courses (root + subs)
        $subAccountIds = array_diff(array_keys($accounts), [(int)$accountId]);
        // Reset array keys to 0-indexed for proper URL encoding
        $subAccountIds = array_values($subAccountIds);
        
        $canvas = $this->lms->listAccountCourses($user, $accountId, $subAccountIds, $termIdForApi);

        // Merge
        $results = [];
        foreach ($canvas as $cc) {
            $lmsCourseId = (string)($cc['id'] ?? '');
            if (isset($udoitByLmsId[$lmsCourseId])) {
                $course = $udoitByLmsId[$lmsCourseId];
                $row = $this->getCourseData($course, $user);   // reuse helper (no API call)
                $row['lmsCourseId'] = $lmsCourseId;
                $row['instructors'] = $this->getInstructorNamesForCourse($course, $user, $courseUserRepo, $userRepo, $em, $lmsApi);
                $row['hasReport'] = (bool)$course->getLatestReport();
                $row['canScan']   = true;
                $results[] = $row;
            } else {
                // Extract instructor names from Canvas data
                $instructorNames = [];
                if (!empty($cc['teachers']) && is_array($cc['teachers'])) {
                    foreach ($cc['teachers'] as $teacher) {
                        $name = null;
                        if (!empty($teacher['name'])) {
                            $name = $teacher['name'];
                        } elseif (!empty($teacher['display_name'])) {
                            $name = $teacher['display_name'];
                        } elseif (!empty($teacher['short_name'])) {
                            $name = $teacher['short_name'];
                        } elseif (!empty($teacher['sortable_name'])) {
                            $name = $teacher['sortable_name'];
                        }
                        if (!empty($name)) {
                            $instructorNames[] = $name;
                        }
                    }
                }
                
                // placeholder for unscanned course - use LMS course ID as the identifier
                $results[] = [
                    'id'          => $lmsCourseId,  // This is the LMS course ID (string)
                    'lmsCourseId' => $lmsCourseId,
                    'title'       => $cc['name'] ?? '(untitled)',
                    'accountId'   => $cc['account_id'] ?? null,
                    'accountName' => $cc['account_name'] ?? '---',
                    'report'      => null,
                    'lastUpdated' => '---',
                    'publicUrl'   => '---',
                    'termId'      => $cc['enrollment_term_id'] ?? null,
                    'instructors' => $instructorNames,
                    'hasReport'   => false,
                    'canScan'     => true,
                ];
            }
        }

        $apiResponse->addLogMessages($util->getUnreadMessages());
        $apiResponse->setData($results);

        return new JsonResponse($apiResponse);
    }

    #[Route('/api/admin/reports/account/{accountId}/term/{termId}', methods: ['GET'], name: 'admin_reports')]
    public function getReportsData(
        $accountId,
        $termId,
        CourseRepository $courseRepo,
        UtilityService $util,
        LmsApiService $lmsApi,
        Request $request,
        UserRepository $userRepo,
        CourseUserRepository $courseUserRepo,  
        EntityManagerInterface $em 
    )
    {

        $apiResponse = new ApiResponse();
        $results = [];
        $issues = [];
        $user = $this->getUser();

        $this->lms = $lmsApi->getLms();

        $includeSubaccounts = $request->query->get('subaccounts');
        $accounts = $this->lms->getAccountData($user, $accountId);
        if (!$includeSubaccounts) {
            $accounts = [$accountId => $accounts[$accountId]];
        }
        $courses = $courseRepo->findCoursesByAccount($user, $accounts, $termId);

        $startDate = new \DateTime('today');
        $endDate = null;
        $oneDay = new \DateInterval('P1D');

        $courseInstructors = [];

        foreach ($courses as $course) {
            $courseTitle = $course->getTitle();
            $results[$courseTitle] = $results[$courseTitle] ?? [];

            foreach ($course->getReports() as $report) {
                $reportDate = $report->getCreated();
                $reportKey = $reportDate->format($util->getDateFormat());

                if (!isset($results[$courseTitle][$reportKey])) {
                    $results[$courseTitle][$reportKey] = [
                        'count' => 0,
                        'errors' => 0,
                        'suggestions' => 0,
                        'contentFixed' => 0,
                        'contentResolved' => 0,
                        'filesReviewed' => 0,
                        'contentItems' => [],
                        'files' => [],
                        'issues' => [],
                        'contentSections' => [],
                    ];
                }

                // Populate report data
                $results[$courseTitle][$reportKey]['count']++;
                foreach (['errors', 'suggestions', 'contentFixed', 'contentResolved', 'filesReviewed'] as $key) {
                    $results[$courseTitle][$reportKey][$key] += $report->toArray()[$key] ?? 0;
                }

                $results[$courseTitle][$reportKey]['id'] = $course->getId();
                $results[$courseTitle][$reportKey]['contentItems'] = $course->getContentItems();
                $results[$courseTitle][$reportKey]['files'] = $course->getFileItems();
                $results[$courseTitle][$reportKey]['issues'] = $course->getAllIssues();
                $results[$courseTitle][$reportKey]['contentSections'] = $this->lms->getCourseSections($course, $user);

                // Update start and end dates
                if ($reportDate < $startDate) $startDate = $reportDate;
                if (!$endDate) $endDate = $reportDate;
                if ($reportDate > $endDate) $endDate = $reportDate;
            }
   
            $courseInstructors[$course->getId()] = $this->getInstructorNamesForCourse($course, $user, $courseUserRepo, $userRepo,$em, $lmsApi);

            // Collect issues for each course
            foreach ($course->getAllIssues() as $issue) {
                $rule = $issue->getScanRuleId();
                $status = $issue->getStatus();
                if (!isset($issues[$rule])) {
                    $issues[$rule] = [
                        'id' => $rule,
                        'type' => $issue->getType(),
                        'active' => 0,
                        'fixed' => 0,
                        'resolved' => 0,
                        'total' => 0,
                        'courses' => [],
                    ];
                }

                if (Issue::$issueStatusResolved === $status) {
                    $issues[$rule]['resolved']++;
                } elseif (Issue::$issueStatusFixed === $status) {
                    $issues[$rule]['fixed']++;
                } else {
                    $issues[$rule]['active']++;
                }
                $issues[$rule]['total']++;
                $issues[$rule]['courses'][$course->getId()] = $course->getId();
            }
        }

        // Count courses per issue rule
        foreach ($issues as $rule => $row) {
            $issues[$rule]['courses'] = count($row['courses']);
        }

        /*
        // Fill missing dates with previous report data
        foreach ($results as $courseTitle => $reports) {
            $currentDate = clone $startDate;
            $currentReport = null;

            while ($currentDate <= $endDate) {
                $currentKey = $currentDate->format($util->getDateFormat());
                $currentDate->add($oneDay);

                if (!empty($reports[$currentKey])) {
                    $currentReport = $reports[$currentKey];
                    continue;
                }
                if (empty($currentReport)) continue;

                $results[$courseTitle][$currentKey] = $currentReport;
            }
            ksort($results[$courseTitle]);
        }
        */
        $apiResponse->addData('reports', $results); // Grouped by course and date
        $apiResponse->addData('issues', $issues);   // Add issues data
        $apiResponse->addLogMessages($util->getUnreadMessages());
        $apiResponse->addData('courseInstructors', $courseInstructors);
        
        return new JsonResponse($apiResponse);
    }

    #[Route('/api/admin/courses/{course}/reports/full', methods: ['GET'], name: 'admin_course_report')]
    public function getAdminCourseReport(
        Course $course, 
        UtilityService $util, 
        LmsApiService $lmsApi, 
        UserRepository $userRepo, 
        CourseUserRepository $courseUserRepo,
        EntityManagerInterface $em 
        ): JsonResponse
    {

        $apiResponse = new ApiResponse();
        $user = $this->getUser();
        
        $this->lms = $lmsApi->getLms();
        $this->util = $util;

        $instructors = $this->getInstructorNamesForCourse(
            $course,
            $user,
            $courseUserRepo,
            $userRepo,
            $em,
            $lmsApi
        );
        
        try {
            // Check if user has course access
            if (!$this->userHasCourseAccess($course)) {
                throw new \Exception('msg.no_permissions'); //"You do not have permission to access the specified course.");
            }
            
            if ($course->isDirty()) {
                throw new \Exception('msg.course_scanning');
            }

            $startDate = new \DateTime('today');
            $endDate = null;
            $oneDay = new \DateInterval('P1D');

            foreach ($course->getReports() as $report) {
                $reportDate = $report->getCreated();
                $reportKey = $reportDate->format($util->getDateFormat());
                
                if (empty($rows[$course->getId()])) {
                    $rows[$course->getId()] = [];
                }
                
                $rows[$course->getId()][$reportKey] = $report;

                if ($reportDate < $startDate) {
                    $startDate = $reportDate;
                }
                if (!$endDate) {
                    $endDate = $reportDate;
                }
                if ($reportDate > $endDate) {
                    $endDate = $reportDate;
                }
            }

            foreach ($course->getAllIssues() as $issue) {
                $rule = $issue->getScanRuleId();
                $status = $issue->getStatus();
                if (!isset($issues[$rule])) {
                    $issues[$rule] = [
                        'id' => $rule,
                        'type' => $issue->getType(),
                        'active' => 0,
                        'fixed' => 0,
                        'resolved' => 0,
                        'total' => 0,
                        'courses' => [],
                    ];
                }

                if (Issue::$issueStatusResolved === $status) {
                    $issues[$rule]['resolved']++;
                }
                else if (Issue::$issueStatusFixed === $status) {
                    $issues[$rule]['fixed']++;
                }
                else {
                    $issues[$rule]['active']++;
                }
                $issues[$rule]['total']++;
                $issues[$rule]['courses'][$course->getId()] = $course->getId();
            }
            foreach ($issues as $rule => $row) {
                $issues[$rule]['courses'] = count($row['courses']);
            }
    
            if ($endDate) {
                $endDate->setTime(23, 59,0);            
            }
    
            // Populate all dates with a report
            foreach ($rows as $courseId => $reports) {
                $currentDate = clone $startDate;
                $currentReport = null;
                
                while ($currentDate <= $endDate) {
                    $currentKey = $currentDate->format($util->getDateFormat());
                    $currentDate->add($oneDay);
                    
                    if (!empty($reports[$currentKey])) {
                        $currentReport = $reports[$currentKey];
                        continue;
                    }
                    
                    if (empty($currentReport)) {
                        continue;
                    }
    
                    $rows[$courseId][$currentKey] = $currentReport;
                }
                ksort($rows[$courseId]);
            }
    
            foreach ($rows as $courseId => $reports) {
                foreach ($reports as $dateKey => $reportObj) {
                    $reportArr = $reportObj->toArray();
                    if (empty($results[$dateKey])) {
                        $results[$dateKey] = [
                            'count' => 0,
                            'errors' => 0,
                            'suggestions' => 0,
                            'contentFixed' => 0,
                            'contentResolved' => 0,
                            'filesReviewed' => 0,
                        ];
                    }
    
                    $results[$dateKey]['count']++;
                    $results[$dateKey]['created'] = $dateKey;
    
                    foreach (array_keys($results[$dateKey]) as $key) {
                        if (!empty($reportArr[$key]) && is_numeric($reportArr[$key])) {
                            $results[$dateKey][$key] += (int) $reportArr[$key];
                        }
                    }
                }
            }
    
            ksort($results);
    
            $apiResponse->addData('reports', $results);
            $apiResponse->addData('issues', $issues);
            $apiResponse->addData('instructors', $instructors);
            $apiResponse->addLogMessages($util->getUnreadMessages());
            
        } catch (\Exception $e) {
            $apiResponse->addMessage($e->getMessage(), 'info', 0, false);
        }

        // Construct Response
        return new JsonResponse($apiResponse);
    }

    #[Route('/api/admin/courses/{course}/reports/latest', methods: ['GET'], name: 'admin_latest_report')]
    public function getAdminLatestReport(Course $course, 
    UtilityService $util, 
    LmsApiService $lmsApi,
    UserRepository $userRepo,
    CourseUserRepository $courseUserRepo,
    EntityManagerInterface $em): JsonResponse
    {
        $apiResponse = new ApiResponse();
        $user = $this->getUser();
        
        $this->lms = $lmsApi->getLms();
        $this->util = $util;
        
        try {
            // Check if user has course access
            if (!$this->userHasCourseAccess($course)) {
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
            $course, $user, $courseUserRepo, $userRepo, $em, $lmsApi
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
    ): JsonResponse
    {
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
                'instructors' => $instructors
            ]);

        } catch (\Exception $e) {
            $apiResponse->addMessage($e->getMessage(), 'error', 0);
        }

        return new JsonResponse($apiResponse);
    }

    #[Route('/api/admin/users', methods: ['GET'], name: 'admin_users')]
    public function getUsers(UserRepository $userRepo): JsonResponse
    {
        $apiResponse = new ApiResponse();
        /** @var \App\Entity\User */
        $user = $this->getUser();
        $institution = $user->getInstitution();

        try {
            $users = $userRepo->findBy(['institution' => $institution]);
            $apiResponse->setData($users);
        } catch (\Exception $e) {
            $apiResponse->addMessage($e->getMessage(), 'info', 0, false);
        }

        // Construct Response
        return new JsonResponse($apiResponse);        
    }

    #[Route('/api/admin/accounts', methods: ['GET'], name: 'admin_update_accounts')]
    public function getUpdatedAccounts(
        LmsApiService $lmsApi, 
        SessionService $sessionService,
        UtilityService $util): JsonResponse
    {
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
        $clientToken = $this->session->getUuid();

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
            'clientToken' => $clientToken,
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
        $updatedDate = $course->getLastUpdated();
        $accounts = $this->lms->getAccountData($user);
        $accountId = $course->getLmsAccountId();

        $accountName = $accountId;
        if (!empty($accounts[$accountId])) {
            $accountName = "{$accounts[$accountId]['name']} ({$accounts[$accountId]['id']})"; 
        }

        return [
            'id' => $course->getId(),
            'title' => $course->getTitle(),
            'accountId' => $accountId,
            'accountName' => $accountName,
            'report' => $course->getLatestReport(),
            'lastUpdated' => !empty($updatedDate) ? $updatedDate->format($this->util->getDateFormat()) : '---',
            'publicUrl' => $this->lms->getCourseUrl($course, $user),
            'termId' => $course->getLmsTermId(),
            'hasReport' => (bool)$course->getLatestReport(),
            'canScan' => true,
        ];
    }

    protected function filterTermsByAccount($terms, $accounts) 
    {
        $user = $this->getUser();
        $courseTerms = [];

        $courses = $this->courseRepo->findCoursesByAccount($user, $accounts);
        foreach ($courses as $course) {
            $courseTermId = $course->getLmsTermId();
            
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
            if(empty($term["start_at"]) || empty($term["end_at"])) {
                continue;
            }
            $startTime= strtotime($term["start_at"]);
            $endTime = strtotime($term["end_at"]);

            if(($startTime <= $currentTime) && ($currentTime <= $endTime)){
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
            $name = trim((string)($cu->getUser()?->getName() ?? $cu->getDisplayName()));
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
            $lmsUserId   = (string)($t['id'] ?? '');
            if ($lmsUserId === '') { continue; }
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
