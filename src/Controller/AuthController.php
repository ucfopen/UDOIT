<?php

namespace App\Controller;

use App\Entity\Institution;
use App\Entity\User;
use App\Services\LmsApiService;
use App\Services\LmsUserService;
use App\Services\UtilityService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpClient\HttpClient;
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
    /** @var LmsUserService $lmsApi */
    private $lmsApi;

    /**
     * @Route("/authorize", name="authorize")
     */
    public function authorize(
        Request $request,
        SessionInterface $session,
        UtilityService $util,
        LmsUserService $lmsUser,
        LmsApiService $lmsApi)
    {
        $this->request = $request;
        $this->session = $session;
        $this->util = $util;
        $this->lmsUser = $lmsUser;

        $user = $this->getUser();
                
        //$this->saveRequestToSession();
        
        $institution = $user->getInstitution();
        if (!$institution) {
            $util->exitWithMessage('No institution found with this domain.');
        }

        $oauthUri = $lmsApi->getLms()->getOauthUri($institution);

        return $this->redirect($oauthUri);
    }

    /**
     * Previously called oauthresponse.php, this handles the reply from the LMS.
     * @Route("/authorize/check", name="authorize_check")
     */
    public function authorizeCheck(
        Request $request,
        SessionInterface $session,
        UtilityService $util,
        LmsUserService $lmsUser
    ) {
        $this->request = $request;
        $this->session = $session;
        $this->util = $util;
        $this->lmsUser = $lmsUser;

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
        $session->set('apiKey', $newKey['access_token']);
        $session->set('tokenHeader', ["Authorization: Bearer " . $newKey['access_token']]);

        $destination = $session->get('destination', 'dashboard');

        return $this->redirectToRoute($destination);
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
        $user = $this->getUser();
        $institution = $user->getInstitution();
        $baseUrl = $institution->getLmsDomain();
        $code = $this->request->query->get('code');
        $options = [
            'query' => [
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
        $requestUrl = "https://{$baseUrl}/login/oauth2/token";
        $response = $client->request('POST', $requestUrl, $options);
        $contentStr = $response->getContent(false);

        return \json_decode($contentStr, true);
    }
}
