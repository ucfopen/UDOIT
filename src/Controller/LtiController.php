<?php

namespace App\Controller;

use App\Entity\Institution;
use App\Entity\User;
use App\Services\LmsApiService;
use App\Services\SessionService;
use App\Services\UtilityService;
use Firebase\JWT\JWK;
use \Firebase\JWT\JWT;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class LtiController extends AbstractController
{
    /** @var UtilityService $util */
    private $util;
    /** @var \App\Entity\UserSession $session */
    private $session;
    /** @var Request $request */
    private $request;
    /** @var \App\Services\LmsApiService $lmsApi */
    private $lmsApi;

    /**
     * @Route("/lti/authorize", name="lti_authorize")
     */
    public function ltiAuthorize(
        Request $request,
        SessionService $sessionService,
        UtilityService $util,
        LmsApiService $lmsApi
    ) {

        $this->request = $request;
        $this->session = $sessionService->getSession();
        $this->util = $util;
        $this->lmsApi = $lmsApi;

        $this->saveRequestToSession();

        return $this->redirect($this->getLtiAuthResponseUrl());
    }

    /**
     * @Route("/lti/authorize/check", name="lti_authorize_check")
     */
    public function ltiAuthorizeCheck(
        Request $request,
        SessionService $sessionService,
        UtilityService $util,
        LmsApiService $lmsApi
    ) {
        $this->request = $request;
        $this->util = $util;
        $this->lmsApi = $lmsApi;

        $state = $request->request->get('state');
        $this->session = $sessionService->getSession($state);

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

        // Expiration should be after the current time
        if (date('U') >= $token->exp) {
            $this->util->exitWithMessage(sprintf('The "exp" provided is before the current time.'));
        }

        // Id token must contain a nonce. Should verify that nonce has not been received within a certain time window
        $this->claimMatchOrExit('nonce', 'nonce', $token->nonce);

        // Add Token to Session
        $this->saveTokenToSession($token);

        // Add user to session
        $this->saveUserToSession();

        // Remove old sessions
        $sessionService->removeExpiredSessions();

        if (isset($token->{'https://purl.imsglobal.org/spec/lti/claim/target_link_uri'})) {
            $redirectUrl = $token->{'https://purl.imsglobal.org/spec/lti/claim/target_link_uri'} . '?auth_token=' . $this->session->getUuid();
            return $this->redirect($redirectUrl);
        }

        return $this->redirectToRoute('dashboard',
            ['auth_token' => $this->session->getUuid()]);
    }

    /**
     * @Route("/lti/authorize/dev_lti_authorize", name="dev_lti_authorize")
     */
    public function dev_lti_authorize(
      Request $request,
      SessionService $sessionService,
      UtilityService $util
    ) {
      if ($this->getParameter('app.use_development_auth') != 'YES') {
        throw $this->createNotFoundException('Route not found.');
      }

      $userId = $request->query->get('user');
      if (!isset($userId)) {
        $userId = 37;
      }
      $lmsCourseId = $request->query->get('lmsCourseId');
      if (!isset($lmsCourseId)) {
        $lmsCourseId = 396;
      }
      $this->request = $request;
      $this->session = $sessionService->getSession();
      $this->util = $util;
      $this->session->set('userId', $userId);
      $this->session->set('lms_course_id', $lmsCourseId);
      $this->saveRequestToSession();
      return $this->redirectToRoute('dashboard', [
        'auth_token' => base64_encode('cidilabs.instructure.com||314')
      ]);
    }

    /**
     * @Route("/lti/config/{lms}", name="lti_config")
     */
    public function ltiConfig(Request $request, $lms = 'canvas')
    {
        $baseUrl = $request->server->get('BASE_URL');
        $baseDomain = str_replace('https://', '', $baseUrl);
        $appName = $request->server->get('APP_LTI_NAME');
        $adminName = $request->server->get('ADMIN_LTI_NAME');
        $platform = ($lms === 'canvas') ? 'canvas.instructure.com' : 'd2l.com';

        $customAppName = $request->query->get('tool_title');
        $default = $request->query->get('default');

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
                                "text" => ($customAppName) ? $customAppName : $appName,
                                "placement" => "course_navigation",
                                "message_type" => "LtiResourceLinkRequest",
                                "target_link_uri" => "{$baseUrl}/dashboard",
                                "visibility" => "admins",
                                "enabled" => true,
                                "default" => ($default) ? $default : 'disabled',
                            ],
                            [
                                "text" => $adminName,
                                "placement" => "account_navigation",
                                "message_type" => "LtiResourceLinkRequest",
                                "target_link_uri" => "{$baseUrl}/admin",
                                "enabled" => true,
                            ]
                        ]
                    ],
                    "privacy_level" => "anonymous",
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
                "lms_api_domain" => "\$Canvas.api.domain",
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
            $lms = $this->lmsApi->getLms();

            if (!empty($token->{'https://purl.imsglobal.org/spec/lti/claim/custom'})) {
                $customFields = (array) $token->{'https://purl.imsglobal.org/spec/lti/claim/custom'};
                foreach ($customFields as $key => $val) {
                    $this->session->set($key, $val);
                }
            }

            $roles = [];
            if (!empty($token->{'https://purl.imsglobal.org/spec/lti/claim/roles'})) {
                $roleFields = (array) $token->{'https://purl.imsglobal.org/spec/lti/claim/roles'};
                foreach ($roleFields as $role) {
                    $roleArr = explode('#', $role);
                    $roles[] = trim($roleArr[1]);
                }
            }
            $this->session->set('roles', array_values(array_unique($roles)));

            if (isset($token->name)) {
                $this->session->set('lms_user_name', $token->name);
            }

            $lms->saveTokenToSession($token);
        }
        catch (\Exception $e) {
            print_r($e->getMessage());
        }
    }

    protected function saveRequestToSession()
    {
        try {
            $getParams = $this->request->query->all();
            $postParams = $this->request->request->all();
            $allParams = array_merge($getParams, $postParams);

            foreach ($allParams as $key => $val) {
                if (!empty($val)) {
                    $this->session->set($key, $val);
                }
            }

            if (!$this->session->get('lms_api_domain')) {
                $domain = $this->session->get('iss');
                $this->session->set('lms_api_domain', str_replace('https://', '', $domain));
            }

            $this->getDoctrine()->getManager()->flush();
        } catch (\Exception $e) {
            print_r($e->getMessage());
        }

        return;
    }

    protected function getPublicJwks()
    {
        $httpClient = HttpClient::create();
        /* URL will be different for other LMSes */
        $url = $this->lmsApi->getLms()->getKeysetUrl();
        $response = $httpClient->request('GET', $url);

        $keys = $response->toArray();
        return $keys;
    }

    protected function getLtiAuthResponseUrl()
    {
        $lms = $this->lmsApi->getLms();
        $server = $this->request->server;

        $params = [
            'lti_message_hint' => $this->session->get('lti_message_hint'),
            'client_id' => $this->session->get('client_id'),
            'login_hint' => $this->session->get('login_hint'),
            'state' => $this->session->getUuid(),
            'scope' => 'openid',
            'response_type' => 'id_token',
            'response_mode' => 'form_post',
            'nonce' => 'nonce',
            'prompt' => 'none',
            'redirect_uri' => $server->get('BASE_URL') . $server->get('APP_LTI_REDIRECT_PATH'),
        ];

        return $lms->getLtiAuthUrl($params);
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
            $domain = $this->util->getCurrentDomain();

            if ($domain) {
                $institution = $this
                    ->getDoctrine()
                    ->getRepository(Institution::class)
                    ->findOneBy(['lmsDomain' => $domain]);

                if (!$institution) {
                    $institution = $this
                        ->getDoctrine()
                        ->getRepository(Institution::class)
                        ->findOneBy(['vanityUrl' => $domain]);
                }
            }
        }

        if (!$institution) {
            $cleanedDomain = str_replace(['.beta.', '.test.'], '.', $domain);

            if ($cleanedDomain) {
                $institution = $this
                    ->getDoctrine()
                    ->getRepository(Institution::class)
                    ->findOneBy(['lmsDomain' => $cleanedDomain]);

                if (!$institution) {
                    $institution = $this
                        ->getDoctrine()
                        ->getRepository(Institution::class)
                        ->findOneBy(['vanityUrl' => $cleanedDomain]);
                }
            }
        }

        if (empty($institution)) {
            $this->util->exitWithMessage("No institution found. Please verify your institution data in the database.");
        }

        return $institution;
    }

    protected function createUser()
    {
        $domain = $this->session->get('iss');
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
            $domain = $this->session->get('iss');
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
        $this->getDoctrine()->getManager()->flush();
    }
}
