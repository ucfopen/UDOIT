<?php

namespace App\Services;

use App\Entity\ContentItem;
use CidiLabs\PhpAlly\PhpAlly;

class PhpAllyService {
    
    protected $phpAlly;

    /** @var App\Service\HtmlService */
    protected $htmlService;

    protected $util;
    
    public function __construct(HtmlService $htmlService, UtilityService $util)
    {
        $this->phpAlly = new PhpAlly();    
        $this->htmlService = $htmlService;
        $this->util = $util;
    }

    public function scanContentItem(ContentItem $contentItem)
    {
        $html = $contentItem->getBody();
        if (!$html) {
            return;
        }

        if (!$this->htmlService->isValid($html)) {
            $html = $this->htmlService->tidy($html);
        }

        $ruleIds = $this->getRules();
        
        return $this->phpAlly->checkMany($html, $ruleIds);
    }

    public function scanHtml($html)
    {
        if (!$this->htmlService->isValid($html)) {
            $html = $this->htmlService->tidy($html);
        }
        
        return $this->phpAlly->checkMany($html, $this->getRules());
    }

    public function getRules()
    {
        $allRules = $this->phpAlly->getRuleIds();

        $envExclusions = $this->getEnvExcludedRules();
        $dbExclusions = $this->getDbExcludedRules();

        return array_values(array_diff($allRules, $envExclusions, $dbExclusions));
    }

    protected function getEnvExcludedRules()
    {
        return array_map('trim', explode(',', $_ENV['PHPALLY_EXCLUDED_RULES']));
    }

    protected function getDbExcludedRules()
    {
        // TODO: To be implemented with the admin section
        return ['VideoCaptionsMatchCourseLanguage', 'VideoEmbedCheck', 'VideoProvidesCaptions', 'VideosEmbeddedOrLinkedNeedCaptions'];
    }
}