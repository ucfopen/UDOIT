<?php

namespace App\Services;

use App\Entity\Course;
use App\Entity\User;
use App\Services\UtilityService;

class InitialStateService
{

    protected const DEFAULT_TEXT_SPACING = '0';
    protected const DEFAULT_FONT_SIZE = 'font-medium';
    protected const DEFAULT_FONT_FAMILY = 'sans-serif';
    protected const DEFAULT_DARK_MODE = false;
    protected const DEFAULT_ALERT_TIMEOUT = '5000';
    protected const DEFAULT_LANG = 'en';
    protected const DEFAULT_BACKGROUND_COLOR = '#ffffff';
    protected const DEFAULT_TEXT_COLOR = '#000000';


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

        $lang = $_ENV['DEFAULT_LANG'] ?? self::DEFAULT_LANG;
        $lang = !empty($metadata['lang']) ? $metadata['lang'] : $lang;
        $lang = array_key_exists('lang', $preferences) ? $preferences['lang'] : $lang;
        
        return [
            'textSpacing'       => $preferences['textSpacing'] ?? self::DEFAULT_TEXT_SPACING,
            'fontSize'          => $preferences['fontSize'] ?? self::DEFAULT_FONT_SIZE,
            'fontFamily'        => $preferences['fontFamily'] ?? self::DEFAULT_FONT_FAMILY,
            'darkMode'          => $preferences['darkMode'] ?? self::DEFAULT_DARK_MODE,
            'alertTimeout'      => $preferences['alertTimeout'] ?? self::DEFAULT_ALERT_TIMEOUT,
            'lang'              => $lang,
        ];
    }

    public function getInstanceInfo(User $user, $course = null): array
    {
        $institution = $user->getInstitution();
        $metadata = $institution->getMetadata();

        $backgroundColor = $metadata['backgroundColor'] ?? self::DEFAULT_BACKGROUND_COLOR;
        $fontColor = $metadata['textColor'] ?? self::DEFAULT_TEXT_COLOR;

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