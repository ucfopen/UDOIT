<?php
// src/MessageHandler/ScanMessageHandler.php
namespace App\MessageHandler;

use App\Entity\Issue;
use App\Entity\Course;
use App\Entity\ContentItem;
use App\Entity\User;
use App\Entity\FileItem;
use App\Entity\ProgressBar;
use App\Entity\Report;
use App\Entity\LogEntry;
use App\Lms\Canvas\CanvasApi;
use App\Message\ScanMessage;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Security\Core\Security;
use Doctrine\Persistence\ManagerRegistry;
use CidiLabs\PhpAlly\PhpAllyIssue;

use App\Services\PhpAllyService;

#[AsMessageHandler]
class ScanMessageHandler
{
    /** @var PhpAllyService $phpAllyService */
    private $phpAlly;

     /** @var ManagerRegistry $doctrine */
    protected $doctrine;

    /** @var Security $security */
    private $security;

    public function __construct(PhpAllyService $phpAlly, ManagerRegistry $doctrine, Security $security,) {
        $this->phpAlly = $phpAlly;
        $this->doctrine = $doctrine;
        $this->security = $security;
    }

    const ISSUE_TYPE_SUGGESTION = 'suggestion';
    const ISSUE_TYPE_ERROR = 'error';

    public function __invoke(ScanMessage $message)
    {   
        $contentItemRepo = $this->doctrine->getManager()->getRepository(ContentItem::class);
        $courseRepo = $this->doctrine->getManager()->getRepository(Course::class);
        $userRepo = $this->doctrine->getManager()->getRepository(User::class);
        $progressRepo = $this->doctrine->getManager()->getRepository(ProgressBar::class);
        $fileItemRepo = $this->doctrine->getManager()->getRepository(FileItem::class);

        $count = $progressRepo->count([]);

        if($count == 0) {
            $this->setUpProgressBar();
        }

        $course = $courseRepo->find($message->getCourse());
        $user = $userRepo->find($message->getUser());

        /* Step 1: Update content
        /* Update course status */
        $this->updateCourseData($course, $user);

        /* Mark content items as inactive */
        $contentItemRepo->setCourseContentInactive($course);
        $fileItemRepo->setCourseFileItemsInactive($course);
        $this->doctrine->getManager()->flush();

        /* Update content items from LMS */
        $this->updateCourseContent($course, $user);

        /* Step 2: Get list of changed content items */
        $contentItems = $contentItemRepo->getUpdatedContentItems($course);

        /* Step 3: Delete issues for updated content items */
        $this->deleteContentItemIssues($contentItems);

        /* Step 4: Process the updated content with PhpAlly and link to report */
        $this->scanContentItems($contentItems, $progressRepo);

        /* Step 5: Update report from all active issues */
        $this->updateReport($course, $user);

        /* Save last_updated date on course */
        $course->setLastUpdated(new \DateTime('now', new \DateTimeZone('GMT')));
        $course->setDirty(false);
        $this->doctrine->getManager()->flush();
    }

    public function createIssue(PhpAllyIssue $issue, ContentItem $contentItem)
    {
        $issueEntity = new Issue();
        $meta = $contentItem->getCourse()->getInstitution()->getMetadata();
        $issueType = self::ISSUE_TYPE_ERROR;

        if (isset($meta['SUGGESTION_RULES'])) {
            if (isset($meta['SUGGESTION_RULES'][$issue->getRuleId()])) {
                $issueType = self::ISSUE_TYPE_SUGGESTION;
            }
        }
        if (isset($_ENV['PHPALLY_SUGGESTION_RULES'])) {
            if (strpos($_ENV['PHPALLY_SUGGESTION_RULES'], $issue->getRuleId()) !== false) {
                $issueType = self::ISSUE_TYPE_SUGGESTION;
            }
        }

        $contentItemRepo = $this->doctrine->getManager()->getRepository(ContentItem::class);

        $item = $contentItemRepo->find($contentItem->getId());

        $issueEntity->setType($issueType);
        $issueEntity->setStatus(Issue::$issueStatusActive);
        $issueEntity->setContentItem($item);
        $issueEntity->setScanRuleId($issue->getRuleId());
        $issueEntity->setHtml($issue->getHtml());
        $issueEntity->setPreviewHtml($issue->getPreview());
        $issueEntity->setMetadata($issue->getMetadata());
        
        $contentItem->addIssue($issueEntity);
        $this->doctrine->getManager()->persist($issueEntity);
        return $issueEntity;
    }

