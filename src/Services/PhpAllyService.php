<?php

namespace App\Services;

use App\Entity\ContentItem;
use CidiLabs\PhpAlly\PhpAlly;

class PhpAllyService {
    
    protected $phpAlly;
    
    public function __construct()
    {
        $this->phpAlly = new PhpAlly();    
    }

    public function scanContentItem(ContentItem $contentItem)
    {
        $html = $contentItem->getBody();
        if (!$html) {
            return;
        }

        $ruleIds = $this->getRules();
        
        return $this->phpAlly->checkMany($html, $ruleIds);
    }

    public function scanHtml($html)
    {
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