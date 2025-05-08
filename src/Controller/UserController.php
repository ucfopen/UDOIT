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
        $lang = 'en';

        if (isset($userVals['roles'])) {
            $user->setRoles($userVals['roles']);
            if(isset($userVals['roles']['lang'])) {
                $lang = $userVals['roles']['lang'];
            }
        }

        if (empty($userVals['hasApiKey'])) {
            $user->setApiKey('');
            $user->setRefreshToken('');
        }

        $this->util = $util;
        $labels = $this->util->getTranslation($lang);

        $this->doctrine->getManager()->flush();

        $responseObject = [
            'user' => $user,
            'language' => $lang,
            'labels' => (array) $labels,
        ];

        return $this->json($responseObject);

        // return $this->json([
        //   'user' => $user,
        //   'language' => $lang,
        //   // 'labels' => (array) $labels,
        // ])
    }
}