    public function updateReport(Course $course, User $user): Report
    {
        $contentFixed = $contentResolved = $filesReviewed = $errors = $suggestions = 0;
        $scanRules = [];

        /** @var \App\Entity\ContentItem[] $contentItems */
        $contentItems = $course->getContentItems();

        foreach ($contentItems as $contentItem) {
            /** @var \App\Entity\Issue[] $issues */
            $issues = $contentItem->getIssues()->toArray();

            foreach ($issues as $issue) {
                if (Issue::$issueStatusFixed === $issue->getStatus()) {
                    $contentFixed++;
                } else if (Issue::$issueStatusResolved === $issue->getStatus()) {
                    $contentResolved++;
                } else {
                    if (Issue::$issueError === $issue->getType()) {
                        $errors++;
                    } else {
                        $suggestions++;
                    }
                }

                /* Scan rule data */
                $ruleId = $issue->getScanRuleId();
                if (!isset($scanRules[$ruleId])) {
                    $scanRules[$ruleId] = 0;
                }

                $scanRules[$ruleId]++;
            }
        }

        /** @var \App\Entity\FileItem[] $fileItems */
        $fileItems = $course->getFileItems();
        foreach ($fileItems as $file) {
            if ($file->getReviewed()) {
                $filesReviewed++;
            }
        }

        $latestReport = $course->getLatestReport();
        $now = new \DateTime('now', new \DateTimeZone('GMT'));

        if ($latestReport && ($now->format('m/d/y') === $latestReport->getCreated()->format('m/d/y'))) {
            $report = $latestReport;
        }
        else {
            $report = new Report();
            $report->setAuthor($user);
            $report->setCourse($course);
            $this->doctrine->getManager()->persist($report);
        }

        $report->setCreated($now);
        $report->setReady(false);
        $report->setErrors($errors);
        $report->setSuggestions($suggestions);
        $report->setContentFixed($contentFixed);
        $report->setContentResolved($contentResolved);
        $report->setFilesReviewed($filesReviewed);
        $report->setData(\json_encode(['scanRules' => $scanRules]));

        $this->doctrine->getManager()->flush();

        return $report;
    }

    private function scanContentItems(array $contentItems, $progressRepo) {
        // Scan each update content item for issues
        /** @var \App\Entity\ContentItem $contentItem */
        $issueIndex = 0;
        $progressBar = $progressRepo->findOneBy([], ['id' => 'ASC']); 
        $total = count($contentItems);
        $progressBar->setTotal($total);
        $progressBar->setTitle("Scanning course.");
        $this->doctrine->getManager()->persist($progressBar);
        $this->doctrine->getManager()->flush(); 
        foreach($contentItems as $contentItem) {
            try {
                $progressBar = $progressRepo->findOneBy([], ['id' => 'ASC']); 
                $issueIndex++; 
                $progressBar->setProgress($issueIndex);
                $this->doctrine->getManager()->persist($progressBar);
                $this->doctrine->getManager()->flush(); 
                // Scan Content Item with PHPAlly
                $phpAllyReport = $this->phpAlly->scanContentItem($contentItem);

                if ($phpAllyReport) {
                    // TODO: Do something with report errors
                    if (count($phpAllyReport->getErrors())) {
                        foreach ($phpAllyReport->getErrors() as $error) {
                            $msg = $error . ', item = #' . $contentItem->getId();
                            $this->createMessage($msg, 'error', $contentItem->getCourse(), null, true);
                        }
                    }

                    // Add Issues to report
                    foreach ($phpAllyReport->getIssues() as $issue) {
                        // Create issue entity
                        $this->createIssue($issue, $contentItem);
                    }
                }
            }
            catch (\Exception $e) {
                $this->util->createMessage($e->getMessage(), 'error', null, null, true);
            }
        }
        $entityManager = $this->doctrine->getManager();
        $this->doctrine->getManager()->flush();
    }

    public function deleteContentItemIssues($contentItems)
    {
        /** @var \App\Repository\IssueRepository $issueRepo */
        $issueRepo = $this->doctrine->getManager()->getRepository(Issue::class);

        foreach ($contentItems as $contentItem) {
            $issueRepo->deleteContentItemIssues($contentItem);
        }
    }

