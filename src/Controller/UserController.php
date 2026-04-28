<?php

namespace App\Controller;

use App\Entity\User;
use App\Response\ApiResponse;
use App\Services\SessionService;
use App\Services\UtilityService;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Console\Output\ConsoleOutput;

class UserController extends AbstractController
{
    private ManagerRegistry $doctrine;

    /** @var UtilityService $util */
    private $util;

    public function __construct(ManagerRegistry $doctrine)
    {
        $this->doctrine = $doctrine;
    }

    #[Route('/api/users/{user}/preferences', name: 'user_preferences_patch',  methods: ['PATCH'])]
    public function update(SessionService $sessionService, User $user, Request $request, UtilityService $util): JsonResponse
    {
        $apiResponse = new ApiResponse();
        $output = new ConsoleOutput();
        $responseObject = null;
        
        try {
            // Check if user is updating their own info
            $userIdFromSession = $sessionService->getSession()->get('userId');

            $output->writeln(json_encode($userIdFromSession));
            $output->writeln(json_encode($user->getId()));
            if ($user->getId() !== $userIdFromSession) {
                throw new \Exception("msg.no_permissions");
            }

            $userVals = \json_decode($request->getContent(), true);

            
            $oldPreferences = $user->getPreferences();
            $oldLang = $oldPreferences['lang'] ?? 'en';
            

            // Preference IDs on the client differ from DB column names, so we must translate
            $preferenceMap = [
                'textSpacing' => 'text_spacing',
                'fontSize' => 'font_size',
                'fontFamily' => 'font_family',
                'darkMode' => 'dark_mode',
                'alertTimeout' => 'alert_timeout',
                'dailyGoal' => 'daily_goal',
                'showFilters' => 'show_filters',
                'viewOnlyPublished' => 'view_only_published',
                'lang' => 'lang'
            ];

            $newPreferences = $oldPreferences;
            
            foreach($userVals as $preferenceKey => $preferenceVal)
            {
                if (!isset($preferenceMap[$preferenceKey])) continue;
                $newKey = $preferenceMap[$preferenceKey];
                $newPreferences[$newKey] = $preferenceVal;
            }
        

            $changeLang = (!empty($newPreferences['lang']) && $oldLang !== $newPreferences['lang']);

            $user->setPreferences($newPreferences);

            $responseObject = [
                'user' => $user,
                'labels' => NULL,
            ];

            if ($changeLang) {
                $this->util = $util;
                $labels = $this->util->getTranslation($newPreferences['lang']);
                $responseObject['labels'] = $labels;
            }

            $this->doctrine->getManager()->flush();

            $apiResponse->setData($responseObject);
        }
        catch (\Exception $e) {
            $apiResponse->addError($e->getMessage());
        }

        if ($responseObject === null) {
            return new JsonResponse($apiResponse);
        }

        return new JsonResponse($responseObject);
    }
}
