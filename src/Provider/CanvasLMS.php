<?php

namespace App\Provider;

use League\OAuth2\Client\Provider\AbstractProvider;
use League\OAuth2\Client\Provider\Exception\IdentityProviderException;
use League\OAuth2\Client\Token\AccessToken;
use League\OAuth2\Client\Tool\ArrayAccessorTrait;
use League\OAuth2\Client\Tool\BearerAuthorizationTrait;
use Psr\Http\Message\ResponseInterface;
use smtech\OAuth2\Client\Provider\CanvasLMSResourceOwner;

class CanvasLMS extends AbstractProvider
{

    use ArrayAccessorTrait,
        BearerAuthorizationTrait;

    /**
     * URL of Canvas Instance (e.g. https://canvas.instructure.com)
     * @var string
     */
    protected $canvasInstanceUrl;

    /**
     * Human-readable purpose for which API access token will be issued
     * @var string
     */
    protected $purpose;

    /**
     * Type of token requested (`authorization_code` or `refresh_token`)
     * @var [type]
     */
    protected $grantType;
    /* TODO https://github.com/smtech/oauth2-canvaslms/issues/1 */

    protected $scopes = [];

    protected function getAuthorizationParameters(array $options)
    {
        $options = parent::getAuthorizationParameters($options);
        $options['purpose'] = $this->purpose;
        return $options;
    }

    public function getBaseAuthorizationUrl()
    {
        return "{$this->canvasInstanceUrl}/login/oauth2/auth";
    }

    public function getBaseAccessTokenUrl(array $params)
    {
        return "{$this->canvasInstanceUrl}/login/oauth2/token";
    }

    public function getResourceOwnerDetailsUrl(AccessToken $token)
    {
        return "{$this->canvasInstanceUrl}/api/v1/users/self";
    }

    public function getDefaultScopes()
    {
        return $this->scopes;
    }

    public function checkResponse(ResponseInterface $response, $data)
    {
        if (!empty($data['error'])) {
            throw new IdentityProviderException($data['error_description'], $response->getStatusCode(), $response);
        }
    }

    public function createResourceOwner(array $response, AccessToken $token)
    {
        return new CanvasLMSResourceOwner($response);
    }

    public function getAccessTokenRequest(array $params)
    {
        $request = parent::getAccessTokenRequest($params);
        $uri = $request->getUri()->withUserInfo($this->clientId, $this->clientSecret);
        return $request->withUri($uri);
    }

    protected function getScopeSeparator()
    {
        if (!isset($this->scopeSeparator)) {
            $this->scopeSeparator = ' ';
        }
        return $this->scopeSeparator;
    }
}
