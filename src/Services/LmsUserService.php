<?php

namespace App\Services;

use App\Entity\User;
use App\Services\LmsApiService;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpClient\Exception\TimeoutException;

class LmsUserService {

    /** @var App\Services\LmsApiService $lmsApi */
    protected $lmsApi;

    /** @var ManagerRegistry $doctrine */
    protected $doctrine;

    /** @var UtilityService $util */
    protected $util;

    public function __construct(LmsApiService $lmsApi, ManagerRegistry $doctrine, UtilityService $util)
    {
        $this->lmsApi = $lmsApi;
        $this->doctrine = $doctrine;
        $this->util = $util;
    }

    public static function getOauthRedirectUri()
    {
        return $_ENV['BASE_URL'] . $_ENV['APP_OAUTH_REDIRECT_PATH'];
    }

    // Returns true if API key has been validated.
    public function validateApiKey(User $user): bool
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
            if(!$this->refreshApiKey($user)) {
                return false;
            }
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
        $userAgent = 'UDOIT/' . !empty($_ENV['VERSION_NUMBER']) ? $_ENV['VERSION_NUMBER'] : '4.0.0';

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
            'headers' => [
                'User-Agent' => $userAgent,
            ],
            'verify_host' => false,
            'verify_peer' => false,
        ];

        if (isset($_ENV['HEROKU_TIMEOUT'])) {
            $options['timeout'] = $_ENV['HEROKU_TIMEOUT'];
        }

        $client = HttpClient::create();
        $requestUrl = $this->lmsApi->getLms()->getOauthTokenUri($institution);
        try {
            $response = $client->request('POST', $requestUrl, $options);
            $contentStr = $response->getContent(false);
            $newKey = \json_decode($contentStr, true);
        } catch (TimeoutException) {
            $newKey = null;
        }


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
