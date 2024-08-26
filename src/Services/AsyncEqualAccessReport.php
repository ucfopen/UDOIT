<?php

namespace App\Services;

use App\Entity\ContentItem;
use App\Services\EqualAccessService;

use DOMDocument;
use DOMXPath;

use GuzzleHttp\Promise;
use GuzzleHttp\Client;

// Asynchronously ...

class AsyncEqualAccessReport {

    private $client;

    public function __construct() {
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

    public function postMultipleAsync(array $contentItems) {
        $promises = [];

        $client = new Client([
            "base_uri" => "http://host.docker.internal:3000/",
        ]);
        
        // Iterate through each scannable Canvas page and add a new
        // POST request to our array of promises 
        foreach ($contentItems as $contentItem) {
            $promises[] = $client->postAsync("check", [
                "headers" => [
                    "Content-type" => "text/html",
                ],
                "body" => $contentItem->getBody(),
            ]);
        }

        // Wait for all the POSTs to resolve and save them into an array
        // Each promise is resolved into an array with a "state" key (fulfilled/rejected) and "value" (the JSON)
        $results = Promise\Utils::unwrap($promises);

        foreach ($results as $result) {
            $this->logToServer("____________________");
            $response = $result->getBody()->getContents();
            $json = json_decode($response, true);
            $this->logToServer(json_encode($json, JSON_PRETTY_PRINT));
            foreach ($json["results"] as $pageScan) {
                $equalAccessRule = $pageScan["ruleId"];
                $this->logToServer($equalAccessRule);
            }
            // foreach ($json as $pageScan) {
            //     foreach ($pageScan["results"] as $pageScanResults) {
            //         $equalAccessRule = $pageScanResults["ruleId"];
            //         $this->logToServer("{$equalAccessRule}");
            //     }
            // }
            // $this->logToServer();
            $this->logToServer("____________________");
        }
    }



}
