<?php

namespace App\Controller;

use App\Entity\FileItem;
use App\Entity\ContentItem;
use App\Response\ApiResponse;
use App\Services\LmsPostService;
use App\Services\LmsFetchService;
use App\Services\SessionService;
use App\Services\UtilityService;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
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
    public function reviewFile(SessionService $sessionService, Request $request, UtilityService $util, FileItem $file)
    {
        $apiResponse = new ApiResponse();
        $user = $this->getUser();
        $output = new ConsoleOutput();

        try {
            // Check if user has access to course
            $course = $file->getCourse();
            if (!$this->userHasCourseAccess($course, $sessionService)) {
                throw new \Exception("You do not have permission to access this issue.");
            }

            $updates = \json_decode($request->getContent(), true);
            $file->setReviewed($updates['reviewed']);
            if ($updates['replacement']){
                $file->removeReplacementFile();
            }
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
    public function postFile(SessionService $sessionService, Request $request, UtilityService $util, LmsPostService $lmsPost, LmsFetchService $lmsFetch, FileItem $file)
    {
        $output = new ConsoleOutput();
        $apiResponse = new ApiResponse();
        $user = $this->getUser();

        try {
            // Check if user has access to course
            $course = $file->getCourse();
            if (!$this->userHasCourseAccess($course, $sessionService)) {
                throw new \Exception("You do not have permission to access this issue.");
            }

            $uploadedFile = $request->files->get('file');

            // Save content to LMS
            $lmsResponse = $lmsPost->saveFileToLms($file, $uploadedFile, $user);
            $responseContent = $lmsResponse->getContent();

            $output->writeln(json_encode($responseContent, JSON_PRETTY_PRINT));


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
    #[Route('/api/{file}/content', methods: ['POST'], name: 'upload_content')]
    public function uploadContent(SessionService $sessionService, Request $request, UtilityService $util, LmsPostService $lmsPost, LmsFetchService $lmsFetch, FileItem $file){
        $output = new ConsoleOutput();
        $apiResponse = new ApiResponse();
        $user = $this->getUser();

        try{
            $content= \json_decode($request->getContent(), true);
            $contentOptions = $content['content'];
            $sectionOptions = $content['section'];

            if(empty($contentOptions) && empty($sectionOptions)){
                throw new \Exception("Tried to update content without any content avaliable");
            }

            $course = $file->getCourse();
            if (!$this->userHasCourseAccess($course, $sessionService)) {
                throw new \Exception("You do not have permission to access this issue.");
            }
            
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
    public function deleteFile(SessionService $sessionService, FileItem $file, UtilityService $util, LmsPostService $lmsPost, LmsFetchService $lmsFetch){
        $output = new ConsoleOutput();
        $apiResponse = new ApiResponse();
        $user = $this->getUser();

        try{
            $course = $file->getCourse();
            if (!$this->userHasCourseAccess($course, $sessionService)) {
                throw new \Exception("You do not have permission to access this issue.");
            }

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

    #[Route('/api/files/{file}/download', methods: ['GET'], name: 'download_file')]
    public function downloadFile(Request $request, FileItem $file): Response
    {
        $output = new ConsoleOutput();
        $url = $file->getDownloadUrl();
        $output->writeln("Attempting file download from URL: " . $url);

        // First, do a HEAD request to get Content-Length and check status
        $headCh = curl_init($url);
        curl_setopt($headCh, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($headCh, CURLOPT_NOBODY, true);
        curl_setopt($headCh, CURLOPT_RETURNTRANSFER, true);
        curl_exec($headCh);
        $httpCode = curl_getinfo($headCh, CURLINFO_HTTP_CODE);
        $contentLength = curl_getinfo($headCh, CURLINFO_CONTENT_LENGTH_DOWNLOAD);
        $contentType = curl_getinfo($headCh, CURLINFO_CONTENT_TYPE) ?: 'video/mp4';
        curl_close($headCh);

        if ($httpCode >= 400) {
            return new Response("Upstream error: HTTP $httpCode", $httpCode);
        }

        $headers = [
            'Content-Type' => $contentType,
        ];
        if ($contentLength > 0) {
            $headers['Content-Length'] = (int) $contentLength;
        }

        $response = new StreamedResponse(function () use ($url, $output) {
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
            curl_setopt($ch, CURLOPT_HEADER, false);
            curl_setopt($ch, CURLOPT_WRITEFUNCTION, function ($ch, $data) {
                echo $data;
                flush();
                return strlen($data);
            });

            $result = curl_exec($ch);
            if ($result === false) {
                $output->writeln("cURL error: " . curl_error($ch));
            }
            curl_close($ch);
        }, 200, $headers);

        return $response;
    }

    #[Route('/api/media/{mediaId}/tracks', methods: ['GET'], name: 'get_tracks')]
    public function getTracks(Request $request, LmsFetchService $lmsFetch) {
        $apiResponse = new ApiResponse();    
        try {
            $mediaId = $request->get('mediaId');
            $user = $this->getUser();
            $tracks = $lmsFetch->getMediaTracks($mediaId, $user);

            
            $apiResponse->setData([
                'tracks' => $tracks
            ]);
        }
        catch(\Exception $e) {
            $apiResponse->addError($e->getMessage());
        }

        return new JsonResponse($apiResponse);
    }

    #[Route('/api/media/{mediaId}/settracks', methods: ['POST'], name: 'set_tracks')]
    public function setTracks(Request $request, LmsPostService $lmsPost) {
        $mediaId = $request->get('mediaId');
        $user = $this->getUser();
        $apiResponse = new ApiResponse();

        try{
            $content= \json_decode($request->getContent(), true);
            $tracks = $content['tracks'];
            $response = $lmsPost->setMediaTracks($mediaId, $tracks, $user);
        }
        catch(\Exception $e){
            $apiResponse->addError($e->getMessage());
        }

        return new JsonResponse($apiResponse);
    }
}