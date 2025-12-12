<?php

namespace App\Controller;

use App\Entity\User;
use App\Services\UtilityService;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

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
    public function update(User $user, Request $request, UtilityService $util): JsonResponse
    {
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

        return $this->json($responseObject);
    }
}
