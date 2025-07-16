<?php

namespace App\Services;

use App\Entity\ContentItem;

use GuzzleHttp\Client;
use GuzzleHttp\Promise;
use GuzzleHttp\Exception\RequestException;
use DOMDocument;
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

            // Get DOM document for scanning
            // $document = $this->getDomDocument($html);
            // $htmlOutput = $document->saveHTML();

            // Create promise for this content item
            $promises[$id] = $client->postAsync('/scan', [
                'json' => [
                    'html' => $html,
                    'guidelineIds' => 'WCAG_2_1'
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

    public function postData(string $url, string $html)
    {
        $output = new ConsoleOutput();

        try {
            // Standardize headers and content type
            $jsonPayload = json_encode([
                "html" => $html,
                "guidelineIds" => "WCAG_2_1"
            ]);

            // Use cURL for the POST request
            $ch = curl_init($url);

            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => $jsonPayload,
                CURLOPT_HTTPHEADER     => [
                    'Content-Type: application/json',
                    'Content-Length: ' . strlen($jsonPayload)
                ],
                // Fail fast if the server takes too long
                CURLOPT_CONNECTTIMEOUT => 10,
                CURLOPT_TIMEOUT        => 60,
            ]);

            $result = curl_exec($ch);

            // Handle library-level errors
            if ($result === false) {
                $output->writeln("❌  cURL exec failure: " . curl_error($ch));
                curl_close($ch);
                return null;
            }

            // HTTP status handling
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode >= 400) {
                $output->writeln("❌  HTTP error {$httpCode} while calling {$url}");
            }

            return $result;
        } catch (\Throwable $e) {
            // Catch any unforeseen errors
            $output->writeln("❌  Exception in postData(): " . $e->getMessage());
            $output->writeln("Stack trace:\n" . $e->getTraceAsString());
            return null;
        }
    }

    public function checkMany($content, $ruleIds = [], $options = []) {
        // Get DOM document
        // $document = $this->getDomDocument($content);
        $output = new ConsoleOutput();
        // Send to accessibility checker
        $response = $this->postData("http://host.docker.internal:3000/scan", $content);  // $htmlOutput

        try {
            $json = json_decode($response, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                $output->writeln("JSON decode error: " . json_last_error_msg());
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

    public function getDomDocument($html) {
        // Create a clean DOM document
        $dom = new DOMDocument('1.0', 'utf-8');
        $dom->formatOutput = false; // Prevent extra whitespace

        // Suppress libxml errors but store them for debugging
        libxml_use_internal_errors(true);

        // Create a proper HTML5 document with a single wrapper
        $templateHtml = "<!DOCTYPE html>
        <html lang=\"en\">
        <head>
            <meta charset=\"UTF-8\">
            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
            <title>Placeholder Page Title</title>
        </head>
        <body>
            <main>
                <!-- CONTENT_PLACEHOLDER -->
            </main>
        </body>
        </html>";

        // Insert content properly
        $templateHtml = str_replace('<!-- CONTENT_PLACEHOLDER -->', $html, $templateHtml);

        // Load without flags that might strip attributes
        $dom->loadHTML($templateHtml);

        // Log any parsing errors for debugging
        $errors = libxml_get_errors();
        if (!empty($errors)) {
            $output = new ConsoleOutput();
            $output->writeln("DOM parsing errors: " . count($errors));
            foreach ($errors as $error) {
                $output->writeln("Line {$error->line}: {$error->message}");
            }
        }
        libxml_clear_errors();
        return $dom;
    }

}
