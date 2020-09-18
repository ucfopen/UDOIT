<?php

namespace App\Lms;

use Symfony\Contracts\HttpClient\ResponseInterface;

/**
 * LmsResponse holds the API response(s) for an LMS API request.
 * 
 * Since API requests may return any number of results, we may need to make
 * multiple requests to get all the data. This object will hold all 
 * responses for those requests.
 */

class LmsResponse implements \JsonSerializable {

    private $contentString = '';
    private $contentArray = [];
    private $contentType = '';
    private $responses = [];
    private $headers = [];
    private $errors = [];

    public function __construct($contentType = '')
    {
        $this->contentType = $contentType;
    }

    public function getHeaders()
    {
        return $this->headers;
    }

    public function setHeader($headers)
    {
        $this->headers = array_merge($this->headers, $headers);
    }

    public function getContent()
    {
        if (strpos($this->contentType, 'json') !== false) {
            return $this->contentArray;
        }
        else {
            return $this->contentString;
        }
    }

    public function setContent($content)
    {
        $results = \json_decode($content, true);

        if ($results === null) {
            $this->contentString .= $results;
        }
        else {            
            $this->contentArray = array_merge($this->contentArray, $results);
        }
    }

    public function getErrors()
    {
        return $this->errors;
    }

    public function setError($error)
    {
        $this->errors[] = $error;
    }

    public function setResponse(ResponseInterface $response)
    {
        $this->responses[] = $response;
        $headers = $response->getHeaders(false);
        $content = $response->getContent(false);

        $this->setContent($content);
        $this->setHeader($headers);
        $this->contentType = (is_array($headers['content-type'])) ? $headers['content-type'][0] : false;
    }

    public function jsonSerialize()
    {
        return [
            'content' => $this->getContent(),
            'errors' => $this->errors,
            'headers' => $this->headers,
        ];
    }
}