    public function setUpProgressBar() {
        $progressRepo = $this->doctrine->getManager()->getRepository(ProgressBar::class);
        $entity = new ProgressBar();
        $entity->setProgress(0);
        $entity->setTotal(0);
        $this->doctrine->getManager()->persist($entity);
        $this->doctrine->getManager()->flush();
    }

    public function createMessage($msg, $severity = 'info', Course $course = null, User $user = null, $hideFromUser = false)
    {
        if (!$user) {
            $user = $this->security->getUser();
        }

        if (is_array($msg) || is_object($msg)) {
            $msg = \json_encode($msg);
        }
        
        $message = new LogEntry();
        $message->setMessage($msg);
        $message->setSeverity($severity);
        $message->setUser($user);
        $message->setStatus($hideFromUser);
        $message->setCreated(new \DateTime('now', new \DateTimeZone('GMT')));
        
        if ($course) {
            $message->setCourse($course);
        }

        $this->doctrine->getManager()->persist($message);
        $this->doctrine->getManager()->flush();
    }

    // Get content from Canvas and update content items
    public function updateCourseContent(Course $course, User $user): array
    {
        $content = $contentItems = [];
        $urls = $this->getCourseContentUrls($course->getLmsCourseId());
        $apiDomain = $this->getApiDomain($user);
        $apiToken = $this->getApiToken($user);
        $entityManager = $this->doctrine->getManager();
        $contentItemRepo = $entityManager->getRepository(ContentItem::class);
        $progressRepo = $this->doctrine->getManager()->getRepository(ProgressBar::class);
        $progressBar = $progressRepo->findOneBy([], ['id' => 'ASC']); 

        $canvasApi = new CanvasApi($apiDomain, $apiToken);
        $itemIndex = 0;

        foreach ($urls as $contentType => $url) {
            $response = $canvasApi->apiGet($url);
            if ($response->getErrors()) {
                $this->util->createMessage('Error retrieving content. Failed API Call: ' . $url, 'error', $course, $user);
            }
            else {
                if ('syllabus' === $contentType) {
                    $contentList = [$response->getContent()];
                }
                else {
                    $contentList = $response->getContent();
                }

                foreach ($contentList as $content) {
                    $progressBar = $progressRepo->findOneBy([], ['id' => 'ASC']); 
                    $itemIndex++;
                    $progressBar->setProgress($itemIndex);
                    $progressBar->setTitle("Getting content from Canvas");
                    $entityManager->persist($progressBar);
                    $entityManager->flush();
                    if (('file' === $contentType) && (in_array($content['mime_class'], $this->getUnscannableFileMimeClasses()))) {
                        $this->updateFileItem($course, $content);
                        continue;
                    }

                    /* Quizzes should not be counted as assignments */
                    if (('assignment' === $contentType) && isset($content['quiz_id'])) {
                        continue;
                    }
                    /* Discussion topics set as assignments should be skipped */
                    if (('assignment' === $contentType) && isset($content['discussion_topic'])) {
                        continue;
                    }

                    $lmsContent = $this->normalizeLmsContent($course, $contentType, $content);
                    if (!$lmsContent) {
                        continue;
                    }

                    /* get page content */
                    if ('page' === $contentType) {
                        $url = "courses/{$course->getLmsCourseId()}/pages/{$lmsContent['id']}";
                        $pageResponse = $canvasApi->apiGet($url);
                        $pageObj = $pageResponse->getContent();

                        if (!empty($pageObj['body'])) {
                            $lmsContent['body'] = $pageObj['body'];
                        }
                    }

                    /* get HTML file content */
                    if (('file' === $contentType) && ('html' === $content['mime_class'])) {
                        $lmsContent['body'] = file_get_contents($content['url']);
                    }
                    
                    $contentItem = $contentItemRepo->findOneBy([
                        'contentType' => $contentType,
                        'lmsContentId' => $lmsContent['id'],
                        'course' => $course,
                    ]);

                    if (!$contentItem) {
                        $contentItem = new ContentItem();
                        $contentItem->setCourse($course)
                            ->setLmsContentId($lmsContent['id'])
                            ->setActive(true)
                            ->setUpdated(new \DateTime('now', new \DateTimeZone('GMT')))
                            ->setContentType($contentType);
                        $entityManager->persist($contentItem);
                    }

                    // some content types don't have an updated date, so we'll compare content
                    // to find out if content has changed.
                    if (in_array($contentType, ['syllabus', 'discussion_topic', 'announcement', 'quiz'])) {
                        if ($contentItem->getBody() === $lmsContent['body']) {
                            if ($contentItem->getUpdated()) {
                                $lmsContent['updated'] = $contentItem->getUpdated()->format('c');
                            }
                        }
                    }

                    $contentItem->update($lmsContent);
                    $contentItems[] = $contentItem;
                }
            }
        }

        // push any updates made to content items to DB
        $entityManager->flush();

        return $contentItems;
    }

