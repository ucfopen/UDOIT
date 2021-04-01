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
        $html = HtmlService::clean($contentItem->getBody());
        if (!$html) {
            return;
        }
        
        return $this->phpAlly->checkMany($html, $this->getRules());
    }

    public function scanHtml($html, $rules = [])
    {
        $html = HtmlService::clean($html);

        if (empty($rules)) {
            $rules = $this->getRules();
        }
        
        return $this->phpAlly->checkMany($html, $rules);
    }

    public function getRules()
    {
        $allRules = $this->phpAlly->getRuleIds();

        $envExclusions = $this->getEnvExcludedRules();
        // $dbExclusions = $this->getDbExcludedRules();

        return array_values(array_diff($allRules, $envExclusions));
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