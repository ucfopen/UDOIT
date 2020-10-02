<?php


namespace App\Controller;


use App\Entity\Course;
use App\Entity\Institution;
use App\Entity\Issue;
use App\Entity\Report;
use App\Response\ApiResponse;
use App\Response\ReportResponse;
use App\Services\UtilityService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Constraints\Json;


class CoursesController extends ApiController
{
    /**
     * @Route("/api/courses/", name="get_courses")
     * @param Request $request
     * @return JsonResponse
     */
    public function getAllCourses(
        Request $request,
        SessionInterface $session,
        UtilityService $util
    ) {
        // Get Institution Data from User Object FIXME: Uncomment when front end handling authorization, and del
        $user = $this->getUser();
        $institution = $user->getInstitution();

        // Get Courses
        $courses = $institution->getCourses();

        // Construct API Response
        $apiResponse = new ApiResponse();
        $apiResponse->setData($courses);
        $jsonResponse = new JsonResponse($apiResponse);
        $jsonResponse->setEncodingOptions($jsonResponse->getEncodingOptions() | JSON_PRETTY_PRINT);
        return $jsonResponse;
    }

    /**
     * @Route("/api/courses/{courseId}", methods={"GET"}, name="get_course")
     * @param Request $request
     * @param int $courseId
     * @return JsonResponse
     * @throws \Exception
     */
    public function getCourse(
        Request $request,
        SessionInterface $session,
        UtilityService $util,
        int $courseId
    ) {
        $apiResponse = new ApiResponse();
        try {
            // Check if user has access to course FIXME: Uncomment when front end is handling auth
            if(!$this->userHasCourseAccess($courseId)) {
                throw new \Exception("You do not have permission to access the specified course.");
            }
            $user = $this->getUser();
            $institution = $user->getInstitution();

            // Get Course
            $repository = $this->getDoctrine()->getRepository(Course::class);
            $course = $repository->find($courseId);

            // Evaluate Course ID
            if(is_null($course)) {
                throw new \Exception("The requested course does not exist.");
            }

            $apiResponse->setData($course);

        } catch(\Exception $e) {
            $apiResponse->addError($e->getMessage());
        }

        // Construct Response
        $jsonResponse = new JsonResponse($apiResponse);
        $jsonResponse->setEncodingOptions($jsonResponse->getEncodingOptions() | JSON_PRETTY_PRINT);
        return $jsonResponse;
    }
}