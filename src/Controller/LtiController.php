<?php

namespace App\Controller;

use App\Lms\Canvas\CanvasLms;
use App\Services\UtilityService;
use Firebase\JWT\JWT;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
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

        // print_r($this->session->all());
        // exit;

        return $this->redirect($this->getAuthenticationResponseUrl());

        //return new JsonResponse($this->session->all());
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

        $idToken = $this->session->get('id_token');
        if (!$idToken) {
            $this->util->exitWithMessage('ID token not received from Canvas.');
        }

        list($headerEnc, $payloadEnc, $signature) = explode('.', $idToken);

        $header = \json_decode(base64_decode($headerEnc));
        // print "<hr/>";
        // print_r(base64_decode($payload));
        // print "<hr/>";
        //print_r(base64_decode($signature));
        //print_r($this->session->all());
        //exit;

        if (!isset($header->kid)) {
            $this->util->exitWithMessage('Public key missing in the LTI response header.');
        }

        $keys = $this->getPublicJwk();

        //$token = JWT::decode($idToken, $keys, ['RS256']);
        

        return new JsonResponse($this->session->all());
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

    protected function getAuthenticationResponseUrl()
    {
        $baseUrl = $this->getBaseUrl();
        $params = [
            'client_id' => $this->session->get('client_id'),
            'redirect_uri' => $this->getLtiRedirectUri(),
            'login_hint' => $this->session->get('login_hint'),
            'lti_message_hint' => $this->session->get('lti_message_hint'),
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

    protected function getBaseUrl()
    {
        if (UtilityService::CANVAS_LMS === $this->util->getLmsId()) {
            $issuer = $this->session->get('iss');
            if (!$issuer) {
                $this->util->exitWithMessage('Missing LTI configuration. Please contact your system administrator. ERROR: missing issuer');
            }

            if (strpos($issuer, '.test.') !== false) {
                return CanvasLms::CANVAS_TEST_BASE_URL;
            } else if (strpos($issuer, '.beta.') !== false) {
                return CanvasLms::CANVAS_BETA_BASE_URL;
            }

            return CanvasLms::CANVAS_PROD_BASE_URL;
        } else {
        }

        // default to Canvas Prod
        return CanvasLms::CANVAS_PROD_BASE_URL;
    }

    protected function getPublicJwk()
    {
        if (UtilityService::CANVAS_LMS !== $this->util->getLmsId()) {
            return 'D2L JWK';
        }

        $httpClient = HttpClient::create();
        $url = $this->getBaseUrl() . '/api/lti/security/jwks';
        $response = $httpClient->request('GET', $url);

        $keys = $response->toArray();

        return isset($keys['keys']) ? $keys['keys'] : $keys;
    }

    protected function getLtiRedirectUri()
    {
        return $this->request->server->get('APP_LTI_REDIRECT_URL');
    }
}