    public function updateCourseData(Course $course, User $user)
    {
        $url = "courses/{$course->getLmsCourseId()}?include[]=term";
        $apiDomain = $this->getApiDomain($user);
        $apiToken = $this->getApiToken($user);
        $entityManager = $this->doctrine->getManager();

        $canvasApi = new CanvasApi($apiDomain, $apiToken);
        $response = $canvasApi->apiGet($url);

        if (!$response || !empty($response->getErrors())) {
            foreach ($response->getErrors() as $error) {
                $this->util->createMessage($error, 'error', $course, $user);
            }
            return;
        }
        $content = $response->getContent();

        $course->setTitle($content['name']);
        $course->setLmsAccountId($content['account_id']);
        $course->setActive(true);

        if (isset($content['term']['id'])) {
            $course->setLmsTermId($content['term']['id']);
        }

        $entityManager->flush();
    }


    /**********************
     * PROTECTED FUNCTIONS
     **********************/

    protected function getCourseContentUrls($courseId)
    {
        return [
            'syllabus' =>           "courses/{$courseId}?include[]=syllabus_body",
            'announcement' =>       "courses/{$courseId}/discussion_topics?only_announcements=true",
            'assignment' =>         "courses/{$courseId}/assignments",
            'discussion_topic' =>   "courses/{$courseId}/discussion_topics",
            'file' =>               "courses/{$courseId}/files",
            'module' =>             "courses/{$courseId}/modules?include[]=items",
            'page' =>               "courses/{$courseId}/pages",
            'quiz' =>               "courses/{$courseId}/quizzes",
        ];
    }

    protected function getApiDomain(User $user)
    {
        $institution = $user->getInstitution();

        return $institution->getLmsDomain();
    }

    protected function getApiToken(User $user)
    {
        return $user->getApiKey();
    }

    protected function normalizeLmsContent(Course $course, $contentType, $lmsContent)
    {
        $out = [];
        $domainName = $course->getInstitution()->getLmsDomain();
        $baseUrl = "https://{$domainName}/courses/{$course->getLmsCourseId()}";

        switch ($contentType) {
            case 'syllabus':
                $out['id'] = $lmsContent['id'];
                $out['title'] = $lmsContent['name'];
                $out['updated'] = 'now';
                $out['status'] = false;
                $out['url'] = "{$baseUrl}/assignments/syllabus";

                if (array_key_exists('syllabus_body', $lmsContent)) {
                    $out['body'] = $lmsContent['syllabus_body'];
                    $out['status'] = true;
                }

                break;

            case 'page':
                $out['id'] = $lmsContent['url'];
                $out['title'] = $lmsContent['title'];
                $out['updated'] = $lmsContent['updated_at'];
                $out['body'] = (!empty($lmsContent['body'])) ? $lmsContent['body'] : '';
                $out['status'] = $lmsContent['published'];
                $out['url'] = "{$baseUrl}/pages/{$lmsContent['url']}";

                break;

            case 'assignment':
                $out['id'] = $lmsContent['id'];
                $out['title'] = $lmsContent['name'];
                $out['updated'] = $lmsContent['updated_at'];
                $out['body'] = $lmsContent['description'];
                $out['status'] = $lmsContent['published'];
                $out['url'] = "{$baseUrl}/assignments/{$lmsContent['id']}";

                break;

            case 'discussion_topic':
            case 'announcement':
                $out['id'] = $lmsContent['id'];
                $out['title'] = $lmsContent['title'];
                $out['updated'] = 'now';
                $out['body'] = $lmsContent['message'];
                $out['status'] = $lmsContent['published'];
                $out['url'] = "{$baseUrl}/discussion_topics/{$lmsContent['id']}";

                break;

            case 'module':
                if (!isset($lmsContent['items'])) {
                    break;
                }

                $out['id'] = $lmsContent['id'];
                $out['title'] = $lmsContent['name'];
                $out['updated'] = 'now';

                $body = '';
                foreach ($lmsContent['items'] as $item) {
                    if ('ExternalUrl' !== $item['type']) {
                        break;
                    }
                    $body .= "<p><a data-type-module href='{$item['external_url']}'>{$item['title']}</a></p>";
                }

                $out['body'] = $body;
                $out['status'] = $lmsContent['published'];
                $out['url'] = "{$baseUrl}/modules";

                break;

            case 'file':
                if ('html' !== $lmsContent['mime_class']) {
                    break;
                }

                $out['id'] = $lmsContent['id'];
                $out['title'] = $lmsContent['display_name'];
                $out['updated'] = $lmsContent['updated_at'];
                $out['body'] = '';
                $out['status'] = !$lmsContent['hidden'];
                $out['url'] = "{$baseUrl}/files?preview={$lmsContent['id']}";

                if (isset($lmsContent['mime_class'])) {
                    $out['fileType'] = $lmsContent['mime_class'];
                }

                break;

            case 'quiz':
                $out['id'] = $lmsContent['id'];
                $out['title'] = $lmsContent['title'];
                $out['updated'] = 'now';
                $out['body'] = $lmsContent['description'];
                $out['status'] = $lmsContent['published'];
                $out['url'] = "{$baseUrl}/quizzes/{$lmsContent['id']}";

                break;
        }

        return $out;
    }

