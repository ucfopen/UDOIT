<?php

namespace App\Services;

use App\Entity\ContentItem;

use DOMDocument;

use Aws\Credentials\Credentials;
use Aws\Signature\SignatureV4;

use GuzzleHttp\Psr7;
use GuzzleHttp\Promise;
use GuzzleHttp\Client;
use Psr\Http\Message\RequestInterface;

// Take in a bundle of ContentItems and
// send asynchronous requests to a Lambda function's API gateway 

class AsyncEqualAccessReport {


    /** @var App\Service\HtmlService */
    protected $htmlService;

    private $client;

    private $awsAccessKeyId;
    private $awsSecretAccessKey;
    private $awsRegion;
    private $host;
    private $endpoint;
    private $canonicalUri;

    public function __construct()
    {
        $this->loadConfig();
    }

    private function loadConfig()
    {
        // Load variables for AWS
        $this->awsAccessKeyId = $_ENV['AWS_ACCESS_KEY_ID'];
        $this->awsSecretAccessKey = $_ENV['AWS_SECRET_ACCESS_KEY'];
        $this->awsRegion = $_ENV['AWS_REGION'];
        $this->host = $_ENV['AWS_HOST'];
        $this->canonicalUri = $_ENV['AWS_CANONICAL_URI'];
        $this->endpoint = "https://{$this->host}/{$this->canonicalUri}";
    }

    public function logToServer(string $message) {
        $options = [
            'http' => [
                'header' => "Content-type: text/html\r\n",
                'method' => 'POST',
                'content' => $message,
            ],
        ];
        
        $context = stream_context_create($options);
        file_get_contents("http://host.docker.internal:3000/log", false, $context);
    }

    function sign(RequestInterface $request): RequestInterface {
        $signature = new SignatureV4('execute-api', $this->awsRegion);
        $credentials = new Credentials($this->awsAccessKeyId, $this->awsSecretAccessKey);

        return $signature->signRequest($request, $credentials);
    }

    public function postMultipleAsync(array $contentItems): array {
        $promises = [];
        $client = new Client();
        $contentItemsReport = []; 
        
        // Iterate through each scannable Canvas page and add a new
        // POST request to our array of promises 
        foreach ($contentItems as $contentItem) {
            $this->logToServer("Checking: {$contentItem->getTitle()}");
            // Clean up the content item's HTML document
            $html = $contentItem->getBody();
            $document = $this->getDomDocument($html)->saveHTML();
            $payload = json_encode(["html" => $document]);

            $request = new Psr7\Request(
                "POST",
                "{$this->endpoint}",
                [
                    "Content-Type" => "application/json",
                ],
                $payload,
            );

            $signedRequest = $this->sign($request);
            $this->logToServer("Sending to promise array...");
            $promises[] = $client->sendAsync($signedRequest);
        }

        // Wait for all the POSTs to resolve and save them into an array
        // Each promise is resolved into an array with a "state" key (fulfilled/rejected) and "value" (the JSON)
        $results = Promise\Utils::unwrap($promises);

        // Save the report for the content item into an array.
        // They should (in theory) be in the same order they were sent in.
        foreach ($results as $result) {
            $response = $result->getBody()->getContents();
            $json = json_decode($response, true);
            // $this->logToServer(json_encode($json, JSON_PRETTY_PRINT));

            $this->logToServer("Saving to contentItemsReport...");
            $contentItemsReport[] = $json;
        }

        return $contentItemsReport;
    }

    public function postSingleAsync(ContentItem $contentItem) {
        // Scan a single content item
        $client = new Client();
        
        // Clean up the content item's HTML document
        $html = $contentItem->getBody();
        $document = $this->getDomDocument($html)->saveHTML();
        $payload = json_encode(["html" => $document]);

        $request = new Psr7\Request(
            "POST",
            "{$this->endpoint}",
            [
                "Content-Type" => "application/json",
            ],
            $payload,
        );

        $signedRequest = $this->sign($request);

        // POST document to Lambda and wait for fulfillment 
        $this->logToServer("Sending to single promise...");
        $promise = $client->sendAsync($signedRequest);
        // $promise->then(function($response) {
        //     $this->logToServer("Fulfilled!");
        //     $responseContents = $response->getBody()->getContents();
        //     $report = json_decode($responseContents, true);
        //     return $report;
        // });

        $response = $promise->wait();

        
        if ($response) {
            $this->logToServer("Fulfilled!");
            $contents = $response->getBody()->getContents();
            $this->logToServer(json_encode($contents));
            $report = json_decode($contents, true);
        }

        // Return the single Equal Access report
        return $report;
    }

    public function getDomDocument($html) {
        $dom = new DOMDocument('1.0', 'utf-8');
        if (strpos($html, '<?xml encoding="utf-8"') !== false) {
            $dom->loadHTML("<html><body>{$html}</body></html>", LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        } else {
            $dom->loadHTML("<?xml encoding=\"utf-8\" ?><html><body>{$html}</body></html>", LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        }

        return $dom;

    }

}
