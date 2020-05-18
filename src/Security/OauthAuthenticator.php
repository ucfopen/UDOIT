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
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Guard\AbstractGuardAuthenticator;

class OauthAuthenticator extends AbstractGuardAuthenticator
{
    private $em;
    private $router;

    public function __construct(EntityManagerInterface $em, RouterInterface $router, UtilityService $util)
    {
        $this->em = $em;
        $this->router = $router;
        $this->util = $util;
    }

    public function supports(Request $request)
    {
        // continue ONLY if the current ROUTE matches the check ROUTE
        return $request->attributes->get('_route') === 'authorize';
    }

    public function getCredentials(Request $request)
    {
        return $request->request->all();
    }

    public function getUser($postParams, UserProviderInterface $userProvider)
    {
        if (empty($postParams)) {
            // TODO: add more extensive check
            $this->util->exitWithMessage('Authentication problem: No POST parameters were provided by the LMS.');
        }
        
        // verify we have the variables we need from the LTI launch
        $expect = ['oauth_consumer_key', 'custom_lms_api_domain', 'custom_lms_user_id'];
        foreach ($expect as $key) {
            if (empty($postParams[$key])) {
                $this->util->exitWithMessage('Missing LTI launch information. Missing: ' . $key);
            }
        }

        //$username = $this->getUserName();
        $lmsUserId = (isset($postParams['custom_lms_user_id'])) ? $postParams['custom_lms_user_id'] : false;
        $lmsDomain = (isset($postParams['custom_lms_api_domain'])) ? $postParams['custom_lms_api_domain'] : false;
        $consumerKey = (isset($postParams['oauth_consumer_key'])) ? $postParams['oauth_consumer_key'] : false;
        
        if (!$lmsUserId || !$lmsDomain || !$consumerKey) {
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
    }

    /**
     * No user or no API token, either way we need to go to 
     */
    public function onAuthenticationFailure(Request $request, AuthenticationException $exception) {}

    public function start(Request $request, AuthenticationException $exception = null) {}

    public function supportsRememberMe() {}
}