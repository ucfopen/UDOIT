<?php
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
    public static $regex = [
        '@youtube\.com/embed/([^"\& ]+)@i',
        '@youtube\.com/v/([^"\& ]+)@i',
        '@youtube\.com/watch\?v=([^"\& ]+)@i',
        '@youtube\.com/\?v=([^"\& ]+)@i',
        '@youtu\.be/([^"\& ]+)@i',
        '@youtu\.be/v/([^"\& ]+)@i',
        '@youtu\.be/watch\?v=([^"\& ]+)@i',
        '@youtu\.be/\?v=([^"\& ]+)@i',
    ];

    public static function setupOauth($id, $key, $uri, $consumer_key, $secret){
        self::$canvas_oauth_id = $id;
        self::$canvas_oauth_key = $key;
        self::$canvas_oauth_uri = $uri;
        self::$canvas_consumer_key = $consumer_key;
        self::$canvas_secret_key = $secret;
    }

    public static function getYouTubeId($link_url)
    {
        $matches = null;
        foreach(self::$regex as $pattern) {
            if (preg_match($pattern, $link_url, $matches)) {
                return $matches[1];
            }
        }
        return null;
    }

    public static function exitWithPageError($error) {
        $templates = new League\Plates\Engine(__DIR__.'/../templates');
        echo($templates->render('error', ['error' => $error]));
        error_log($error);
        exit();
    }

    public static function exitWithPartialError($error) {
        $templates = new League\Plates\Engine(__DIR__.'/../templates');
        echo($templates->render('partials/error', ['error' => $error]));
        error_log($error);
        exit();
    }

    protected static function curlOauthToken($base_url, $post_data) {
        // @TODO - why not use Httpful here?
        $ch = curl_init("{$base_url}/login/oauth2/token");
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $result = curl_exec($ch);
        curl_close($ch);

        return json_decode($result);
    }

    public static function getLocalApiKey($user_id){
        global $db_user_table;
        $sth = UdoitDB::prepare("SELECT api_key, canvas_url FROM {$db_user_table} WHERE id = :userid LIMIT 1");
        $sth->bindValue(':userid', $user_id, PDO::PARAM_INT);
        $sth->execute();
        if ($result = $sth->fetchObject()){
            self::$canvas_base_url = $result->canvas_url;
            return $result->api_key;
        }
        return false;
    }

    public static function getValidRefreshedApiKey($user_id){
        // check our db for an existing api key
        $api_key = UdoitUtils::getLocalApiKey($user_id);

        if( ! empty($api_key)){
            if(UdoitUtils::validateApiKey($user_id, $api_key)) return $api_key;
            if($api_key = UdoitUtils::refreshApiKey($user_id)) return $api_key;
        }
        return false;
    }

    public static function validateApiKey($user_id, $api_key) {
        global $UDOIT_ENV;

        if(empty($user_id) || empty($api_key)) return false;
        // return false for testing
        if ($UDOIT_ENV !== ENV_PROD) return false;

        // @TODO use self
        $url = self::$canvas_base_url."api/v1/users/{$user_id}/profile";
        $resp = Httpful\Request::get($url)
            ->addHeader('Authorization', "Bearer {$api_key}")
            ->send();
        return isset($resp->body->id);
    }

    // Abstracts retrieving the refresh token from the database for the current user
    public static function getRefreshToken($user_id)
    {
        global $db_user_table;

        if ($UDOIT_ENV !== ENV_PROD) return "test-token"; // return false for testing

        $sth = UdoitDB::prepare("SELECT refresh_token FROM {$db_user_table} WHERE id = :userid LIMIT 1");
        $sth->bindValue(':userid', $user_id, PDO::PARAM_INT);
        $sth->execute();
        if ($result = $sth->fetchObject()) return $result->refresh_token;
        return false;
    }

    public static function refreshApiKey($user_id) {
        global $UDOIT_ENV;
        global $db_user_table;

        $refresh_token = self::getRefreshToken($user_id);

        if( ! $refresh_token) return false;

        $post_data = [
            'grant_type'    => 'refresh_token',
            'client_id'     => self::$canvas_oauth_id,
            'redirect_uri'  => self::$canvas_oauth_uri,
            'client_secret' => self::$canvas_oauth_key,
            'refresh_token' => $refresh_token
        ];

        $json_result = static::curlOauthToken(self::$canvas_base_url, $post_data);

        // update the token in the database
        if(isset($json_result->access_token) && self::validateApiKey($user_id, $json_result->access_token)){
            $sth = UdoitDB::prepare("UPDATE {$db_user_table} set api_key = :api_key, refresh_token = :refresh_token WHERE id = :userid LIMIT 1");
            $sth->bindValue(':userid', $userID, PDO::PARAM_INT);
            $sth->bindValue(':api_key', $json_result->access_token, PDO::PARAM_STR);
            $sth->bindValue(':refresh_token', $json_result->refresh_token, PDO::PARAM_STR);
            $sth->execute();
            return $json_result->access_token;
        }

        return false;
    }

    public static function authorizeNewApiKey($base_url, $code) {
        $post_data = [
            'grant_type'    => 'authorization_code',
            'client_id'     => self::$canvas_oauth_id,
            'redirect_uri'  => self::$canvas_oauth_uri,
            'client_secret' => self::$canvas_oauth_key,
            'code'          => $code
        ];

        return static::curlOauthToken($base_url, $post_data);
    }

    public static function createOrUpdateUser($user_id, $api_key, $refresh_token, $canvas_url){
        global $db_user_table;

        $sth = UdoitDB::prepare("SELECT * FROM {$db_user_table} WHERE id = :userid AND canvas_url = :canvas_url LIMIT 1");
        $sth->bindValue(':userid', $user_id, PDO::PARAM_INT);
        $sth->bindValue(':canvas_url', $canvas_url, PDO::PARAM_STR);
        $sth->execute();

        if ($result = $sth->fetchObject()) {
            $sth = UdoitDB::prepare("UPDATE {$db_user_table} SET api_key = :api_key, refresh_token = :refresh_token WHERE id = :userid");
        } else {
            $sth = UdoitDB::prepare("INSERT INTO {$db_user_table} (id, api_key, refresh_token, canvas_url, date_created) VALUES (:userid, :api_key, :refresh_token, :canvas_url, CURRENT_TIMESTAMP)");
        }

        $sth->bindValue(':api_key', $api_key, PDO::PARAM_STR);
        $sth->bindValue(':refresh_token', $refresh_token, PDO::PARAM_STR);
        $sth->bindValue(':userid', $user_id, PDO::PARAM_INT);
        $sth->bindValue(':canvas_url', $canvas_url, PDO::PARAM_STR);

        return $sth->execute();
    }

    public static function verifyBasicLTILaunch(){
        require_once(__DIR__.'/ims-blti/blti.php');
        $context = new BLTI(self::$canvas_consumer_key, self::$canvas_secret_key, false, false);
        return isset($context->valid) && $context->valid;
    }
}
