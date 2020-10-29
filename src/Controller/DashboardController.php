<?php

namespace App\Controller;

use App\Entity\Course;
use App\Repository\ContentItemRepository;
use App\Repository\FileItemRepository;
use App\Services\LmsApiService;
use App\Services\UtilityService;
use App\Services\ContentService;
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
        LmsApiService $lmsApi,
        FileItemRepository $fileItemRepo)
    {
        $this->util = $util;
        $this->lmsApi = $lmsApi;
        $reports = [];
        $reportArr = false;

        $user = $this->getUser();

        // TODO: Handle no user
        

        if ($lmsCourseId = $this->get('session')->get('lms_course_id')) {
            $repository = $this->getDoctrine()->getRepository(Course::class);
            /** @var Course $course */
            $course = $repository->findOneBy(['lmsCourseId' => $lmsCourseId]);

            if ($course) {
                $activeReport = $course->getLatestReport();
                if ($activeReport) {
                    $reportArr = $activeReport->toArray(true);
                    $reportArr['files'] = $fileItemRepo->findByCourse($course);
                    $reports = $course->getReports()->toArray();
                }
            }
            else {
                $institution = $user->getInstitution();
                $course = $this->util->createCourse($institution, $lmsCourseId);
            }

            if ($course) {
                $this->lmsApi->createApiRequests([$course], $user, true);
                // $this->util->createMessage('Content scan in progress...', 'info', $course, $user);
            }
        }

        return $this->render('default/index.html.twig', [
            'data' => [
                'report' => $reportArr,
                'reports' => $reports,
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
