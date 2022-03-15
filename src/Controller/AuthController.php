<?php

namespace App\Controller;

use App\Services\LmsApiService;
use App\Services\LmsUserService;
use App\Services\SessionService;
use App\Services\UtilityService;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class AuthController extends AbstractController
{
    /** @var UtilityService $util */
    private $util;
    /** @var Request $request */
    private $request;
    /** @var LmsApiService $lmsApi */
    private $lmsApi;

    private ManagerRegistry $doctrine;

    public function __construct(ManagerRegistry $doctrine)
    {
        $this->doctrine = $doctrine;
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

        $oauthUri = $lmsApi->getLms()->getOauthUri($institution, $this->session);

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

        return $this->redirectToRoute(
            $destination,
            ['auth_token' => $this->session->getUuid()]);
    }

    // Pass in the institution ID and this will encrypt the developer key.
    #[Route('/encrypt/key', name: 'encrypt_developer_key')]
    public function encryptDeveloperKey(Request $request, UtilityService $util)
    {
        $instId = $request->query->get('id');
        $institution = $util->getInstitutionById($instId);
        $institution->encryptDeveloperKey();
        $this->doctrine->getManager()->flush();

        return new Response('Updated.');
    }

    /**
     * Finish authorization process by requesting a token from LMS
     *
     * @return void
     */
    protected function requestApiKeyFromLms()
    {
        /** @var \App\Entity\User */
        $user = $this->getUser();
        $institution = $user->getInstitution();
        $code = $this->request->query->get('code');
        $clientSecret = $institution->getApiClientSecret();

        if (empty($clientSecret)) {
            $institution->encryptDeveloperKey();
            $this->doctrine->getManager()->flush();
            $clientSecret = $institution->getApiClientSecret();
        }

        $options = [
            'body' => [
                'grant_type'    => 'authorization_code',
                'client_id'     => $institution->getApiClientId(),
                'redirect_uri'  => LmsUserService::getOauthRedirectUri(),
                'client_secret' => $institution->getApiClientSecret(),
                'code'          => $code,
            ],
            'verify_host' => false,
            'verify_peer' => false,
        ];

        $client = HttpClient::create();
        $requestUrl = $this->lmsApi->getLms()->getOauthTokenUri($institution);
        $response = $client->request('POST', $requestUrl, $options);
        $contentStr = $response->getContent(false);

        return \json_decode($contentStr, true);
    }
}
