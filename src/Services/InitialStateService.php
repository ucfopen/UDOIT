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
        $roles = $user->getRoles();
        $institution = $user->getInstitution();
        $metadata = $institution->getMetadata();

        $lang = $_ENV['DEFAULT_LANG'] ?? 'en';
        $lang = !empty($metadata['lang']) ? $metadata['lang'] : $lang;
        $lang = array_key_exists('lang', $roles) ? $roles['lang'] : $lang;

        return [
            'textSpacing'       => $roles['text_spacing'] ?? null,
            'fontSize'          => $roles['font_size'] ?? null,
            'fontFamily'        => $roles['font_family'] ?? null,
            'darkMode'          => $roles['dark_mode'] ?? null,
            'alertTimeout'      => $roles['alert_timeout'] ?? null,
            'dailyGoal'         => $roles['daily_goal'] ?? null,
            'showFilters'       => $roles['show_filters'] ?? null,
            'viewOnlyPublished' => $roles['view_only_published'] ?? null,
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
            'excludedRuleIds'  => !empty($metadata['excludedRuleIds'])
                                    ? $metadata['excludedRuleIds']
                                    : $_ENV['PHPALLY_EXCLUDED_RULES'],
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