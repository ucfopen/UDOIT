<?php

namespace App\Lms\Canvas;

use App\Services\UtilityService;
use IMSGlobal\LTI\Database;
use IMSGlobal\LTI\LTI_Registration;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

class CanvasLtiDatabase implements Database {
    
    /** @var SessionInterface $session */
    protected $session;

    /** @var UtilityService $util */
    protected $util;

    public function __construct(SessionInterface $session, UtilityService $util)
    {
        $this->session = $session;        
        $this->util = $util;
    }

    public function find_registration_by_issuer($iss)
    {
        $clientId = $this->session->get('client_id');
        $keySetUrl = $this->getPublicJwkUrl($iss);
        $loginUrl = $this->getLoginUrl($iss);

        return LTI_Registration::new()
            ->set_auth_login_url($loginUrl)
            ->set_auth_token_url($loginUrl)
            ->set_client_id($clientId)
            ->set_key_set_url($keySetUrl)
            //->set_kid($kid)
            ->set_issuer($iss);
            //->set_tool_private_key($private_key);
    }

    public function find_deployment($iss, $deployment_id)
    {
        return 'deployID123';
    }

    protected function getPublicJwkUrl($issuer)
    {
        return $issuer . '/api/lti/security/jwks';
    }

    protected function getLoginUrl($issuer)
    {
        return $issuer . '/api/lti/authorize_redirect';
    }
}
