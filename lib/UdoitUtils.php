<?php session_start();
use Httpful\Request;

/**
*   Copyright (C) 2014 University of Central Florida, created by Jacob Bates, Eric Colon, Fenel Joseph, and Emily Sachs.
*
*   This program is free software: you can redistribute it and/or modify
*   it under the terms of the GNU General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.
*
*   This program is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU General Public License for more details.
*
*   You should have received a copy of the GNU General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
*   Primary Author Contact:  Jacob Bates <jacob.bates@ucf.edu>
*/
class UdoitUtils
{
    public static $canvas_oauth_id;
    public static $canvas_oauth_key;
    public static $canvas_oauth_uri;
    public static $canvas_consumer_key;
    public static $canvas_secret_key;
    public static $canvas_base_url;
    public static $curl_ssl_verify;
    public static $canvas_enforce_scopes;
    public static $canvas_scopes;

    private static $instance;

    public static function instance()
    {
        if (!isset(self::$instance)) {
            self::$instance = new UdoitUtils();
        }

        return self::$instance;
    }

    public static function setupOauth($id, $key, $uri, $consumer_key, $secret, $curl_ssl_verify = true, $enforce_scopes = false, $scopes = [])
    {
        self::$canvas_oauth_id = $id;
        self::$canvas_oauth_key = $key;
        self::$canvas_oauth_uri = $uri;
        self::$canvas_consumer_key = $consumer_key;
        self::$canvas_secret_key = $secret;
        self::$curl_ssl_verify = $curl_ssl_verify;
        self::$canvas_enforce_scopes = $enforce_scopes;
        self::$canvas_scopes = $scopes;
    }

    public function exitWithPageError($error)
    {
        global $logger;
        $templates = new League\Plates\Engine(__DIR__.'/../templates');
        echo($templates->render('error', ['error' => $error]));
        $logger->addError($error);

        exit();
    }

    public function exitWithPartialError($error)
    {
        global $logger;
        $templates = new League\Plates\Engine(__DIR__.'/../templates');
        echo($templates->render('partials/error', ['error' => $error]));
        $logger->addError($error);

        exit();
    }

    public function getLocalApiKey($user_id)
    {
        global $db_user_table;
        $sth = UdoitDB::prepare("SELECT api_key, canvas_url FROM {$db_user_table} WHERE id = :userid LIMIT 1");
        $sth->bindValue(':userid', $user_id, PDO::PARAM_INT);
        $sth->execute();

        if ($result = $sth->fetchObject()) {
            if (empty($result->canvas_url)) {
                return false;
            }
            self::$canvas_base_url = $result->canvas_url;

            return $result->api_key;
        }

        return false;
    }

    public function getValidRefreshedApiKey($user_id)
    {
        // check our db for an existing api key
        $api_key = UdoitUtils::instance()->getLocalApiKey($user_id);

        if (!empty($api_key)) {
            if (UdoitUtils::instance()->validateApiKey($user_id, $api_key)) {
                return $api_key;
            }
            if ($api_key = UdoitUtils::instance()->refreshApiKey($user_id)) {
                return $api_key;
            }
        }

        return false;
    }

    public function validateApiKey($user_id, $api_key)
    {
        global $UDOIT_ENV;

        if (empty($user_id) || empty($api_key)) {
            return false;
        }

        // return false for testing
        if (ENV_PROD !== $UDOIT_ENV) {
            return false;
        }

        // @TODO use self
        $url = self::$canvas_base_url."/api/v1/users/{$user_id}/profile";
        $resp = Httpful\Request::get($url)
            ->addHeader('Authorization', "Bearer {$api_key}")
            ->send();

        return isset($resp->body->id);
    }

    /**
     * Abstracts retrieving the refresh token from the database for the current user
     *
     * @param int $user_id ID of Canvas user for which to obtain a refresh token
     *
     * @return string|boolean The token if successful, and false if unsuccessful
     */
    public function getRefreshToken($user_id)
    {
        global $db_user_table;
        global $UDOIT_ENV;

        if (ENV_PROD !== $UDOIT_ENV) {
            return "test-token"; // return false for testing
        }

        $sth = UdoitDB::prepare("SELECT refresh_token FROM {$db_user_table} WHERE id = :userid LIMIT 1");
        $sth->bindValue(':userid', $user_id, PDO::PARAM_INT);
        $sth->execute();
        if ($result = $sth->fetchObject()) {
            return $result->refresh_token;
        }

        return false;
    }

