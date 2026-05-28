<?php

namespace App\Controller;

use App\Repository\RegistrationRepository;
use App\Services\Encryption\RegistrationEncryptionService;
use App\Services\LmsApiService;
use App\Services\LmsUserService;
use App\Services\SessionService;
use App\Services\UtilityService;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class AuthController extends AbstractController
{
    /** @var UtilityService $util */
    private $util;
    /** @var Request $request */
    private $request;
    /** @var LmsApiService $lmsApi */
    private $lmsApi;

    private ManagerRegistry $doctrine;

    private RegistrationEncryptionService $registrationEncryptionService;

    private $session;

    public function __construct(ManagerRegistry $doctrine, RegistrationEncryptionService $registrationEncryptionService)
    {
        $this->doctrine = $doctrine;
        $this->registrationEncryptionService = $registrationEncryptionService;
    }

    #[Route('/authorize', name: 'authorize')]
    public function authorize(
        Request $request,
        SessionService $sessionService,
        UtilityService $util,
        LmsApiService $lmsApi)
    {
        $this->request = $request;
        $this->session = $sessionService->getSession();
        $this->util = $util;

        /** @var \App\Entity\User */
        $user = $this->getUser();
        if (!$user) {
            $this->util->exitWithMessage('User authentication failed.');
        }

        $institution = $user->getInstitution();
        if (!$institution) {
            $util->exitWithMessage('No institution found with this domain.');
        }

        $this->session->set('oauthAttempted', true);

        $oauthUri = $lmsApi->getLms()->getOauthUri($institution->getRegistration(), $this->session);

        return $this->redirect($oauthUri);
    }

    // Previously called oauthresponse.php, this handles the reply from the LMS.
    #[Route('/authorize/check', name: 'authorize_check')]
    public function authorizeCheck(
        Request $request,
        SessionService $sessionService,
        UtilityService $util,
        LmsUserService $lmsUser,
        LmsApiService $lmsApi
    ) {
        $this->request = $request;
        $this->session = $sessionService->getSession();
        $this->util = $util;
        $this->lmsApi = $lmsApi;

        if (!empty($request->query->get('error'))) {
            $util->exitWithMessage('Authentication problem: Access Denied. ' . $request->query->get('error'));
        }

        if (empty($request->query->get('code'))) {
            $util->exitWithMessage('Authentication problem: No code was returned from the LMS.');
        }

        $user = $this->getUser();
        $newKey = $this->requestApiKeyFromLms();

        // It should have access_token and refresh_token
        if (!isset($newKey['access_token']) || !isset($newKey['refresh_token'])) {
            $util->exitWithMessage('Authentication problem: Missing access token. Please contact support.');
        }
        
        $lmsUser->updateUserToken($user, $newKey);
        $this->session->set('apiKey', $newKey['access_token']);
        $this->session->set('tokenHeader', ["Authorization: Bearer " . $newKey['access_token']]);

        $destination = $this->session->get('destination', 'dashboard');

        $response = $this->redirectToRoute($destination);
        $response->headers->setCookie(
            Cookie::create('AUTH_TOKEN')
                ->withValue($this->session->getUuid())
                ->withExpires(0)
                ->withPath('/')
                ->withSecure(true)
                ->withHttpOnly(true)
                ->withSameSite('none')
        );
        return $response;
    }

    // Pass in the institution ID and this will encrypt the developer key.
    #[Route('/encrypt/key', name: 'encrypt_developer_key')]
    public function encryptDeveloperKey(
        Request $request,
        RegistrationRepository $registrationRepository,
    ) {
        $instId = $request->query->get('id');

        $registration = $registrationRepository->getByInstitutionId($instId);
        $registrationEncryptionService->encryptKey($registration);

        $this->doctrine->getManager()->flush();

        return new Response('Updated.');
    }

    // Finish authorization process by requesting a token from LMS
    protected function requestApiKeyFromLms(): mixed
    {
        /** @var \App\Entity\User */
        $user = $this->getUser();
        $institution = $user->getInstitution();
        $registration = $institution->getRegistration();
        $code = $this->request->query->get('code');
        $clientSecret = $this->registrationEncryptionService->getClientSecret($registration);
        $userAgent = 'UDOIT/' . !empty($_ENV['VERSION_NUMBER']) ? $_ENV['VERSION_NUMBER'] : '4.0.0';

        if (empty($clientSecret)) {
            $registrationEncryptionService->encryptKey($registration);
            $this->doctrine->getManager()->flush();
            $clientSecret = $this->registrationEncryptionService->getClientSecret($registration);
        }

        $options = [
            'body' => [
                'grant_type'    => 'authorization_code',
                'client_id'     => $registration->getApiClientId(),
                'redirect_uri'  => LmsUserService::getOauthRedirectUri(),
                'client_secret' => $this->registrationEncryptionService->getClientSecret($registration),
                'code'          => $code,
            ],
            'headers' => [
                'User-Agent' => $userAgent,
            ],
            'verify_host' => false,
            'verify_peer' => false,
        ];

        $client = HttpClient::create();
        $requestUrl = $this->lmsApi->getLms()->getOauthTokenUri($registration);
        $response = $client->request('POST', $requestUrl, $options);
        $contentStr = $response->getContent(false);

        return \json_decode($contentStr, true);
    }
}
