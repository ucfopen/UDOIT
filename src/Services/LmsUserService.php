<?php

namespace App\Services;

use App\Entity\User;
use App\Services\LmsApiService;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\HttpClient\HttpClient;

use Psr\Log\LoggerInterface;

class LmsUserService {

    /** @var App\Services\LmsApiService $lmsApi */
    protected $lmsApi;

    /** @var ManagerRegistry $doctrine */
    protected $doctrine;

    /** @var UtilityService $util */
    protected $util;

    private $logger;

    public function __construct(LmsApiService $lmsApi, ManagerRegistry $doctrine, UtilityService $util, LoggerInterface $logger)
    {
        $this->lmsApi = $lmsApi;
        $this->doctrine = $doctrine;
        $this->util = $util;
        $this->logger = $logger;
    }

    public static function getOauthRedirectUri()
    {
        return $_ENV['BASE_URL'] . $_ENV['APP_OAUTH_REDIRECT_PATH'];
    }

    /**
     * Returns true if API key has been validated.
     *
     * @param User $user
     * @return bool
     */
    public function validateApiKey(User $user)
    {
        $apiKey = $user->getApiKey();
        $lms = $this->lmsApi->getLms();

        if (empty($apiKey)) {
            return false;
        }

        try {
            return $lms->testApiConnection($user);
        }
        catch (\Exception $e) {
            $this->refreshApiKey($user);
        }

        try {
            return $lms->testApiConnection($user);
        }
        catch (\Exception $e) {
            $this->util->exitWithMessage($e->getMessage());
        }
    }

    public function refreshApiKey(User $user)
    {
        $refreshToken = $user->getRefreshToken();
        $institution = $user->getInstitution();;

        if (empty($refreshToken)) {
            return false;
        }

        $options = [
            'body' => [
                'grant_type'    => 'refresh_token',
                'client_id'     => $institution->getApiClientId(),
                'redirect_uri'  => self::getOauthRedirectUri(),
                'client_secret' => $institution->getApiClientSecret(),
                'refresh_token' => $refreshToken,
            ],
            'verify_host' => false,
            'verify_peer' => false,
        ];

        $client = HttpClient::create();
        $requestUrl = $this->lmsApi->getLms()->getOauthTokenUri($institution);
        $response = $client->request('POST', $requestUrl, $options);
        $contentStr = $response->getContent(false);
        $newKey = \json_decode($contentStr, true);

        // update the token in the database
        if (isset($newKey['access_token'])) {
            $this->updateUserToken($user, $newKey);

            return true;
        } else {
            return false;
        }
    }

    public function updateUserToken(User $user, $apiKey)
    {
        if (!empty($apiKey['access_token'])) {
            $user->setApiKey($apiKey['access_token']);
        }
        if (isset($apiKey['refresh_token'])) {
            $user->setRefreshToken($apiKey['refresh_token']);
        }

        $now = new \DateTime();
        $user->setLastLogin($now);

        $this->doctrine->getManager()->flush();
    }
}
