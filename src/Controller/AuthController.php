<?php

namespace App\Controller;

use App\Entity\Institution;
use App\Entity\User;
use App\Services\LmsApiService;
use App\Services\UtilityService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\Annotation\Route;

class AuthController extends AbstractController
{
    /** @var UtilityService $util */
    private $util;
    /** @var SessionInterface $session */
    private $session;
    /** @var Request $request */
    private $request;
    /** @var LmsApiService $lmsApi */
    private $lmsApi;

    /**
     * @Route("/authorize", name="authorize")
     */
    public function authorize(
        Request $request,
        SessionInterface $session,
        UtilityService $util,
        LmsApiService $lmsApi)
    {
        $this->request = $request;
        $this->session = $session;
        $this->util = $util;
        $this->lmsApi = $lmsApi;

        $user = $this->getUser();
        if (!empty($user) && $this->lmsApi->validateApiKey($user)) {
            return $this->redirectToRoute('dashboard');
        }
        
        $this->saveRequestToSession();
        
        $institution = $this->getInstitutionFromSession();
        if (!$institution) {
            $util->exitWithMessage('No institution found with this domain.');
        }

        $apiClientId = $institution->getApiClientId();
        $redirectUri = $this->lmsApi->getOauthRedirectUri();
        $scopes = $lmsApi->getLms()->getScopes();

        $oauthUri = "https://{$this->session->get('lms_api_domain')}/login/oauth2/auth/?client_id={$apiClientId}&scopes={$scopes}&response_type=code&redirect_uri={$redirectUri}";

        return $this->redirect($oauthUri);
    }

    /**
     * Previously called oauthresponse.php, this handles the reply from 
     * Canvas.
     * @Route("/authorize/check", name="authorize_check")
     */
    public function authorizeCheck(
        Request $request,
        SessionInterface $session,
        UtilityService $util,
        LmsApiService $lmsApi
    ) {
        $this->request = $request;
        $this->session = $session;
        $this->util = $util;
        $this->lmsApi = $lmsApi;

        if (!empty($request->query->get('error'))) {
            $util->exitWithMessage('Authentication problem: Access Denied. ' . $request->query->get('error'));
        }

        if (empty($request->query->get('code'))) {
            $util->exitWithMessage('Authentication problem: No code was returned from the LMS.');
        }

        $user = $this->getUserFromSession();
        $newKey = $this->requestApiKeyFromLms();

        // It should have access_token and refresh_token
        if (!isset($newKey['access_token']) || !isset($newKey['refresh_token'])) {
            $util->exitWithMessage('Authentication problem: Missing access token. Please contact support.');
        }
        
        $this->lmsApi->updateUserToken($user, $newKey);
        $this->session->set('apiKey', $newKey['access_token']);
        $this->session->set('tokenHeader', ["Authorization: Bearer " . $newKey['access_token']]);

        return $this->redirectToRoute('dashboard');
    }

    /**
     * Pass in the institution ID and this will encrypt the developer key.
     *
     * @route("/encrypt/key", name="encrypt_developer_key")
     */
    public function encryptDeveloperKey(Request $request, UtilityService $util)
    {
        $instId = $request->query->get('id');
        $institution = $util->getInstitutionById($instId);
        $institution->encryptDeveloperKey();
        $this->getDoctrine()->getManager()->flush();

        return new Response('Updated.');
    }

    private function saveRequestToSession()
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

    /**
     * Finish authorization process by requesting a token from LMS
     *
     * @return void
     */
    protected function requestApiKeyFromLms()
    {
        $institution = $this->getInstitutionFromSession();
        $baseUrl = $institution->getLmsDomain();
        $code = $this->request->query->get('code');
        $options = [
            'query' => [
                'grant_type'    => 'authorization_code',
                'client_id'     => $institution->getApiClientId(),
                'redirect_uri'  => $this->lmsApi->getOauthRedirectUri(),
                'client_secret' => $institution->getApiClientSecret(),
                'code'          => $code,
            ],
            'verify_host' => false,
            'verify_peer' => false,
        ];

        $client = HttpClient::create();
        $requestUrl = "https://{$baseUrl}/login/oauth2/token";
        $response = $client->request('POST', $requestUrl, $options);
        $contentStr = $response->getContent(false);

        return \json_decode($contentStr, true);
    }

    /**
     * Get institution before the user is authenticated.
     * Once the user is authenticated we should use $user->getInstitution().
     *
     * @return Institution
     */
    public function getInstitutionFromSession()
    {
        $institution = null;

        if (!($institution = $this->session->get('institution'))) {
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

    public function createUser()
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

        $this->getDoctrine()->getManager()->persist($user);
        $this->getDoctrine()->getManager()->flush();

        $this->session->set('userId', $user->getId());

        return $user;
    }

    /**
     * Returns User object, creates a new user if doesn't exist.
     *
     * @return User
     */
    public function getUserFromSession()
    {
        if ($userId = $this->session->get('userId')) {
            return $this->getDoctrine()->getRepository(User::class)->find($userId);
        } 
        else {
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

        return $user;
    }
}
