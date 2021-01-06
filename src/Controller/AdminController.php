<?php

namespace App\Controller;

use App\Entity\Course;
use App\Entity\User;
use App\Repository\CourseRepository;
use App\Response\ApiResponse;
use App\Services\LmsApiService;
use App\Services\LmsUserService;
use App\Services\UtilityService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\Annotation\Route;

class AdminController extends ApiController
{
    private $util;

    private $session;

    private $lmsApi;

    private $lmsUser;

    /**
     * @Route("/admin", name="admin")
     */
    public function index(
        UtilityService $util,
        SessionInterface $session,
        LmsApiService $lmsApi,
        LmsUserService $lmsUser)
    {
        $this->util = $util;
        $this->session = $session;
        $this->lmsApi = $lmsApi;
        $this->lmsUser = $lmsUser;

        $user = $this->getUser();
        if (!$user) {
            $this->util->exitWithMessage('User authentication failed.');
        }
        if (!$lmsUser->validateApiKey($user)) {
            $this->session->set('destination', 'admin');
            return $this->redirectToRoute('authorize');
        }

        return $this->render('admin/index.html.twig', [
            'data' => [
                'settings' => $this->getSettings(),
                'messages' => $this->util->getUnreadMessages(true),
            ],
        ]);
    }

    /**
     * @Route("/api/admin/courses/account/{accountId}/term/{termId}", methods={"GET"}, name="admin_courses")
     */
    public function getCoursesData(
        $accountId, 
        $termId,
        CourseRepository $courseRepo,
        UtilityService $util,
        LmsApiService $lmsApi)
    {
        $apiResponse = new ApiResponse();
        $results = [];
        $user = $this->getUser();
        $courses = $courseRepo->findCoursesByAccount($user, $accountId, $termId);
        
        $this->lms = $lmsApi->getLms();
        $this->util = $util;

        foreach ($courses as $course) {
            $results[] = $this->getCourseData($course, $user);
        }

        $apiResponse->addLogMessages($util->getUnreadMessages());
        $apiResponse->setData($results);

        return new JsonResponse($apiResponse);
    }

    protected function getCourseData(Course $course, User $user) 
    {
        return [
            'id' => $course->getId(),
            'title' => $course->getTitle(),
            'accountId' => $course->getLmsAccountId(),
            'accountName' => $course->getLmsAccountName(),
            'report' => $course->getLatestReport(),
            'lastUpdated' => $course->getLastUpdated()->format($this->util->getDateFormat()),
            'publicUrl' => $this->lms->getCourseUrl($course, $user),
        ];
    }

    /**
     * @return array
     */
    protected function getSettings()
    {
        $lms = $this->lmsApi->getLms();
            
        /** @var User $user */
        $user = $this->getUser();
        /** @var \App\Entity\Institution $institution */
        $institution = $user->getInstitution();
        $clientToken = base64_encode($user->getUsername());

        $metadata = $institution->getMetadata();
        $lang = (!empty($metadata['lang'])) ? $metadata['lang'] : $_ENV['DEFAULT_LANG'];
        $excludedRuleIds = (!empty($metadata['excludedRuleIds'])) ? $metadata['excludedRuleIds'] : $_ENV['PHPALLY_EXCLUDED_RULES'];

        if (!($accountId = $this->session->get('lms_account_id'))) {
            $this->util->exitWithMessage('Account ID not found.');
        }

        $account = (empty($metadata['accounts'][$accountId])) 
            ? $lms->getAccountData($user, $accountId) : $metadata['accounts'][$accountId];
        
        $metadata = $institution->getMetadata();
        $terms = (empty($metadata['terms'])) ? $lms->getAccountTerms($user, $accountId) : $metadata['terms'];

        return [
            'apiUrl' => !empty($_ENV['BASE_URL']) ? $_ENV['BASE_URL'] : false,
            'clientToken' => $clientToken,
            'user' => $user,
            'institution' => $institution,
            'roles' => $this->session->get('roles'),
            'language' => $lang,
            'labels' => $this->util->getTranslation($lang),
            'excludedRuleIds' => $excludedRuleIds,
            'account' => $account,
            'terms' => $terms,
        ];
    }

    /**
     * @Route("/api/admin/courses/{course}/reports/latest", methods={"GET"}, name="admin_latest_report")
     * @param Course $course
     * 
     * @return JsonResponse
     */
    public function getAdminLatestReport(Course $course, UtilityService $util, LmsApiService $lmsApi)
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
            $apiResponse->setData($courseData);
            $apiResponse->addMessage('msg.sync.completed', 'success', 5000);
        } catch (\Exception $e) {
            $apiResponse->addMessage($e->getMessage(), 'info', 0, false);
        }

        // Construct Response
        return new JsonResponse($apiResponse);
    }
}
