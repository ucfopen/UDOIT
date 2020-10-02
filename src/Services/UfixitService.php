<?php

namespace App\Services;

use App\Entity\ContentItem;
use App\Entity\Issue;
use zz\Html\HTMLMinify;

class UfixitService {

    /** @var LmsApiService $lmsApi */
    protected $lmsApi;

    /** @var UtilityService */
    protected $util;

    public function __construct(LmsApiService $lmsApi, UtilityService $util) 
    {
        $this->lmsApi = $lmsApi;
        $this->util = $util;
    }

    public function saveContentToLms(Issue $issue, $fixedHtml) 
    {
        $contentItem = $issue->getContentItem();
        $this->lmsApi->refreshContentItemFromLms($contentItem);
        $fixedBody = $this->replaceContent($issue, $fixedHtml);
        $contentItem->setBody($fixedBody);

        // Save file to temp folder
        if ('file' === $contentItem->getContentType()) {
            $success = $this->saveToTempFolder($contentItem);
            if (!$success) {
                $this->util->createMessage('Content failed to save locally. Please contact an administrator.',
                    'error', $contentItem->getCourse());
            }
        }

        return $this->lmsApi->postContentItemToLms($contentItem);
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

    protected function saveToTempFolder(ContentItem $contentItem)
    {
        $path = $this->util->getTempPath();

        return file_put_contents("{$path}/{$contentItem->getId()}", $contentItem->getBody());
    }
}
