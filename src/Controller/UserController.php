<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class UserController extends AbstractController
{
    private ManagerRegistry $doctrine;

    public function __construct(ManagerRegistry $doctrine)
    {
        $this->doctrine = $doctrine;
    }

    #[Route('/api/users/{user}', name: 'user_put',  methods: ['PUT'])]
    public function update(User $user, Request $request): JsonResponse
    {
        $userVals = \json_decode($request->getContent(), true);

        if (isset($userVals['roles'])) {
            $user->setRoles($userVals['roles']);
        }

        if (empty($userVals['hasApiKey'])) {
            $user->setApiKey('');
            $user->setRefreshToken('');
        }

        $this->doctrine->getManager()->flush();

        return $this->json($user);
    }
}
