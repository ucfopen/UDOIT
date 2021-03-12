<?php

namespace App\Security;

use App\Entity\User; // your user entity
use App\Services\UtilityService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Guard\AbstractGuardAuthenticator;

class SessionAuthenticator extends AbstractGuardAuthenticator
{
    private $request;
    private $router;
    private $em;

    public function __construct(RequestStack $requestStack, EntityManagerInterface $em, UtilityService $util)
    {
        $this->request = $requestStack->getCurrentRequest();
        $this->util = $util;
        $this->em = $em;
    }

    public function supports(Request $request)
    {
        return !empty($request->getSession()->get('userId'));
    }

    public function getCredentials(Request $request)
    {
        return $request->getSession()->get('userId');
    }

    public function checkCredentials($credentials, UserInterface $user) 
    {
        return is_numeric($credentials);
    }

    public function getUser($userId, UserProviderInterface $userProvider)
    {
        return $this->em->getRepository(User::class)->find($userId);
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, $providerKey)
    {
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception) 
    {
        return null;
    }

    public function start(Request $request, AuthenticationException $exception = null) 
    {
        $data = [
            // you might translate this message
            'message' => 'Authentication Required'
        ];

        return new JsonResponse($data, Response::HTTP_UNAUTHORIZED);
    }

    public function supportsRememberMe()
    {

    }
}