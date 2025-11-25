<?php

namespace App\Controller;

use App\Entity\FileItem;
use App\Entity\ContentItem;
use App\Response\ApiResponse;
use App\Services\LmsPostService;
use App\Services\LmsFetchService;
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
    public function postFile(FileItem $file, Request $request, UtilityService $util, LmsPostService $lmsPost, LmsFetchService $lmsFetch)
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

            // Save content to LMS
            $lmsResponse = $lmsPost->saveFileToLms($file, $uploadedFile, $user);
            $responseContent = $lmsResponse->getContent();

            $output->writeln("Response Content: " . print_r($responseContent, true));

            // If the new file was successfully posted, update the FileItem metadata to point to this replacement
            if (isset($responseContent['id'])) {
                $file->setReplacementFile($responseContent);
            }

            $newFile = $lmsFetch->updateFileItem($course, $user, $responseContent); // Update or save file to database immedeatly to get updated report
            // Prereviewed file - We ASSUME that an accessibile file is being uploaded
            $newFile->setReviewed(true);
            $newFile->setReviewedBy($user);
            $newFile->setReviewedOn($util->getCurrentTime());
            $this->doctrine->getManager()->flush();
            
            // Update report stats
            $report = $course->getUpdatedReport();
            
            $reportArr = $report->toArray();
            $reportArr['files'] = $course->getFileItems();
            $reportArr['issues'] = $course->getAllIssues();
            $reportArr['contentItems'] = $course->getContentItems();
            $reportArr['contentSections'] = $lmsFetch->getCourseSections($course, $user);


            // Create response
            $apiResponse->addMessage('form.msg.success_replaced', 'success', 5000);
            
            $apiResponse->addLogMessages($util->getUnreadMessages());

            $apiResponse->setData([
                'newFile' => $newFile,
                'file' => ['pending' => false],
                'report' => $reportArr,
            ]);
        } catch (\Exception $e) {
            $apiResponse->addError($e->getMessage());
        }

        return new JsonResponse($apiResponse);
    }

    // This route is created here as files are the primary items using this route
    #[Route('/api/content', methods: ['POST'], name: 'upload_content')]
    public function uploadContent(Request $request, UtilityService $util, LmsPostService $lmsPost, LmsFetchService $lmsFetch){
        $output = new ConsoleOutput();
        $apiResponse = new ApiResponse();
        $user = $this->getUser();

        try{
            $content= \json_decode($request->getContent(), true);
            $contentOptions = $content['content'];
            $sectionOptions = $content['section'];

            $lmsContent = $lmsPost->uploadContentToLms($contentOptions, $sectionOptions, $user);
            if(!$lmsContent){
                throw new \Exception("Failed to change references in canvas");
            }

            $apiResponse->addMessage('form.msg.success_replaced', 'success', 5000);
            $apiResponse->addLogMessages($util->getUnreadMessages());

            $apiResponse->setData([
                'content' => $lmsContent,
            ]);

        } catch (\Exception $e) {
            $apiResponse->addError($e->getMessage());
        }

        return new JsonResponse($apiResponse);
    }

    #[Route('/api/files/{file}/delete', methods: ['DELETE'], name: 'delete_file')]
    public function deleteFile(FileItem $file, UtilityService $util, LmsPostService $lmsPost, LmsFetchService $lmsFetch){
        $output = new ConsoleOutput();
        $apiResponse = new ApiResponse();
        $user = $this->getUser();

        try{
            $fileDeletionResponse = $lmsPost->deleteFileFromLms($file, $user);
            if(!$fileDeletionResponse || isset($fileDeletionResponse->error)){
                throw new \Exception("Failed to delete file!");
            }

            $file->setActive(false); // File was deleted so it can be "deactived now"
            $apiResponse->addMessage('Succesfully deleted file from course', 'success', 5000);
            $apiResponse->addLogMessages($util->getUnreadMessages()); 
        }
        catch (\Exception $e) {
            $apiResponse->addError($e->getMessage());
        }

        return new JsonResponse($apiResponse);
    }
}
