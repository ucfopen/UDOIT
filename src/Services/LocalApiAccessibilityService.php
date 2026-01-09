<?php

namespace App\Services;

use App\Entity\ContentItem;

use GuzzleHttp\Client;
use GuzzleHttp\Promise;
use GuzzleHttp\Exception\RequestException;
use Symfony\Component\Console\Output\ConsoleOutput;

/*
    Sends a POST request to a local accessibility-checker server (at port 3000)
    and returns the Equal Access JSON report.
*/

class LocalApiAccessibilityService {

    /** @var \App\Services\HtmlService */
    protected $htmlService;


    public function scanContentItem(ContentItem $contentItem) {
        // $html = HtmlService::clean($contentItem->getBody());
        $html = $contentItem->getBody();

        if (!$html) {
            return;
        }

        $data = $this->checkMany($html, [], []);

        return $data;
    }

    public function scanMultipleContentItemsAsync(array $contentItems, int $concurrency = 5, bool $stopOnFailure = false): array
    {
        // Initialize Guzzle client with base options
        $client = new Client([
            // TODO: the problem with this is that it does not matter if the scanner is the
            // local or Lambda version, the URL is always the same location causing the
            // local to be triggered.
            'base_uri' => 'http://host.docker.internal:3000',
            'timeout' => 30.0,
            'http_errors' => false, // Don't throw exceptions for 4xx/5xx responses
        ]);

        $output = new ConsoleOutput();
        $output->writeln("Starting async scan of " . count($contentItems) . " content items");

        // Initialize promises array
        $promises = [];
        $results = [];

        // Create a promise for each content item
        foreach ($contentItems as $contentItem) {
            $id = $contentItem->getId();
            //$html = HtmlService::clean($contentItem->getBody());
            $html = $contentItem->getBody();

            if (!$html) {
                $output->writeln("Skipping content item {$id}: Empty or invalid HTML");
                $results[$id] = null;
                continue;
            }

            // Create promise for this content item
            $promises[$id] = $client->postAsync('/scan', [
                'json' => [
                    'html' => $html,
                    'guidelineIds' => 'WCAG_2_1',
                    'reportLevels' => ['violation', 'potentialviolation', 'manual', 'recommendation']
                ],
                'headers' => [
                    'Content-Type' => 'application/json',
                ]
            ])->then(
                // Success callback
                function ($response) use ($id, $output, &$results) {
                    $statusCode = $response->getStatusCode();
                    $body = $response->getBody()->getContents();

                    if ($statusCode >= 200 && $statusCode < 300) {
                        try {
                            $result = json_decode($body, true);
                            if (json_last_error() !== JSON_ERROR_NONE) {
                                $output->writeln("JSON decode error for item {$id}: " . json_last_error_msg());
                                $results[$id] = null;
                            } else {
                                $output->writeln("Successfully scanned content item {$id}");
                                $results[$id] = $result;
                            }
                        } catch (\Exception $e) {
                            $output->writeln("Error processing response for item {$id}: " . $e->getMessage());
                            $results[$id] = null;
                        }
                    } else {
                        $output->writeln("HTTP error for item {$id}: {$statusCode}");
                        $results[$id] = null;
                    }
                },
                // Error callback
                function ($exception) use ($id, $output, &$results) {
                    $output->writeln("Request exception for item {$id}: " . $exception->getMessage());
                    $results[$id] = null;

                }
            );
        }

        // Execute promises with concurrency limit
        $pool = new Promise\EachPromise($promises, [
            // Execute N requests concurrently
            'concurrency' => $concurrency,
            // Invoked when a promise is fulfilled or rejected
            'fulfilled' => function ($value, $idx, $aggregate) use ($output) {
                $output->writeln("Completed request {$idx}");
            },
            'rejected' => function ($reason, $idx, $aggregate) use ($output, $stopOnFailure) {
                $output->writeln("Failed request {$idx}: " . $reason->getMessage());

                // Optionally reject the aggregate promise on any rejection
                if ($stopOnFailure) {
                    $aggregate->reject($reason);
                }
            },
        ]);

        try {
            // Wait for the pool to complete
            $pool->promise()->wait();
            $output->writeln("All content items scanned successfully");
        } catch (\Exception $e) {
            $output->writeln("Error during scanning process: " . $e->getMessage());
            // Handle any uncaught exceptions from the promise pool
        }

        return $results;
    }

    public function postData(string $url, string $html) {
        // Standardize headers and content type
        $jsonPayload = json_encode([
            "html" => $html,
            "guidelineIds" => "WCAG_2_1",
            'reportLevels' => ['violation', 'potentialviolation', 'manual', 'recommendation']
        ]);

        // Use cURL instead of file_get_contents for better error handling
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonPayload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Content-Length: ' . strlen($jsonPayload)
        ]);

        $result = curl_exec($ch);

        // Handle errors
        if (curl_errno($ch)) {
            $output = new ConsoleOutput();
            $output->writeln("cURL error: " . curl_error($ch));
        }

        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        // Log HTTP errors
        if ($httpCode >= 400) {
            $output = new ConsoleOutput();
            $output->writeln("HTTP error: " . $httpCode);
        }

        return $result;
    }

    public function checkMany($content, $ruleIds = [], $options = []) {

        // Send to accessibility checker
        $response = $this->postData("http://host.docker.internal:3000/scan", $content);  // $htmlOutput

        try {
            $json = json_decode($response, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                return null;
            }
            return $json;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function scanHtml($html, $rules = [], $options = []) {
        $html = HtmlService::clean($html);

        return $this->checkMany($html, [], []);
    }
}
