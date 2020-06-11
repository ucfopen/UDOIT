<?php


namespace App\Controller;


use App\Entity\Course;
use App\Entity\Issue;
use App\Entity\Report;
use App\Response\ApiResponse;
use App\Response\ReportResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Constraints\Json;

/**
 * Class CoursesController
 * @package App\Controller
 * @Route("/courses")
 */
class CoursesController extends AbstractController
{
    /**
     * @Route("/", methods={"GET"}, name="all_courses")
     * @return ApiResponse
     */
    public function getCourses() {
        // TODO: Assert user has permissions to perform action
        // TODO: Get Institution from auth_token
        // TODO: Handle Exceptions
        $institutionId = 123456789;

        // Get Courses
        $repository = $this->getDoctrine()->getRepository(Course::class);
        $courses = $repository->findCoursesInInstitution($institutionId);

        // Construct API Response
        $apiResponse = new ApiResponse();
        $apiResponse->setData($courses);
        $jsonResponse = new JsonResponse($apiResponse);
        $jsonResponse->setEncodingOptions($jsonResponse->getEncodingOptions() | JSON_PRETTY_PRINT);
        return $jsonResponse;
    }
}