    public function refreshApiKey($user_id)
    {
        global $UDOIT_ENV;
        global $db_user_table;

        $refresh_token = $this->getRefreshToken($user_id);

        if (!$refresh_token) {
            return false;
        }

        $post_data = [
            'grant_type'    => 'refresh_token',
            'client_id'     => self::$canvas_oauth_id,
            'redirect_uri'  => self::$canvas_oauth_uri,
            'client_secret' => self::$canvas_oauth_key,
            'refresh_token' => $refresh_token,
        ];

        $json_result = $this->curlOauthToken(self::$canvas_base_url, $post_data);

        // update the token in the database
        if (isset($json_result->access_token) && $this->validateApiKey($user_id, $json_result->access_token)) {
            $sth = UdoitDB::prepare("UPDATE {$db_user_table} SET api_key = :api_key, refresh_token = :refresh_token WHERE id = :userid");
            $sth->bindValue(':userid', $user_id, PDO::PARAM_INT);
            $sth->bindValue(':api_key', $json_result->access_token, PDO::PARAM_STR);
            $sth->bindValue(':refresh_token', $refresh_token, PDO::PARAM_STR);
            $sth->execute();

            return $json_result->access_token;
        }

        return false;
    }

    public function authorizeNewApiKey($base_url, $code)
    {
        $post_data = [
            'grant_type'    => 'authorization_code',
            'client_id'     => self::$canvas_oauth_id,
            'redirect_uri'  => self::$canvas_oauth_uri,
            'client_secret' => self::$canvas_oauth_key,
            'code'          => $code,
        ];

        if (true === self::$canvas_enforce_scopes) {
            // if we are enforcing scopes we need to take our predefined scope array
            // and implode it to be a long string with spaces between each scope
            // and then URL encode it.
            $post_data['scope'] = urlencode(implode(" ", self::$canvas_scopes));
        }

        return $this->curlOauthToken($base_url, $post_data);
    }

    public function createOrUpdateUser($user_id, $api_key, $refresh_token, $canvas_url)
    {
        global $db_user_table;

        // Try to find the user first
        // Note:  We're not looking for a matching Canvas URL because the id field is unique
        $sth = UdoitDB::prepare("SELECT * FROM {$db_user_table} WHERE id = :userid LIMIT 1");
        $sth->bindValue(':userid', $user_id, PDO::PARAM_INT);
        $sth->execute();

        // If we found the user, update them.  Otherwise, insert a new one.
        if ($result = $sth->fetchObject()) {
            $sth = UdoitDB::prepare("UPDATE {$db_user_table} SET api_key = :api_key, refresh_token = :refresh_token, canvas_url = :canvas_url WHERE id = :userid");
        } else {
            $sth = UdoitDB::prepare("INSERT INTO {$db_user_table} (id, api_key, refresh_token, canvas_url, date_created) VALUES (:userid, :api_key, :refresh_token, :canvas_url, CURRENT_TIMESTAMP)");
        }

        $sth->bindValue(':api_key', $api_key, PDO::PARAM_STR);
        $sth->bindValue(':refresh_token', $refresh_token, PDO::PARAM_STR);
        $sth->bindValue(':userid', $user_id, PDO::PARAM_INT);
        $sth->bindValue(':canvas_url', $canvas_url, PDO::PARAM_STR);

        return $sth->execute();
    }

    public function verifyBasicLTILaunch()
    {
        require_once(__DIR__.'/ims-blti/blti.php');
        $context = new BLTI(self::$canvas_consumer_key, self::$canvas_secret_key, false, false);

        return isset($context->valid) && $context->valid;
    }

