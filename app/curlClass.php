<?php

class Curl
{
    /**
     * Parses header links to look for more pages
     * @param  string $header The response headers string
     * @return mixed          The matched string or false if not found
     */
    static function parse_link($header)
    {
        $links = explode(',', $header['Link']);

        foreach ($links as $link) {
            if (preg_match('/rel=\"last\"/', $link)) {
                preg_match('/page=([0-9]+)/', $link, $matches);
                return $matches[1];
            }
        }

        return false;
    }
    /**
     * Performs a Get request
     * @param  string  $url         url of the request
     * @param  boolean $decode_json Whether to decode the response json or not
     * @param  array  $customCurl   An array of custom curls to set with the constant as the key
     * @param  boolean $info        Whether to return the response
     * @return mixed                A string or object of the response 
     */
    static function get($url, $decode_json = false, $customCurl = null, $info = false)
    {
        $url = str_replace(" ", "%20", $url);
        $param = array(
            CURLOPT_URL => $url,
        );

        if (count($customCurl) > 0) {
            foreach ($customCurl as $key => $value)  {
                $param[$key] = $value;
            }
        }

        $response = self::base($param, true, $info);
        
        if ($decode_json) {
            if ($info) {
                $return  = array();
                $return['response'] = json_decode($response);
                $return['info'] = get_headers($url, 1);

                return $return;
            } else {
                return json_decode($response);
            }
        } else {
            return $response;
        }
    }

    /**
     * Perform a post request
     * @param  string  $url         The url string to send the post request to
     * @param  array  $postdata     An array of post data to send
     * @param  boolean $decode_json Whether to decode the json response or not
     * @param  array   $customCurl  Any custom curl requests to add
     * @param  boolean $info        Whether to return the response or not
     * @return mixed                String or object as response from curl call
     */
    static function post($url, $postdata, $decode_json = false, $customCurl = array(), $info = false)
    {
        $url = str_replace(" ", "%20", $url);
        $param = array(
            CURLOPT_URL => $url,
            CURLOPT_POSTFIELDS => $postdata,
        );

        if (count($customCurl) > 0) {
            foreach ($customCurl as $key => $value) {
                $param[$key] = $value;
            }
        }

        $response = self::base($param, true, $info);

        if ($decode_json) {
            if ($info) {
                $return  = array();
                $return['response'] = json_decode($response);
                $return['info'] = json_decode($response['info']);

                return $return;
            } else {
                return json_decode($response);
            }
        } else {
            return $response;
        }
    }

    /**
     * Performs delete curl request
     * @param  string $url String of the url to send delete request to
     * @return string      Return string if any
     */
    static function delete($url)
    {
        $url = str_replace(" ", "%20", $url);
        $param = array(
            CURLOPT_URL => $url,
            CURLOPT_CUSTOMREQUEST => 'DELETE',
        );
        $response = self::base($param, true, true);

        return $response;
    }
    /**
     * Perform a put request
     * @param  string  $url         The url string to send the post request to
     * @param  array   $putData     An array of put data to send
     * @param  boolean $decode_json Whether to decode the json response or not
     * @param  array   $customCurl  Any custom curl requests to add
     * @param  boolean $info        Whether to return the response or not
     * @return mixed                String or object as response from curl call
     */
    static function put($url, $putData, $decode_json = false, $customCurl = array(), $info = false)
    {
        $url = str_replace(" ", "%20", $url);
        $param = array(
            CURLOPT_URL => $url,
            CURLOPT_POSTFIELDS => $putData,
            CURLOPT_CUSTOMREQUEST => "PUT",
        );

        if (count($customCurl) > 0) {
            foreach ($customCurl as $key => $value) {
                $param[$key] = $value;
            }
        }

        $response = self::base($param, true, $info);

        if ($decode_json) {
            if($info) {
                $return  = array();
                $return['response'] = json_decode($response);
                $return['info'] = $return['response']->info;
            } else {
                return json_decode($response);
            }
        } else {
            return $response;
        }
    }

    /**
     * A base curl call to perform
     * @param  array   $param       Parameters to set the set options to
     * @param  boolean $skipSSL     Whether to skip the SSL authentication or not
     * @param  boolean $parseHeader unused
     * @return string               Response string
     */
    static private function base($param, $skipSSL = false, $parseHeader = false)
    {
        $ch = curl_init();
        curl_setopt($ch,CURLOPT_TIMEOUT,0);

        foreach ($param as $constant => $value) {
            curl_setopt($ch, $constant, $value); 
        }

        curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);

        if ($skipSSL) {
            curl_setopt ($ch, CURLOPT_SSL_VERIFYHOST, 0);
            curl_setopt ($ch, CURLOPT_SSL_VERIFYPEER, 0);
        }

        $error = curl_error($ch);

        if ($error) {
            \Log::error('An error occured: '.$error);
        }

        $response = curl_exec($ch);

        curl_close($ch);
        
        return $response;
    }

    static function multithread($urls)
    {
        $handles = array();
        $result = array();

        $mh = curl_multi_init();

        foreach ($urls as $url) {
            $handles[$url] = curl_init();
            curl_setopt($handles[$url], CURLOPT_URL, $url);
            curl_setopt($handles[$url], CURLOPT_MAXCONNECTS, 50);
            curl_setopt($handles[$url], CURLOPT_HEADER, 0);
            curl_setopt($handles[$url], CURLOPT_RETURNTRANSFER, 1);

            curl_multi_add_handle($mh, $handles[$url]);
        }

        $running = null;

        do {
            curl_multi_exec($mh, $running);
        } while ($running > 0);

        foreach ($handles as $handle => $content) {
            $result[] = curl_multi_getcontent($content);
            curl_multi_remove_handle($mh, $content);
        }

        curl_multi_close($mh);

        return $result;
    }
}