    protected function getUnscannableFileMimeClasses()
    {
        return [
            'pdf',
            'ppt',
            'doc',
            'xls',
        ];
    }

        public function updateContentItem(ContentItem $contentItem)
    {
        $user = $this->security->getUser();
        $apiDomain = $this->getApiDomain($user);
        $apiToken = $this->getApiToken($user);
        $url = $this->getContentTypeUrl($contentItem);
        $entityManager = $this->doctrine->getManager();
        $contentType = $contentItem->getContentType();

        $canvasApi = new CanvasApi($apiDomain, $apiToken);

        $response = $canvasApi->apiGet($url);

        if ($response->getErrors()) {
            $log = '';
            foreach ($response->getErrors() as $err) {
                $log .= ' | Msg: ' . $err;
            }

            $this->util->createMessage('Error retrieving content. Please try again.', 'error', $contentItem->getCourse(), $user);
            $this->util->createMessage($log, 'error', $contentItem->getCourse(), $user, true);
        }
        else {
            $apiContent = $response->getContent();
            $lmsContent = $this->normalizeLmsContent($contentItem->getCourse(), $contentType, $apiContent);

            /* get HTML file content */
            if ('file' === $contentType) {
                if ('html' === $apiContent['mime_class']) {
                    $lmsContent['body'] = file_get_contents($apiContent['url']);
                }
            }

            $contentItem->update($lmsContent);
            $entityManager->flush();
        }
    }

    protected function updateFileItem(Course $course, $file)
    {
        $fileItemRepo = $this->doctrine->getManager()->getRepository(FileItem::class);
        $entityManager = $this->doctrine->getManager();
        $fileItem = $fileItemRepo->findOneBy([
            'lmsFileId' => $file['id'],
            'course' => $course,
        ]);

        if (!$fileItem) {
            $fileItem = new FileItem();
            $fileItem->setCourse($course)
                ->setFileName($file['filename'])
                ->setFileType($file['mime_class'])
                ->setLmsFileId($file['id'])
                ->setDownloadUrl($file['url'])
                ->setActive(true);
            $entityManager->persist($fileItem);
        }

        $domainName = $course->getInstitution()->getLmsDomain();
        $lmsUrl = "https://{$domainName}/courses/{$course->getLmsCourseId()}/files?preview={$file['id']}";
        $fileItem->setLmsUrl($lmsUrl);

        // normalize file keys
        $file['fileName'] = $file['filename'];
        $file['fileType'] = $file['mime_class'];
        $file['status'] = !$file['locked'];
        $file['fileSize'] = $file['size'];
        $file['updated'] = $file['updated_at'];

        $fileItem->update($file);
        $entityManager = $this->doctrine->getManager();
        $entityManager->flush();
    }

}
