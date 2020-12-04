<?php

namespace App\Controller;

use App\Entity\FileItem;
use App\Response\ApiResponse;
use App\Services\UtilityService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class FileItemsController extends ApiController
{
    /**
     * @Route("/api/files/{file}/review", name="file_item")
     */
    public function reviewFile(FileItem $file, Request $request, UtilityService $util)
    {
        $apiResponse = new ApiResponse();
        $user = $this->getUser();

        try {
            // Check if user has access to course
            $course = $file->getCourse();
            if (!$this->userHasCourseAccess($course)) {
                throw new \Exception("You do not have permission to access this issue.");
            }

            $updates = \json_decode($request->getContent(), true);
            $file->setReviewed($updates['reviewed']);
            $file->setReviewedBy($user);
            $file->setReviewedOn($util->getCurrentTime());

            // Update report stats
            $report = $course->getUpdatedReport();

            $this->getDoctrine()->getManager()->flush();

            // Create response
            if ($file->getReviewed()) {
                $apiResponse->addMessage('form.msg.success_reviewed', 'success', 5000);
            } else {
                $apiResponse->addMessage('form.msg.success_unreviewed', 'success', 5000);
            }

            $apiResponse->addLogMessages($util->getUnreadMessages());
            $apiResponse->setData([
                'file' => ['reviewed' => $file->getReviewed(), 'pending' => false],
                'report' => $report,
            ]);
        } catch (\Exception $e) {
            $apiResponse->addError($e->getMessage());
        }

        return new JsonResponse($apiResponse);
    }
}
