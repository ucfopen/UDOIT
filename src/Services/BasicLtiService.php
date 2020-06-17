<?php

namespace App\Services;

use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

class BasicLtiService {

    const CANVAS_TEST_LTI_RESPONSE_URL = 'https://canvas.test.instructure.com';
    const CANVAS_BETA_LTI_RESPONSE_URL = 'https://canvas.beta.instructure.com';
    const CANVAS_PROD_LTI_RESPONSE_URL = 'https://canvas.instructure.com';

    private $message = '';
    private $instConsumerKey = '';
    private $instSharedSecret = '';
    private $timestampThreshold = 300;

    /** @var Request $request */
    private $request;

    /** @var SessionService $session */
    private $session;

    /** @var UtilityService $util */
    private $util;

    public function __construct(RequestStack $requestStack, SessionInterface $session, UtilityService $util)
    {
        $this->request = $requestStack->getCurrentRequest();
        $this->session = $session;
        $this->util = $util;
    }

    public function getAuthenticationResponseUrl()
    {
        $baseUrl = $this->getBaseUrlByEnv();
        //$redirectUri = $this->

        return "{$baseUrl}/api/lti/authorize_redirect?";
    }

    public function getBaseUrlByEnv() 
    {
        if (UtilityService::CANVAS_LMS === $this->util->getLmsId()) {
            $issuer = $this->request->request->get('iss');
            if (!$issuer) {
                $this->util->exitWithMessage('Missing LTI configuration. Please contact your system administrator. ERROR: missing issuer');
            }

            if (strpos($issuer, '.test.') !== false) {
                return self::CANVAS_TEST_LTI_RESPONSE_URL;
            }
            else if (strpos($issuer, '.beta.') !== false) {
                return self::CANVAS_BETA_LTI_RESPONSE_URL;
            }

            return self::CANVAS_PROD_LTI_RESPONSE_URL;
        }
        else {

        }

        // default to Canvas Prod
        return self::CANVAS_PROD_LTI_RESPONSE_URL;
    }

    public function isValid($consumerKey, $sharedSecret)
    {
        $this->instConsumerKey = $consumerKey;
        $this->instSharedSecret = $sharedSecret;

        // check POST for valid params for basic LTI request
        if (!$this->isBasicLtiRequest()) {
            $this->message = "Missing basic LTI request params.";
            return false;
        }

        $requestConsumerKey = $this->request->request->get('oauth_consumer_key');
        if (empty($requestConsumerKey)) {
            $this->message = "Missing consumer key in request params.";
            return false;
        }

        if ($this->instConsumerKey !== $requestConsumerKey) {
            $this->message = "Consumer key does not match for this institution.";
            return false;
        }

        if (!$this->checkTimestamp()) {
            $this->message = 'Request timestamp is too old.';
            return false;
        }

        if (!$this->checkSignature()) {
            $this->message = 'Invalid request signature.';
            return false;
        }

        return true;
    }

    public function getMessage()
    {
        return $this->message;
    }

    public function isBasicLtiRequest()
    {
        $msgType = ("basic-lti-launch-request" === $this->request->request->get('lti_message_type'));
        $ltiVersion = ("LTI-1p0" === $this->request->request->get('lti_version'));
        $resourceLinkId = !empty($this->request->request->get('resource_link_id'));

        return ($msgType && $ltiVersion && $resourceLinkId);
    }

    /**
     * all-in-one function to check the signature on a request
     * should guess the signature method appropriately
     */
    private function checkSignature()
    {
        $baseString = $this->getSignatureBaseString();
        $sharedSecret = str_replace('+', ' ', str_replace('%7E', '~', rawurlencode($this->instSharedSecret)));
        $keyParts = [$sharedSecret, ''];
        $key = implode('&', $keyParts);

        $computed_signature = base64_encode(hash_hmac('sha1', $baseString, $key, true));
        
        return $computed_signature;
    }

    /**
     * check that the timestamp is new enough
     */
    private function checkTimestamp()
    {
        $timestamp = $this->request->request->get('oauth_timestamp');
        $now = time();

        return (($now - $timestamp) > $this->timestampThreshold); 
    }

    private function getSignatureBaseString()
    {
        $parts = [
            $this->getHttpMethod(),
            $this->getHttpUrl(),
            $this->getSignableParameters(),
        ];

        $parts = $this->urlEncode($parts);

        return implode('&', $parts);
    }

    private function getHttpMethod() 
    {
        return strtoupper($this->request->server->get('REQUEST_METHOD'));
    }

    private function getHttpUrl()
    {
        $server = $this->request->server;
        $port = $server->get('SERVER_PORT');
        $host = $server->get('HTTP_HOST');
        $path = $server->get('REQUEST_URI');
        $portStr = '';
        
        if ($port != "80" && $port != "443" && (strpos(':', $host) < 0)) {
            $portStr =  ':' . $port;
        }

        return 'https://' . $host . $portStr . $path;
    }

    /**
     * @return string
     */
    private function getSignableParameters()
    {
        $params = [];
        $post = $this->request->request->all();

        foreach ($post as $key => $val) {
            // Ref: Spec: 9.1.1 ("The oauth_signature parameter MUST be excluded.")
            if ('oauth_signature' !== $key) {
                $params[$key] = stripslashes($val);
            }
        }

        $get = $this->request->query->all();
        foreach ($get as $key => $val) {
            $params[$key] = urldecode($val);
        }
        
        return $this->buildHttpQuery($params);
    }

    /**
     *
     * @param array $params
     * @return string
     */
    private function buildHttpQuery($params)
    {
        if (!$params) return '';

        $keys = $this->urlEncode(array_keys($params));
        $values = $this->urlEncode(array_values($params));
        $params = array_combine($keys, $values);

        // Parameters are sorted by name, using lexicographical byte value ordering.
        // Ref: Spec: 9.1.1 (1)
        uksort($params, 'strcmp');

        $pairs = array();
        foreach ($params as $parameter => $value) {
            if (is_array($value)) {
                // If two or more parameters share the same name, they are sorted by their value
                // Ref: Spec: 9.1.1 (1)
                natsort($value);
                foreach ($value as $duplicate_value) {
                    $pairs[] = $parameter . '=' . $duplicate_value;
                }
            } else {
                $pairs[] = $parameter . '=' . $value;
            }
        }
        
        return implode('&', $pairs);
    }

    private function urlEncode($input) {
        if (is_array($input)) {
            return array_map([$this, 'urlEncode'], $input);
        } 
        else if (is_scalar($input)) {
            return str_replace('+', ' ', str_replace('%7E', '~', rawurlencode($input)));
        } 
        
        return '';
    }
}