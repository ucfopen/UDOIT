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

    #[Route('/api/users/{user}', name: 'user_put',  methods: ['PUT'])]
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

            
            $oldRoles = $user->getRoles();
            $oldLang = $oldRoles['lang'] ?? 'en';
            
            $newRoles = $userVals['roles'] ?? [];
            $newLang = $newRoles['lang'] ?? 'en';

            $changeLang = ($oldLang !== $newLang);

            $user->setRoles($newRoles);
            if (empty($userVals['hasApiKey'])) {
            $user->setApiKey('');
            $user->setRefreshToken('');
            }

            $responseObject = [
                'user' => $user,
                'language' => $newLang,
                'labels' => [],
            ];

            if ($changeLang) {
                $this->util = $util;
                $labels = $this->util->getTranslation($newLang);
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
