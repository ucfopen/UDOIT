<?php

namespace App\Security;

use App\Entity\User; // your user entity
use App\Services\UtilityService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Security;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Guard\AbstractGuardAuthenticator;

class OauthAuthenticator extends AbstractGuardAuthenticator
{
    private $em;
    private $router;
    private $security;

    public function __construct(
        EntityManagerInterface $em,
        RouterInterface $router,
        UtilityService $util,
        Security $security
    ) {
        $this->em = $em;
        $this->router = $router;
        $this->util = $util;
        $this->security = $security;
    }

    public function supports(Request $request)
    {
        if(!$this->security->getUser()) {
            return false;
        }

        return true;
    }

    public function getCredentials(Request $request)
    {
        return $request->query->all();
    }

    public function getUser($postParams, UserProviderInterface $userProvider)
    {
        if (empty($postParams)) {
            // TODO: add more extensive check
            $this->util->exitWithMessage('Authentication problem: No POST parameters were provided by the LMS.');
        }

        // verify we have the variables we need from the LTI launch
        $expect = ['lms_api_domain', 'lms_user_id'];
        foreach ($expect as $key) {
            if (empty($postParams[$key])) {
                $this->util->exitWithMessage('Missing LTI launch information. Missing: ' . $key);
            }
        }

        //$username = $this->getUserName();
        $lmsUserId = (isset($postParams['lms_user_id'])) ? $postParams['lms_user_id'] : false;
        $lmsDomain = (isset($postParams['lms_api_domain'])) ? $postParams['lms_api_domain'] : false;
//        $consumerKey = (isset($postParams['oauth_consumer_key'])) ? $postParams['oauth_consumer_key'] : false;
        if (!$lmsUserId || !$lmsDomain) {
            return null;    
        }
        $userName = "{$lmsDomain}||{$lmsUserId}";

        return $this->em->getRepository(User::class)
            ->findOneBy(['username' => $userName]);
    }

    public function checkCredentials($postParams, UserInterface $user)
    {
        return !empty($user->getApiKey());
    }

    /**
     * Here we have a user with an API token, let's check that it's valid.
     */
    public function onAuthenticationSuccess(Request $request, TokenInterface $token, $providerKey)
    {
        $user = $token->getUser();
        $request->getSession()->set('userId', $user->getId());
        return null;
    }

    /**
     * No user or no API token, either way we need to go to 
     */
    public function onAuthenticationFailure(Request $request, AuthenticationException $exception) {}

    public function start(Request $request, AuthenticationException $exception = null) {}

    public function supportsRememberMe() {}
}