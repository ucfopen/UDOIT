<?php

namespace App\Services;

use App\Entity\ContentItem;
use App\Services\EqualAccessService;

use DOMDocument;
use DOMXPath;

use GuzzleHttp\Promise;
use GuzzleHttp\Client;
use Symfony\Component\VarExporter\VarExporter;

use Psr\Http\Message\RequestInterface;
use GuzzleHttp\Psr7\Request;
use Aws\Signature\SignatureV4;
use Aws\Credentials\Credentials;

// Asynchronously ...

class AsyncEqualAccessReport {

    private $client;

    protected $awsRegion;
    protected $awsAccessKeyId;
    protected $awsSecretAccessKey;
    protected $endpoint;

    public function __construct() {
        $this->awsRegion = $_ENV["AWS_REGION"];
        $this->awsAccessKeyId = $_ENV["AWS_ACCESS_KEY_ID"];
        $this->awsSecretAccessKey = $_ENV["AWS_SECRET_ACCESS_KEY"];
        $this->endpoint = "https://" . $_ENV["AWS_HOST"] . "/" . $_ENV["AWS_CANONICAL_URI"];
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

    public function sign(RequestInterface $request): RequestInterface {
        $signature = new SignatureV4('execute-api', $this->awsRegion);
        $credentials = new Credentials($this->awsAccessKeyId, $this->awsSecretAccessKey);

        return $signature->signRequest($request, $credentials);
    }

    public function createRequest($payload) {
        return new Request(
            "POST",
            "{$this->endpoint}",
            [
                "Content-Type" => "application/json",
            ],
            $payload,
        );
    }

    public function postMultipleArrayAsync(array $contentItems): array {
        $promises = [];
        $client = new Client();
        $contentItemsReport = [];

        $this->logToServer("Count contentItems:");
        $this->logToServer(count($contentItems));

        // Combine every 10 pages into a request
        $htmlArray = [];
        $counter = 0;
        foreach ($contentItems as $contentItem) {
            if ($counter >= 10) {
                // Reached our counter limit, create a new payload
                // $pagesPayload = json_encode($htmlArray);
                $payload = json_encode([
                    "html" => $htmlArray,
                ]);

                $this->logToServer("Creating payload with size 10!");

                $request = $this->createRequest($payload);
                $signedRequest = $this->sign($request);

                $promises[] = $client->sendAsync($signedRequest);
                $counter = 0;
                $htmlArray = [];
            }

            // Clean up and push a page into an array
            $html = $contentItem->getBody();
            $document = $this->getDomDocument($html)->saveHTML();
            array_push($htmlArray, $document);
            
            $counter++;
        }

        // Send out any leftover pages
        if (count($htmlArray) > 0) {
            $this->logToServer("Found some leftovers");
            // $pagesPayload = json_encode($htmlArray);

            $this->logToServer(json_encode($htmlArray));
            $payload = json_encode([
                "html" => $htmlArray,
            ]);

            $request = $this->createRequest($payload);
            $signedRequest = $this->sign($request);

            $promises[] = $client->sendAsync($signedRequest);
        }


        $this->logToServer("waiting for promises...");
        $this->logToServer(count($promises));

        $results = Promise\Utils::unwrap($promises);

        $this->logToServer($results);
        foreach ($results as $result) {
            $response = $result->getBody()->getContents();
            $json = json_decode($response, true);
            $contentItemsReport[] = $json;
        }

        $this->logToServer("Number of contentItems we're sending back:");
        $this->logToServer(count($contentItemsReport));

        return $contentItemsReport;
    }


    public function postMultipleAsync(array $contentItems): array {
        $promises = [];

        $client = new Client();
        
        // Iterate through each scannable Canvas page and add a new
        // POST request to our array of promises 
        foreach ($contentItems as $contentItem) {
            // $this->logToServer("Checking: {$contentItem->getTitle()}");
            // Clean up the content item's HTML document
            $html = $contentItem->getBody();
            $document = $this->getDomDocument($html)->saveHTML();
            // $this->logToServer($document);

            $payload = json_encode([
                "html" => $document
            ]);

            $request = $this->createRequest($payload);

            $signedRequest = $this->sign($request);
            $this->logToServer("Sending to promise array...");
            $promises[] = $client->sendAsync($signedRequest);
        }

        // Wait for all the POSTs to resolve and save them into an array
        // Each promise is resolved into an array with a "state" key (fulfilled/rejected) and "value" (the JSON)
        $results = Promise\Utils::unwrap($promises);
        // $this->logToServer(json_encode($results, JSON_PRETTY_PRINT));

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
        $report = null;

        // Scan a single content item
        $client = new Client();
        
        // Clean up the content item's HTML document
        $html = $contentItem->getBody();
        $document = $this->getDomDocument($html)->saveHTML();
        $payload = json_encode(["html" => $document]);

        $request = $this->createRequest($payload);

        $signedRequest = $this->sign($request);

        // POST document to Lambda and wait for fulfillment 
        // $this->logToServer("Sending to single promise...");
        $promise = $client->sendAsync($signedRequest);
        $response = $promise->wait();

        if ($response) {
            // $this->logToServer("Fulfilled!");
            $contents = $response->getBody()->getContents();
            $report = json_decode($contents, true);
        }

        return $report;
    }

    public function getDomDocument($html)
    {
        // Load the HTML string into a DOMDocument that PHP can parse.
        // TODO: checks for if <html>, <body>, or <head> and <style> exist? technically canvas will always remove them if they are present in the HTML editor
        // but you never know, also the loadHTML string is pretty long and kinda unreadable, could individually load in each element maybe
        $dom = new DOMDocument('1.0', 'utf-8');
        libxml_use_internal_errors(true);

        // Set the default background color and text color in the DOMDocument's <style>
        $envBackgroundColor = $_ENV['BACKGROUND_COLOR'];
        $envTextColor = $_ENV['TEXT_COLOR'];

        if (strpos($html, '<?xml encoding="utf-8"') !== false) {
            $dom->loadHTML("<html><style>body{background-color:{$envBackgroundColor};color:{$envTextColor}}</style><body>{$html}</body></html>", LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        } else {
            $dom->loadHTML("<?xml encoding=\"utf-8\" ?><html><style>body{background-color:{$envBackgroundColor};color:{$envTextColor}}</style><body>{$html}</body></html>", LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        }

        return $dom;
    }


}
