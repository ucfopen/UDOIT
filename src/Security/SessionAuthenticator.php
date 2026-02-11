<?php

namespace App\Security;

use App\Entity\User; // your user entity
use App\Services\SessionService;
use App\Services\UtilityService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\PassportInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

class SessionAuthenticator extends AbstractAuthenticator
{
    private $request;
    private $router;
    private $em;

    /** @var SessionService $sessionService */
    private $sessionService;

    /** @var UtilityService $util */
    private $util;

    public function __construct(
        RequestStack $requestStack,
        EntityManagerInterface $em,
        UtilityService $util,
        SessionService $sessionService)
    {
        $this->request = $requestStack->getCurrentRequest();
        $this->util = $util;
        $this->em = $em;
        $this->sessionService = $sessionService;
    }

    public function supports(Request $request): ?bool
    {
        return $this->sessionService->hasSession();
    }



    public function onAuthenticationSuccess(Request $request, TokenInterface $token, $providerKey): ?Response
    {
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return null;
    }

    public function start(Request $request, ?AuthenticationException $exception = null)
    {
        return new Response('authentication failed');
    }

    public function supportsRememberMe()
    {

    }

    public function authenticate(Request $request): Passport
    {
        $session = $this->sessionService->getSession();
        $userId = $session->get('userId');

        if (!$userId) {
            throw new CustomUserMessageAuthenticationException('No user found.');
        }
        $user = $this->em->getRepository(User::class)->find($userId);

        if (!$user) {
            throw new CustomUserMessageAuthenticationException('No user found.');
        }

        $username = $user->getUsername();

        return new SelfValidatingPassport(new UserBadge($username));
    }
}

