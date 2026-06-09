<?php

namespace App\Controller;

use App\Entity\Institution;
use App\Entity\LtiSession;
use App\Entity\Registration;
use App\Entity\User;
use App\Entity\UserSession;
use App\Repository\LtiSessionRepository;
use App\Repository\RegistrationRepository;
use App\Services\LmsApiService;
use App\Services\LtiSessionService;
use App\Services\SessionService;
use App\Services\UtilityService;
use Doctrine\Persistence\ManagerRegistry;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class LtiController extends AbstractController
{
    /** @var UtilityService $util */
    private $util;
    /** @var Request $request */
    private $request;
    /** @var \App\Services\LmsApiService $lmsApi */
    private $lmsApi;

    private ?LtiSession $ltiSession;

    private SessionService $sessionService;

    private ManagerRegistry $doctrine;

    private RegistrationRepository $registrationRepository;

    private LtiSessionService $ltiSessionService;

    private LtiSessionRepository $ltiSessionRepository;

    public function __construct(
        ManagerRegistry $doctrine,
        SessionService $sessionService,
        RegistrationRepository $registrationRepository,
        LtiSessionService $ltiSessionService,
        LtiSessionRepository $ltiSessionRepository,
        private LoggerInterface $logger,
    ) {
        $this->doctrine = $doctrine;
        $this->sessionService = $sessionService;
        $this->registrationRepository = $registrationRepository;
        $this->ltiSessionService = $ltiSessionService;
        $this->ltiSessionRepository = $ltiSessionRepository;
    }


    /**
     * OIDC Login Initiation Request Handler
     *
     * Handles the third-party initiated login from an LMS. Both GET and POST
     * requests must be supported, as the LMS may use either method.
     *
     * ---
     *
     * Request Parameters (from LMS):
     *
     * From IMS Security Framework 1.0, Section 5.1.1.1
     * {@link https://www.imsglobal.org/spec/security/v1p0/#step-1-third-party-initiated-login}
     *
     *   iss                The platform issuer
     *   login_hint         Opaque value that should be returned untouched to the LMS 
     *   target_link_uri    The target endpoint that should be retrieved at the end of the authentication flow
     *
     * From LTI 1.3, Section 4.1
     * {@link https://www.imsglobal.org/spec/lti/v1p3#additional-login-parameters}
     *
     *   lti_message_hint       Opaque value that should be returned untouched to the LMS
     *   lti_deployment_id      The ID of the specific deployment of the tool
     *   client_id              The client ID for the tool
     *
     * ---
     *
     * The tool must redirect the user agent to the OIDC Authentication endpoint
     * registered in the LMS. The redirect may be issued as either GET or POST.
     *
     * Redirect Parameters (to OIDC endpoint):
     *
     * From IMS Security Framework 1.0, Section 5.1.1.2
     * {@link https://www.imsglobal.org/spec/security/v1p0/#step-2-authentication-request}
     *
     *   scope, response_type, client_id, redirect_uri, login_hint,
     *   state, response_mode, nonce, prompt
     */
    #[Route('/lti/authorize', name: 'lti_authorize')]
    public function ltiAuthorize(
        Request $request,
        UtilityService $util,
        LmsApiService $lmsApi,
    ) {

        $this->request = $request;
        $this->util = $util;
        $this->lmsApi = $lmsApi;

        $postParams = $request->request->all();
        $getParams = $request->query->all();
        $allParams = array_merge($postParams, $getParams);
        $iss = $allParams['iss'];
        $clientId = $allParams['client_id'];
        $loginHint = $allParams['login_hint'];
        $ltiMessageHint = $allParams['lti_message_hint'];

        $registrations = $this->registrationRepository->getByIssAndClientId($iss, $clientId);

        if (empty($registrations)) {
            $this->util->exitWithMessage('Invalid LTI registration.');
        }

        $registration = $registrations[0];
        $this->ltiSession = $this->ltiSessionService->createLtiSession($registration);

        return $this->redirect($this->getLtiAuthResponseUrl($registration, $ltiMessageHint, $loginHint));
    }


    /**
     * LTI Resource Link Launch Request Handler
     *
     * Handles the final step of the LTI 1.3 launch flow. After the OIDC login
     * initiation and authentication redirect, the LMS POSTs the authentication
     * response to this endpoint containing the LTI message claims.
     *
     *
     * ---
     *
     * Request parameters (POST body):
     *
     * From IMS Security Framework 1.0, Section 5.1.1.3
     * {@link https://www.imsglobal.org/spec/security/v1p0/#step-3-authentication-response}
     *
     *   state     Must match the value sent in the auth request (CSRF protection)
     *   id_token  Signed JWT containing the user identity and LTI message claims
     *
     * ---
     *
     * REQUIRED claims inside the id_token JWT:
     *
     *
     * From IMS Security Framework 1.0, Section 5.1.2
     * {@link https://www.imsglobal.org/spec/security/v1p0/#id-token}
     *   iss           Issuer (the platform's identifier)
     *   sub           Subject (the user's unique identifier on the platform)
     *   aud           Audience (this tool's client_id)
     *   iat           Issued-at timestamp
     *   exp           Expiry timestamp
     *   nonce         Must match the value sent in the auth request
     *
     * From LTI 1.3 Specification, Section 5.3
     * {@link https://www.imsglobal.org/spec/lti/v1p3#required-message-claims}
     * 
     *   https://purl.imsglobal.org/spec/lti/claim/message_type     Must be "LtiResourceLinkRequest"
     *   https://purl.imsglobal.org/spec/lti/claim/version          Must be "1.3.0"
     *   https://purl.imsglobal.org/spec/lti/claim/deployment_id    Identifies the tool deployment within the platform
     *   https://purl.imsglobal.org/spec/lti/claim/target_link_uri  The URL the tool should redirect to after launch
     *   https://purl.imsglobal.org/spec/lti/claim/resource_link {
     *       id          Opaque platform-unique identifier for this resource link (required)
     *       title       Descriptive title (optional)
     *       description (optional)
     *   }
     *   https://purl.imsglobal.org/spec/lti/claim/roles            Array of LIS role URIs for the launching user (may be empty)
     
     * ---
     *
     * OPTIONAL claims inside the id_token JWT:
     *
     * From LTI 1.3 Core Specification, Section 5.4
     * {@link https://www.imsglobal.org/spec/lti/v1p3#optional-message-claims}
     *
     *   https://purl.imsglobal.org/spec/lti/claim/context                  Course/context info (id, label, title, type)
     *   https://purl.imsglobal.org/spec/lti/claim/tool_platform            Platform info (guid, name, version, etc.)
     *   https://purl.imsglobal.org/spec/lti/claim/role_scope_mentor        Mentor role mappings
     *   https://purl.imsglobal.org/spec/lti/claim/launch_presentation      Presentation hints (locale, target, return URL)
     *   https://purl.imsglobal.org/spec/lti/claim/lis                      LIS person and course data
     *   https://purl.imsglobal.org/spec/lti/claim/custom                   Custom variables defined in the tool placement
     *
     * ---
     *
     * The tool MUST validate the state parameter, JWT signature, nonce, and expiry 
     *
     * See IMS Security Framework 1.0, Section 5.1.3 for validation requirements:
     * {@link https://www.imsglobal.org/spec/security/v1p0/#authentication-response-validation}
     */
    #[Route('/lti/authorize/check', name: 'lti_authorize_check')]
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

        $this->ltiSession = $this->ltiSessionRepository->getByState($state);

        if (!$this->ltiSession) {
            $this->util->exitWithMessage('State is not valid.');
        }

        $registration = $this->ltiSession->getRegistration();

        $jwt = $request->request->get('id_token');

        if (!$jwt) {
            $this->util->exitWithMessage('ID token not received from the LMS.');
        }

        // Create token from JWT and public JWKs
        $jwks = $this->getPublicJwks($registration);
        $publicKey = JWK::parseKeySet($jwks);
        JWT::$leeway = 60;
        $token = JWT::decode($jwt, $publicKey);

        
        // Issuer should match previously defined issuer
        $this->claimMatchOrExit('iss', $registration->getIssuer(), $token->iss);
        // Audience should include the client id
        $this->claimMatchOrExit('aud', $registration->getClientId(), $token->aud);

        // Expiration should be after the current time
        if (date('U') >= $token->exp) {
            $this->util->exitWithMessage(sprintf('The "exp" provided is before the current time.'));
        }

        if (!$this->ltiSessionService->verifyNonceAndDelete($this->ltiSession, $token->nonce)) {
            throw new \Exception("Invalid nonce!");
        }
        
        $this->ltiSession = null;

        // Add Token to Session
        $session = $this->sessionService->createSession();
        $this->sessionService->saveTokenToSession($token, $session);
        $this->lmsApi->getLms()->saveTokenToSession($token, $session);

        $domain = $session->get('iss');
        $userId = $session->get('lms_user_id');
        $this->saveUserToSession($domain, $userId, $session);
        $this->doctrine->getManager()->flush(); 

        // Remove old sessions
        $sessionService->removeExpiredSessions();

        $authCookie = Cookie::create('AUTH_TOKEN')
            ->withValue($session->getUuid())
            ->withExpires(0)
            ->withPath('/')
            ->withSecure(true)
            ->withHttpOnly(true)
            ->withSameSite('none');

        if (isset($token->{'https://purl.imsglobal.org/spec/lti/claim/target_link_uri'})) {
            $redirectUrl = $token->{'https://purl.imsglobal.org/spec/lti/claim/target_link_uri'};
            $response = $this->redirect($redirectUrl);
            $response->headers->setCookie($authCookie);
            return $response;
        }

        $response = $this->redirectToRoute('dashboard');
        $response->headers->setCookie($authCookie);
        return $response;
    }

    #[Route('/lti/config/{lms}', name: 'lti_config')]
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
                            ],
                        ],
                    ],
                    "privacy_level" => "name_only",
                ],
            ],
            "public_jwk" => [],
            "description" => "User settings for UDOIT 3.x",
            "public_jwk_url" => "https://canvas.instructure.com/api/lti/security/jwks",
            "target_link_uri" => "{$baseUrl}/lti/authorize/check",
            "oidc_initiation_url" => "{$baseUrl}/lti/authorize",
        ];

        if ('canvas' === $lms) {
            $output["custom_fields"] = [
                "lms_id" => 'canvas',
                "lms_user_id" => "\$Canvas.user.id",
                "lms_course_id" => "\$Canvas.course.id",
                "lms_account_id" => "\$Canvas.account.id",
                "lms_api_domain" => "\$Canvas.api.domain",
            ];
        } else {
            // D2L custom fields
        }

        return new JsonResponse($output);
    }


    /***********************
     * PROTECTED FUNCTIONS
     ***********************/

    protected function claimMatchOrExit($claimType, $sessionClaim, $tokenClaim)
    {
        if (is_array($tokenClaim)) {
            if (in_array($sessionClaim, $tokenClaim)) {
                return true;
            }
        } elseif ($sessionClaim == $tokenClaim) {
            return true;
        }
        $this->util->exitWithMessage(sprintf('The "%s" provided does not match the expected value: %s.', $claimType, $sessionClaim));
    }

    protected function getPublicJwks(Registration $registration)
    {
        $httpClient = HttpClient::create();

        $url = $registration->getJwksEndpoint();
        $userAgent = 'UDOIT/' . (!empty($_ENV['VERSION_NUMBER']) ? $_ENV['VERSION_NUMBER'] : '4.0.0');
        $response = $httpClient->request('GET', $url, [
            'headers' => [
                'User-Agent' => $userAgent,
            ],
        ]);

        $keys = $response->toArray();
        return $keys;
    }

    protected function getLtiAuthResponseUrl(Registration $registration, ?string $ltiMessageHint, ?string $loginHint)
    {
        $server = $this->request->server;

        $params = [
            'client_id' => $registration->getClientId(),
            'state' => $this->ltiSession->getState(),
            'scope' => 'openid',
            'response_type' => 'id_token',
            'response_mode' => 'form_post',
            'nonce' => $this->ltiSession->getNonce(),
            'prompt' => 'none',
            'redirect_uri' => $server->get('BASE_URL') . $server->get('APP_LTI_REDIRECT_PATH'),
        ];

        if ($ltiMessageHint && $ltiMessageHint !== '') $params['lti_message_hint'] = $ltiMessageHint;
        if ($loginHint && $loginHint !== '') $params['login_hint'] = $loginHint;

        $queryStr = http_build_query($params);

        return "{$registration->getLoginAuthEndpoint()}?{$queryStr}";
    }

    // Get institution before the user is authenticated.
    // Once the user is authenticated we should use $user->getInstitution().
    protected function getInstitutionFromSession(): \App\Entity\Institution
    {
        $institution = null;

        if (!$this->getUser()) {
            $domain = $this->util->getCurrentDomain();

            if ($domain) {
                $institution = $this
                    ->doctrine
                    ->getRepository(Institution::class)
                    ->findOneBy(['lmsDomain' => $domain]);

                if (!$institution) {
                    $institution = $this
                        ->doctrine
                        ->getRepository(Institution::class)
                        ->findOneBy(['vanityUrl' => $domain]);
                }
            }
        }

        if (!$institution) {
            $cleanedDomain = str_replace(['.beta.', '.test.'], '.', $domain);

            if ($cleanedDomain) {
                $institution = $this
                    ->doctrine
                    ->getRepository(Institution::class)
                    ->findOneBy(['lmsDomain' => $cleanedDomain]);

                if (!$institution) {
                    $institution = $this
                        ->doctrine
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

    protected function createUser($domain, $userId)
    {
        $institution = $this->getInstitutionFromSession();
        $date = new \DateTime();

        $user = new User();
        $user->setUserIdentifier("{$domain}||{$userId}");
        $user->setLmsUserId($userId);
        $user->setInstitution($institution);
        $user->setCreated($date);
        $user->setLastLogin($date);


        $this->doctrine->getManager()->persist($user);
        $this->doctrine->getManager()->flush();

        return $user;
    }

    // Returns User object, creates a new user if doesn't exist.
    protected function saveUserToSession(string $domain, string $userId, UserSession $session): void
    {
        if ($session->get('userId')) return;

        $user = $this->doctrine->getRepository(User::class)
            ->findOneBy(['username' => "{$domain}||{$userId}"]);

        if (empty($user)) {
            $user = $this->createUser($domain, $userId);
        }
            
        $session->set('userId', $user->getId());
        $this->doctrine->getManager()->flush();
    }
}
