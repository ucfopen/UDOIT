<?php
namespace App\Services;

use Exception;

class AwsApiAccessibilityService
{
    private $awsAccessKeyId;
    private $awsSecretAccessKey;
    private $awsRegion;
    private $service;
    private $host;
    private $endpoint;
    private $htmlService;

    public function __construct()
    {
        $this->loadConfig();
    }

    private function loadConfig()
    {
        $this->awsAccessKeyId = $_ENV['AWS_ACCESS_KEY_ID'];
        $this->awsSecretAccessKey = $_ENV['AWS_SECRET_ACCESS_KEY'];
        $this->awsRegion = "us-east-2";
        $this->service = "execute-api";
        $this->host = "kxm63nv0uk.execute-api.us-east-2.amazonaws.com";
        $this->endpoint = "https://kxm63nv0uk.execute-api.us-east-2.amazonaws.com/Test/generate-accessibility-report";
    }

    public function scanHtml($html)
    {
        $requestPayload = json_encode(["html" => [$html]]);
        
        $amzDate = gmdate('Ymd\THis\Z');
        $dateStamp = gmdate('Ymd');
        $canonicalUri = "/Test/generate-accessibility-report";
        $canonicalQuerystring = "";
        $canonicalHeaders = "content-type:application/json\nhost:{$this->host}\nx-amz-date:{$amzDate}\n";
        $signedHeaders = "content-type;host;x-amz-date";
        $payloadHash = hash('sha256', $requestPayload);
        
        $canonicalRequest = "POST\n{$canonicalUri}\n{$canonicalQuerystring}\n{$canonicalHeaders}\n{$signedHeaders}\n{$payloadHash}";
        $algorithm = "AWS4-HMAC-SHA256";
        $credentialScope = "{$dateStamp}/{$this->awsRegion}/{$this->service}/aws4_request";
        $stringToSign = "{$algorithm}\n{$amzDate}\n{$credentialScope}\n" . hash('sha256', $canonicalRequest);
        
        $signingKey = $this->getSignatureKey($this->awsSecretAccessKey, $dateStamp, $this->awsRegion, $this->service);
        $signature = hash_hmac('sha256', $stringToSign, $signingKey);
        
        $authorizationHeader = 
            "{$algorithm} Credential={$this->awsAccessKeyId}/{$credentialScope}, " .
            "SignedHeaders={$signedHeaders}, Signature={$signature}";
        
        $headers = [
            'Content-Type: application/json',
            "x-amz-date: {$amzDate}",
            "Authorization: {$authorizationHeader}"
        ];

        $json = $this->makeRequest($requestPayload, $headers);

        // the json is wrapped in an extra set of [], could somehow be changed in the server maybe?
        return json_encode($json[0]);
    }

    private function getSignatureKey($key, $dateStamp, $regionName, $serviceName)
    {
        $kDate = hash_hmac('sha256', $dateStamp, "AWS4" . $key, true);
        $kRegion = hash_hmac('sha256', $regionName, $kDate, true);
        $kService = hash_hmac('sha256', $serviceName, $kRegion, true);
        return hash_hmac('sha256', "aws4_request", $kService, true);
    }

    private function makeRequest($requestPayload, $headers)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $requestPayload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
        try {
            $response = curl_exec($ch);
            
            if ($response === false) {
                throw new Exception(curl_error($ch), curl_errno($ch));
            }
            
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            
            if ($httpCode >= 400) {
                throw new Exception("HTTP Error: " . $httpCode);
            }
            
            $jsonResponse = json_decode($response, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception("Invalid JSON response");
            }
            
            return $jsonResponse;
        } catch (Exception $e) {
            error_log("An error occurred: " . $e->getMessage());
            return null;
        } finally {
            curl_close($ch);
        }
    }
}
