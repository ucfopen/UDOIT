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

        $options = [
            'backgroundColor' => !empty($_ENV['BACKGROUND_COLOR']) ? $_ENV['BACKGROUND_COLOR'] : '#ffffff',
            'textColor' => !empty($_ENV['TEXT_COLOR']) ? $_ENV['TEXT_COLOR'] : '#000000',
            'vimeoApiKey' => !empty($_ENV['VIMEO_API_KEY']) ? $_ENV['VIMEO_API_KEY'] : '',
            'youtubeApiKey' => !empty($_ENV['YOUTUBE_API_KEY']) ? $_ENV['YOUTUBE_API_KEY'] : ''
        ];

        return $this->phpAlly->checkMany($html, $this->getRules(), $options);
    }

    public function scanHtml($html, $rules = [])
    {
        $html = HtmlService::clean($html);

        if (empty($rules)) {
            $rules = $this->getRules();
        }

        $options = [
            'backgroundColor' => !empty($_ENV['BACKGROUND_COLOR']) ? $_ENV['BACKGROUND_COLOR'] : '#ffffff',
            'textColor' => !empty($_ENV['TEXT_COLOR']) ? $_ENV['TEXT_COLOR'] : '#000000',
            'vimeoApiKey' => !empty($_ENV['VIMEO_API_KEY']) ? $_ENV['VIMEO_API_KEY'] : '',
            'youtubeApiKey' => !empty($_ENV['YOUTUBE_API_KEY']) ? $_ENV['YOUTUBE_API_KEY'] : ''
        ];

        return $this->phpAlly->checkMany($html, $rules, $options);
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
        $excluded = array_map('trim', explode(',', $_ENV['PHPALLY_EXCLUDED_RULES']));

        return array_map(array($this, 'addRulePath'), $excluded);
    }

    protected function getDbExcludedRules()
    {
        // TODO: To be implemented with the admin section
        return [];
    }

    private function addRulePath($rule)
    {
        if (strpos($rule, '\\') === false) {
            return "CidiLabs\\PhpAlly\\Rule\\" . $rule;
        }

        return $rule;
    }
}
