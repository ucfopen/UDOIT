<?php

namespace App\Security;

use App\Entity\User; // your user entity
use App\Services\UtilityService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Guard\AbstractGuardAuthenticator;

class DevAuthenticator extends AbstractGuardAuthenticator
{
    private $request;
    private $router;

    public function __construct(RequestStack $requestStack, UtilityService $util)
    {
        $this->request = $requestStack->getCurrentRequest();
        $this->util = $util;
    }

    public function supports(Request $request)
    {
        return UtilityService::ENV_DEV === $request->server->get('APP_ENV');
    }

    public function getCredentials(Request $request)
    {
        return $request->server->get('APP_ENV');
    }

    public function checkCredentials($credentials, UserInterface $user) 
    {
        return true;
    }

    public function getUser($credentials, UserProviderInterface $userProvider)
    {
        // if (UtilityService::CANVAS_LMS === $this->util->getLmsId()) {
        //     $this->request->request->set('oauth_consumer_key', 'cidilabs.app');
        //     $this->request->request->set('oauth_signature_method', 'HMAC-SHA1');
        //     $this->request->request->set('oauth_timestamp', '1550077942');
        //     $this->request->request->set('oauth_nonce', '1233213232123123123');
        //     $this->request->request->set('oauth_version', '1.0');
        //     $this->request->request->set('custom_lms_user_id', '2027');
        //     $this->request->request->set('custom_lms_course_id', '2084');
        //     $this->request->request->set('custom_lms_account_id', '608');
        //     $this->request->request->set('custom_lms_root_account_id', '1');
        //     $this->request->request->set('custom_lms_api_domain', 'cidilabs.instructure.com');
        //     $this->request->request->set('lti_message_type', 'basic-lti-launch-request');
        //     $this->request->request->set('lti_version', 'LTI-1p0');
        //     $this->request->request->set('resource_link_id', '123123123123123123123');
        //     $this->request->request->set('context_label', 'CIDILABS APP');
        //     $this->request->request->set('context_title', 'CIDILABS DEV APP');
        //     $this->request->request->set('oauth_signature', '4NQwSrSrMCxFyYhuiRFCsuRU7aM=');
        // }

        return null;
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

    }

    public function supportsRememberMe()
    {

    }
}