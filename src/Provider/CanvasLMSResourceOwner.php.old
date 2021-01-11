<?php

namespace App\Provider;

use League\OAuth2\Client\Provider\ResourceOwnerInterface;
use League\OAuth2\Client\Provider\Exception\IdentityProviderException;

class CanvasLMSResourceOwner implements ResourceOwnerInterface
{

    protected $response;

    public function __construct(array $response = [])
    {
        $this->response = $response;
    }

    public function getId()
    {
        return $this->response['id'];
    }

    public function getName()
    {
        return $this->response['name'];
    }

    public function getSortableName()
    {
        return $this->response['sortable_name'];
    }

    public function getShortName()
    {
        return $this->response['short_name'];
    }

    public function getSISUserId()
    {
        return $this->response['sis_user_id'];
    }

    public function getIntegrationId()
    {
        return $this->response['integration_id'];
    }

    public function getSISLoginId()
    {
        return $this->response['sis_login_id'];
    }

    public function getLoginId()
    {
        return $this->response['login_id'];
    }

    public function getAvatarUrl()
    {
        return $this->response['avatar_url'];
    }

    public function getLocale()
    {
        return $this->response['locale'];
    }

    public function getPermissions()
    {
        return $this->response['permissions'];
    }

    public function toArray()
    {
        return $this->response;
    }
}
