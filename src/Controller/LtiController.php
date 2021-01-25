<?php

namespace App\Controller;

use App\Entity\Institution;
use App\Entity\User;
use App\Services\LmsUserService;
use App\Services\UtilityService;
use Firebase\JWT\JWK;
use \Firebase\JWT\JWT;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\Annotation\Route;

class LtiController extends AbstractController
{
    /** @var UtilityService $util */
    private $util;
    /** @var SessionInterface $session */
    private $session;
    /** @var Request $request */
    private $request;

    /**
     * @Route("/lti/authorize", name="lti_authorize")
     */
    public function ltiAuthorize(
        Request $request,
        SessionInterface $session,
        UtilityService $util
    ) {

        $this->request = $request;
        $this->session = $session;
        $this->util = $util;

        $this->saveRequestToSession();

        return $this->redirect($this->getAuthenticationResponseUrl());
    }

    /**
     * @Route("/lti/authorize/check", name="lti_authorize_check")
     */
    public function ltiAuthorizeCheck(
        Request $request,
        SessionInterface $session,
        UtilityService $util
    ) {
        $this->request = $request;
        $this->session = $session;
        $this->util = $util;

        $this->saveRequestToSession();
        $clientId = $this->session->get('client_id');

        $jwt = $this->session->get('id_token');
        if (!$jwt) {
            $this->util->exitWithMessage('ID token not received from Canvas.');
        }

        // Create token from JWT and public JWKs
        $jwks = $this->getPublicJwks();
        $publicKey = JWK::parseKeySet($jwks);
        JWT::$leeway = 60;
        $token = JWT::decode($jwt, $publicKey, ['RS256']);

        // Issuer should match previously defined issuer
        $this->claimMatchOrExit('iss', $this->session->get('iss'), $token->iss);

        // Audience should include the client id
        $this->claimMatchOrExit('aud', $clientId, $token->aud);

        // Authorized Party should include the client id
        $this->claimMatchOrExit('azp', $clientId, $token->azp);

        // Expiration should be after the current time
        if (date('U') >= $token->exp) {
            $this->util->exitWithMessage(sprintf('The "exp" provided is before the current time.'));
        }
        // Id token must contain a nonce. Should verify that nonce has not been received within a certain time window

        // Add Token to Session
        $this->saveTokenToSession($token);

        // Add user to session
        $this->saveUserToSession();

        if (isset($token->{'https://purl.imsglobal.org/spec/lti/claim/target_link_uri'})) {
            return $this->redirect($token->{'https://purl.imsglobal.org/spec/lti/claim/target_link_uri'});
        }

        return $this->redirectToRoute('dashboard');
    }

    /**
     * @Route("/lti/config/{lms}", name="lti_config")
     */
    public function ltiConfig($lms = 'canvas', Request $request)
    {
        $baseUrl = $request->server->get('APP_LTI_BASE_URL');
        $baseDomain = str_replace('https://', '', $baseUrl);
        $appName = $request->server->get('APP_LTI_NAME');
        $platform = 'canvas.instructure.com';

        // if ('...' === $lms) {
        //     $platform = '...';
        // }

        $output = [
            "title" => $appName,
            "scopes" => [],
            "extensions" => [
                [
                    "domain" => $baseDomain,
                    "tool_id" => "cidilabs_udoit3",
                    "platform" => $platform,
                    "settings" => [
                        "text" => $appName,
                        "platform" => $platform,
                        "placements" => [
                            [
                                "text" => $appName,
                                "placement" => "course_navigation",
                                "message_type" => "LtiResourceLinkRequest",
                                "target_link_uri" => "{$baseUrl}/dashboard"
                            ],
                            [
                                "text" => $appName,
                                "placement" => "account_navigation",
                                "message_type" => "LtiResourceLinkRequest",
                                "target_link_uri" => "{$baseUrl}/admin"
                            ]
                        ]
                    ],
                    "privacy_level" => "public",
                ]
            ],
            "public_jwk" => [],
            "description" => "User settings for UDOIT 3.x",
            "public_jwk_url" => "https://canvas.instructure.com/api/lti/security/jwks",
            "target_link_uri" => "{$baseUrl}/dashboard",
            "oidc_initiation_url" => "{$baseUrl}/lti/authorize"
        ];

        if ('canvas' === $lms) {
            $output["custom_fields"] = [
                "lms_id" => 'canvas',
                "lms_user_id" => "\$Canvas.user.id",
                "lms_course_id" => "\$Canvas.course.id",
                "lms_account_id" => "\$Canvas.account.id",
                "lms_api_domain" => "\$Canvas.api.domain"
            ];
        }
        else {
            // D2L custom fields
        }

        return new JsonResponse($output);
    }


