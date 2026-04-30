<?php

namespace App\Services;

use App\Entity\Course;
use App\Entity\User;
use App\Services\UtilityService;
use App\Constants\PreferenceConstants;

class InitialStateService
{

    /** @var UtilityService $util */
    protected $util;

    public function __construct(
        UtilityService $util,
    )
    {
        $this->util = $util;
    }

    public function getPreferences(User $user): array
    {
        $preferences = $user->getPreferences();
        $institution = $user->getInstitution();
        $metadata = $institution->getMetadata();

        $lang = $_ENV['DEFAULT_LANG'] ?? PreferenceConstants::DEFAULT_LANG;
        $lang = !empty($metadata['lang']) ? $metadata['lang'] : $lang;
        $lang = array_key_exists('lang', $preferences) ? $preferences['lang'] : $lang;
        
        return [
            'textSpacing'       => $preferences['textSpacing'] ?? PreferenceConstants::DEFAULT_TEXT_SPACING,
            'fontSize'          => $preferences['fontSize'] ?? PreferenceConstants::DEFAULT_FONT_SIZE,
            'fontFamily'        => $preferences['fontFamily'] ?? PreferenceConstants::DEFAULT_FONT_FAMILY,
            'darkMode'          => $preferences['darkMode'] ?? PreferenceConstants::DEFAULT_DARK_MODE,
            'alertTimeout'      => $preferences['alertTimeout'] ?? PreferenceConstants::DEFAULT_ALERT_TIMEOUT,
            'lang'              => $lang,
        ];
    }

    public function getInstanceInfo(User $user, $course = null): array
    {
        $institution = $user->getInstitution();
        $metadata = $institution->getMetadata();

        $backgroundColor = $metadata['backgroundColor'] ?? PreferenceConstants::DEFAULT_BACKGROUND_COLOR;
        $fontColor = $metadata['textColor'] ?? PreferenceConstants::DEFAULT_TEXT_COLOR;

        return [
            'apiUrl'           => !empty($_ENV['BASE_URL']) ? $_ENV['BASE_URL'] : false,
            'course'           => $course,
            'institution'      => $institution,
            'versionNumber'    => $_ENV['VERSION_NUMBER'] ?? '',
            'user' => [
                'id'       => $user->getId(),
                'username' => $user->getUserIdentifier(),
                'name'     => $user->getName(),
            ],
            'backgroundColor' => $backgroundColor,
            'textColor'       => $fontColor,
        ];
    }

    public function getLabels(array $preferences): array
    {
        return (array) $this->util->getTranslation($preferences['lang']);
    }
}