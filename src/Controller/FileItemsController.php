<?php

namespace App\Controller;

use App\Entity\FileItem;
use App\Response\ApiResponse;
use App\Services\LmsPostService;
use App\Services\UtilityService;
use App\Services\LmsApiService;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Console\Output\ConsoleOutput;

class FileItemsController extends ApiController
{
    private ManagerRegistry $doctrine;
    private LmsApiService $lmsApi;

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
        $apiResponse = new ApiResponse();
        $user = $this->getUser();
        $output = new ConsoleOutput();
   
        try {
            // Check if user has access to course
            $course = $file->getCourse();
            if (!$this->userHasCourseAccess($course)) {
                throw new \Exception("You do not have permission to access this issue.");
            }

            $uploadedFile = $request->files->get('file');
            $stringIndication = $request->request->get('references'); // This gets the reference indication as a string of "true" or "false"
            $userIndicateRef = false;
            if($stringIndication == "true"){
                $userIndicateRef = true;
            }

            // Save content to LMS
            $lmsResponse = $lmsPost->saveFileToLms($file, $uploadedFile, $user, $userIndicateRef);

            // Exclusive to canvas for now - Make a new file and add to the DB
            $content = $lmsResponse->getContent(); // LMS content gotten from LMS object
            $file->setActive(false); // Current file not active anymore
            $file->setReviewed(true); 
            $file->setReviewedBy($user); 
            $file->setReviewedOn($util->getCurrentTime());


            $newFile = new FileItem();
            $newFile->setCourse($course)
                    ->setFileName($content['display_name'])
                    ->setFileType($content['mime_class'])
                    ->setLmsFileId($content['id'])
                    ->setDownloadUrl($content['url'])
                    ->setActive(true); 
                $this->doctrine->getManager()->persist($newFile);
            $domainName = $course->getInstitution()->getLmsDomain();
            $lmsUrl = "https://{$domainName}/courses/{$course->getLmsCourseId()}/files?preview={$content['id']}";
            $newFile->setLmsUrl($lmsUrl);
            // normalize file keys

            $content['fileName'] = $content['display_name'];
            $content['fileType'] = $content['mime_class'];
            $content['status'] = !$content['locked'];
            $content['fileSize'] = $content['size'];
            $content['updated'] = $content['updated_at'];

            $newFile->update($content);
            $newFile->setReviewed(true); // Prematurely reviewed
            $newFile->setReviewedBy($user); 
            $newFile->setReviewedOn($util->getCurrentTime());
            // Update report stats
            $report = $course->getUpdatedReport();
            $output->writeln("Report: ");
            $output->writeln(json_encode($report, JSON_PRETTY_PRINT));
            // Update the file in data
            $this->doctrine->getManager()->flush();

            // Create response
            $apiResponse->setData($newFile);
            $apiResponse->addMessage('form.msg.success_replaced', 'success', 5000);
            $apiResponse->addLogMessages($util->getUnreadMessages());
           

        } catch (\Exception $e) {
            $apiResponse->addError($e->getMessage());
        }

        return new JsonResponse($apiResponse);
    }
}