    /***********************
     * PROTECTED FUNCTIONS
     ***********************/

    protected function claimMatchOrExit($claimType, $sessionClaim, $tokenClaim)
    {
        if(is_array($tokenClaim)) {
            if(in_array($sessionClaim, $tokenClaim)) {
                return true;
            }
        }
        else if($sessionClaim == $tokenClaim) {
            return true;
        }
        $this->util->exitWithMessage(sprintf('The "%s" provided does not match the expected value: %s.', $claimType, $sessionClaim));
    }

    protected function saveTokenToSession($token) 
    {
        try {
            $customFields = (array) $token->{'https://purl.imsglobal.org/spec/lti/claim/custom'};
            foreach ($customFields as $key => $val) {
                $this->session->set($key, $val);
            }

            $roleFields = (array) $token->{'https://purl.imsglobal.org/spec/lti/claim/roles'};
            $roles = [];
            foreach ($roleFields as $role) {
                $roleArr = explode('#', $role);
                $roles[] = trim($roleArr[1]);
            }
            $this->session->set('roles', array_values(array_unique($roles)));  
            
            if (isset($token->name)) {
                $this->session->set('lms_user_name', $token->name);
            }
        } 
        catch (\Exception $e) {
            print_r($e->getMessage());
        }
    }

    protected function saveRequestToSession()
    {
        try {
            $postParams = $this->request->request->all();

            foreach ($postParams as $key => $val) {
                $this->session->set($key, $val);
            }
        } catch (\Exception $e) {
            print_r($e->getMessage());
        }

        return;
    }

    protected function getAuthenticationResponseUrl()
    {
        $baseUrl = $this->session->get('iss');

        $params = [
            'lti_message_hint' => $this->session->get('lti_message_hint'),
            'client_id' => $this->session->get('client_id'),
            'redirect_uri' => $this->getLtiRedirectUri(),
            'login_hint' => $this->session->get('login_hint'),
            'state' => 'state123',
            'scope' => 'openid',
            'response_type' => 'id_token',
            'response_mode' => 'form_post',
            'nonce' => 'nonce',
            'prompt' => 'none',
        ];
        $queryStr = http_build_query($params);

        return "{$baseUrl}/api/lti/authorize_redirect?{$queryStr}";
    }

    protected function getPublicJwks()
    {
        $httpClient = HttpClient::create();
        /* URL may be different for other LMSes */
        $url = $this->session->get('iss') . '/api/lti/security/jwks';
        $response = $httpClient->request('GET', $url);

        $keys = $response->toArray();
        return $keys;
    }

    protected function getLtiRedirectUri()
    {
        return $this->request->server->get('APP_LTI_REDIRECT_URL');
    }

    /**
     * Get institution before the user is authenticated.
     * Once the user is authenticated we should use $user->getInstitution().
     *
     * @return \App\Entity\Institution
     */
    protected function getInstitutionFromSession()
    {
        $institution = null;
        
        if (!$this->getUser()) {
            $rawDomain = $this->session->get('lms_api_domain');
            $domain = str_replace(['.beta.', '.test.'], '.', $rawDomain);

            if ($domain) {
                $institution = $this
                    ->getDoctrine()
                    ->getRepository(Institution::class)
                    ->findOneBy(['lmsDomain' => $domain]);
            }
        }

        return $institution;
    }

    protected function createUser()
    {
        $domain = $this->session->get('lms_api_domain');
        $userId = $this->session->get('lms_user_id');
        $institution = $this->getInstitutionFromSession();
        $date = new \DateTime();

        $user = new User();
        $user->setUsername("{$domain}||{$userId}");
        $user->setLmsUserId($userId);
        $user->setInstitution($institution);
        $user->setCreated($date);
        $user->setLastLogin($date);

        if ($this->session->has('lms_user_name')) {
            $user->setName($this->session->get('lms_user_name'));
        }

        $this->getDoctrine()->getManager()->persist($user);
        $this->getDoctrine()->getManager()->flush();

        return $user;
    }

    /**
     * Returns User object, creates a new user if doesn't exist.
     *
     * @return User
     */
    protected function saveUserToSession()
    {
        $user = null;

        if ($this->session->get('userId')) {
            return;
        } else {
            $domain = $this->session->get('lms_api_domain');
            $userId = $this->session->get('lms_user_id');

            if ($domain && $userId) {
                $user = $this->getDoctrine()->getRepository(User::class)
                    ->findOneBy(['username' => "{$domain}||{$userId}"]);
            }
        }

        if (empty($user)) {
            $user = $this->createUser();
        }

        $this->session->set('userId', $user->getId());
    }
}
