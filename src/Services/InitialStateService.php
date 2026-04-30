<?php

namespace App\Services;

use App\Entity\Course;
use App\Entity\User;
use App\Services\UtilityService;

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

        $lang = $_ENV['DEFAULT_LANG'] ?? 'en';
        $lang = !empty($metadata['lang']) ? $metadata['lang'] : $lang;
        $lang = array_key_exists('lang', $preferences) ? $preferences['lang'] : $lang;

        return [
            'textSpacing'       => $preferences['textSpacing'] ?? null,
            'fontSize'          => $preferences['fontSize'] ?? null,
            'fontFamily'        => $preferences['fontFamily'] ?? null,
            'darkMode'          => $preferences['darkMode'] ?? null,
            'alertTimeout'      => $preferences['alertTimeout'] ?? null,
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