<?php

namespace App\Services;

use App\Entity\ContentItem;
use App\Entity\FileItem;
use App\Entity\Issue;
use App\Services\LmsApiService;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use zz\Html\HTMLMinify;

class LmsPostService {

    /** @var App\Services\LmsApiService $lmsApi */
    protected $lmsApi;

    /** @var App\Services\UtilityService $util */
    protected $util;

    public function __construct(LmsApiService $lmsApi, UtilityService $util)
    {
        $this->lmsApi = $lmsApi;        
        $this->util = $util;
    }

    public function saveContentToLms(Issue $issue, $fixedHtml)
    {
        $contentItem = $issue->getContentItem();
        $lms = $this->lmsApi->getLms();
        $lms->updateContentItem($contentItem);

        $fixedBody = $this->replaceContent($issue, $fixedHtml);
        $contentItem->setBody($fixedBody);

        // Save file to temp folder
        if ('file' === $contentItem->getContentType()) {
            $path = $this->util->getTempPath();
            $success = file_put_contents("{$path}/content.{$contentItem->getId()}", $contentItem->getBody());

            if (!$success) {
                $this->util->createMessage(
                    'Content failed to save locally. Please contact an administrator.',
                    'error',
                    $contentItem->getCourse()
                );
            }
        }

        return $lms->postContentItem($contentItem);
    }

    public function saveFileToLms(FileItem $file, UploadedFile $uploadedFile)
    {
        $lms = $this->lmsApi->getLms();
        $path = $this->util->getTempPath();

        try {
            $uploadedFile->move($path, "file.{$file->getId()}");
        }
        catch (\Exception $e) {
            $this->util->createMessage(
                'File failed to save locally. Please contact an administrator.',
                'error',
                $file->getCourse()
            );
            return;
        }

        return $lms->postFileItem($file);
    }

    public function replaceContent(Issue $issue, $fixedHtml)
    {
        $contentItem = $issue->getContentItem();
        $annoyingEntities = ["\r", "&nbsp;", "&amp;", "%2F", "%22", "&lt;", "&gt;", "&quot;", "&lsquo;", "&rsquo;", "&sbquo;", "&ldquo;", "&rdquo;", "&bdquo;"];;
        $entityReplacements = ["", " ", "&", "/", "", "<", ">", "\"", "‘", "’", "‚", "“", "”", "„"];

        $minifyOptions = [
            'doctype' => HTMLMinify::DOCTYPE_HTML5,
            'optimizationLevel' => HTMLMinify::OPTIMIZATION_ADVANCED,
            'removeDuplicateAttribute' => false,
        ];

        $error      = HTMLMinify::minify(str_replace($annoyingEntities, $entityReplacements, $issue->getHtml()), $minifyOptions);
        $corrected  = HTMLMinify::minify(str_replace($annoyingEntities, $entityReplacements, $fixedHtml), $minifyOptions);
        $html       = HTMLMinify::minify(str_replace($annoyingEntities, $entityReplacements, htmlentities(html_entity_decode($contentItem->getBody()))), $minifyOptions);

        $cnt = 0;
        $out = str_replace($error, $corrected, html_entity_decode($html), $cnt);

        if (!$cnt) {
            $this->util->createMessage('No replacement occurred. Issue #' . $issue->getId(), 'error', $contentItem->getCourse());
        }

        return $out;
    }
}