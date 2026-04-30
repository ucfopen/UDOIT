<?php

namespace App\Services;

use App\Entity\Course;
use App\Entity\User;
use App\Services\UtilityService;

class InitialStateService
{

    final protected $DEFAULT_TEXT_SPACING = '0';
    final protected $DEFAULT_FONT_SIZE = 'font-medium';
    final protected $DEFAULT_FONT_FAMILY = 'sans-serif';
    final protected $DEFAULT_DARK_MODE = false;
    final protected $DEFAULT_ALERT_TIMEOUT = '5000';
    final protected $DEFAULT_LANG = 'en';

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

        $lang = $_ENV['DEFAULT_LANG'] ?? $this->DEFAULT_LANG;
        $lang = !empty($metadata['lang']) ? $metadata['lang'] : $lang;
        $lang = array_key_exists('lang', $preferences) ? $preferences['lang'] : $lang;

        return [
            'textSpacing'       => $preferences['textSpacing'] ?? $this->DEFAULT_TEXT_SPACING,
            'fontSize'          => $preferences['fontSize'] ?? $this->DEFAULT_FONT_SIZE,
            'fontFamily'        => $preferences['fontFamily'] ?? $this->DEFAULT_FONT_FAMILY,
            'darkMode'          => $preferences['darkMode'] ?? $this->DEFAULT_DARK_MODE,
            'alertTimeout'      => $preferences['alertTimeout'] ?? $this->DEFAULT_ALERT_TIMEOUT,
            'lang'              => $lang,
        ];
    }

    public function getInstanceInfo(User $user, $course = null): array
    {
        $institution = $user->getInstitution();
        $metadata = $institution->getMetadata();

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
        ];
    }

    public function getLabels(array $preferences): array
    {
        return (array) $this->util->getTranslation($preferences['lang']);
    }

    public function getFormOptions(): array
    {
        return [
            'backgroundColor' => !empty($_ENV['BACKGROUND_COLOR']) ? $_ENV['BACKGROUND_COLOR'] : '#ffffff',
            'textColor'       => !empty($_ENV['TEXT_COLOR']) ? $_ENV['TEXT_COLOR'] : '#000000',
        ];
    }
}