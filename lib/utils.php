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
class Utils
{
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

    public static function getYouTubeId($link_url)
    {
        $matches = null;
        foreach(static::$regex as $pattern) {
            if (preg_match($pattern, $link_url, $matches)) {
                return $matches[1];
            }
        }
        return null;
    }

    public static function exitWithPageError($error) {
        $templates = new League\Plates\Engine('../templates');
        echo($templates->render('error', ['error' => $error]));
        error_log($error);
        exit();
    }

    public static function exitWithPartialError($error) {
        $templates = new League\Plates\Engine('../templates');
        echo($templates->render('partials/error', ['error' => $error]));
        error_log($error);
        exit();
    }

    protected static function curl_oath_token($base_url, $post_data) {
        // @TODO - why not use Httpful here?
        $ch = curl_init("{$base_url}/login/oauth2/token");
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $result = curl_exec($ch);
        curl_close($ch);

        return json_decode($result);
    }

    public static function validate_api_key($user_id, $base_url, $api_key) {
        global $UDOIT_ENV;
        // return false for testing
        if ($UDOIT_ENV !== ENV_PROD) return false;

        $url = "{$base_url}api/v1/users/{$user_id}/profile";
        $resp = Httpful\Request::get($url)
            ->addHeader('Authorization', "Bearer {$api_key}")
            ->send();
        return isset($resp->body->id);
    }

    public static function refresh_api_key($o2_id, $o2_uri, $o2_key, $base_url, $refresh_token) {
        global $UDOIT_ENV;
        if ($UDOIT_ENV !== ENV_PROD) return "test-token"; // return false for testing

        $postdata = [
            'grant_type'    => 'refresh_token',
            'client_id'     => $o2_id,
            'redirect_uri'  => $o2_uri,
            'client_secret' => $o2_key,
            'refresh_token' => $refresh_token
        ];

        $json_result = static::curl_oath_token($base_url, $postdata);

        return isset($json_result->access_token) ? $json_result->access_token : false;
    }

    public static function authorize_new_api_key($o2_id, $o2_uri, $o2_key, $base_url, $code) {

        $postdata = [
            'grant_type'    => 'authorization_code',
            'client_id'     => $o2_id,
            'redirect_uri'  => $o2_uri,
            'client_secret' => $o2_key,
            'code'          => $code
        ];

        return static::curl_oath_token($base_url, $postdata);
    }
}
