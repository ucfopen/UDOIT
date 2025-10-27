<?php

namespace App\Controller;

use App\Entity\FileItem;
use App\Response\ApiResponse;
use App\Services\LmsPostService;
use App\Services\UtilityService;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Console\Output\ConsoleOutput;

class FileItemsController extends ApiController
{
    private ManagerRegistry $doctrine;

    public function __construct(ManagerRegistry $doctrine)
    {
        $this->doctrine = $doctrine;
    }

    #[Route('/api/files/{file}/review', name: 'review_file')]
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

            $this->doctrine->getManager()->flush();

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

    #[Route('/api/files/{file}/post', methods: ['POST'], name: 'file_post')]
    public function postFile(FileItem $file, Request $request, UtilityService $util, LmsPostService $lmsPost)
    {
        $output = new ConsoleOutput();
        $apiResponse = new ApiResponse();
        $user = $this->getUser();

        try {
            // Check if user has access to course
            $course = $file->getCourse();
            if (!$this->userHasCourseAccess($course)) {
                throw new \Exception("You do not have permission to access this issue.");
            }

            $uploadedFile = $request->files->get('file');

            $output->writeln("Uploading file: " . $uploadedFile->getClientOriginalName());
            // Save content to LMS
            $lmsResponse = $lmsPost->saveFileToLms($file, $uploadedFile, $user);
            $responseContent = $lmsResponse->getContent();

            $output->writeln("Response Content: " . print_r($responseContent, true));

            // If the new file was successfully posted, update the FileItem metadata to point to this replacement
            if (isset($responseContent['id'])) {
                $file->setReplacementFile($responseContent);
            }

            // Update report stats
            $report = $course->getUpdatedReport();

            $this->doctrine->getManager()->flush();

            // Create response
            $apiResponse->addMessage('form.msg.success_replaced', 'success', 5000);
            
            $apiResponse->addLogMessages($util->getUnreadMessages());

            $apiResponse->setData([
                'lmsResponse' => $lmsResponse,
                'file' => ['pending' => false],
                'report' => $report,
            ]);
        } catch (\Exception $e) {
            $apiResponse->addError($e->getMessage());
        }

        return new JsonResponse($apiResponse);
    }
}