    /**
     * Takes an array of report groups and makes sure they are ordered by title
     *
     * @param array $report_groups Report groups to sort
     *
     * @return array An ordered list of report groups
     */
    public function sortReportGroups($report_groups)
    {
        global $logger;

        // sort the report groups expected order:
        $ordered_report_groups = [
            'announcements' => null,
            'assignments'   => null,
            'discussions'   => null,
            'files'         => null,
            'pages'         => null,
            'syllabus'      => null,
            'module_urls'   => null,
            'unscannable'   => null,
        ];

        foreach ($report_groups as $rg) {
            if (!array_key_exists($rg->title, $ordered_report_groups)) {
                $logger->addWarning("{$rg->title} is an unknown report title, it will be omitted from the report.");
                $logger->addInfo("Contents of the unknown report:".print_r($rg, true));
            } else {
                // place the known titles at the correct index
                $ordered_report_groups[$rg->title] = $rg;
            }
        }

        return $ordered_report_groups;
    }

    /**
     * Takes a canvas api key and course ID and returns the course locale
     *
     * @param string $api_key   The Canvas api key
     * @param int    $course_id The ID of the Canvas course
     *
     * @return array An ordered list of report groups
     */
    public function getCourseLocale($api_key, $course_id)
    {
        //Grab course locale from canvas
        $url = self::$canvas_base_url."/api/v1/courses/{$course_id}";
        $resp = Httpful\Request::get($url)
            ->addHeader('Authorization', "Bearer {$api_key}")
            ->send();

        if (isset($resp->body->locale)) {
            return $resp->body->locale;
        }

        return false;
    }

    /**
     * Checks to see if api call has been cached or needs to be made and returns the response object
     *
     * @param string $api_url   The url of the api endpoint
     * @param string $video_url The url of the video which is used as session var identifier
     * @param string $api_key   The api key for the endpoint being called
     *
     * @return object The httpful response object
     */
    public function checkApiCache($api_url, $video_url, $api_key = null)
    {
        global $logger;
        $response = [];
        // Check if session var exists
        // If so, grab response object from session var aka 'cache'
        if (isset($_SESSION[$video_url]) && constant('USE_API_CACHING') != 'false') {
            $response = $_SESSION[$video_url];
            $logger->addInfo("Cached api response used for ".$video_url);
        } else {
            // Else, make api call and cache response in a session var
            $logger->addInfo("Making fresh api call for ".$video_url);
            if (null == $api_key) {
                $resp = Request::get($api_url)->send();
            } else {
                // Vimeo requires the key be added as a header
                $resp = Request::get($api_url)->addHeader('Authorization', "Bearer $api_key")->send();
            }
            $response['code'] = $resp->code;
            $response['body'] = $resp->body;
            $_SESSION[$video_url] = $response;
        }
        // Return response
        return $response;
    }

    /**
     * Check for Safari and redirect to set cookies at top level
     * rather than in an iframe.  Since Chrome and other browsers
     * have Safari in their user agent strings, but Safari does
     * not, we see if Chrome comes first.
     *
     * @return void
     */
    public static function checkSafari()
    {
        if (isset($_SERVER['HTTP_USER_AGENT'])) {
            $chrome_position = stripos($_SERVER['HTTP_USER_AGENT'], 'chrome');
            $safari_position = stripos($_SERVER['HTTP_USER_AGENT'], 'safari');

            if (false !== $safari_position && false === $chrome_position) {
                if (count($_COOKIE) === 0) {
                    header('Location: safari_fix.php');
                    exit;
                }
            }
        }
    }

    /**
     * See if we're loading the udoit.xml.php file
     *
     * @return boolean
     */
    public static function isLoadingXMLSettings()
    {
        $current_file = basename($_SERVER['PHP_SELF']);
        if ('udoit.xml.php' == $current_file) {
            $returnVal = true;
        } else {
            $returnVal = false;
        }

        return $returnVal;
    }

    protected function curlOauthToken($base_url, $post_data)
    {
        global $curl_ssl_verify;

        // @TODO - why not use Httpful here?
        $ch = curl_init("{$base_url}/login/oauth2/token");
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        // Ignore SSL certificates when specified in local config
        // (E.g. when Canvas instance does not have trusted SSL certificates)
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, $curl_ssl_verify);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, $curl_ssl_verify);
        $result = curl_exec($ch);
        curl_close($ch);

        return json_decode($result);
    }
}
