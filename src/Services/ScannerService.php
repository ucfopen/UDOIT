<?php

namespace App\Services;

use App\Entity\ContentItem;

use App\Services\PhpAllyService;
use App\Services\EqualAccessService;
use App\Services\AsyncEqualAccessReport;

use App\Services\HtmlService;
use App\Services\UtilityService;

use App\Response\ApiResponse;

use DOMDocument;

// Main scanner class, expects a phpAlly-styled JSON report from whichever scanner is run 

class ScannerService {

    /** @var UtilityService $util */
    protected $util;

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

    public function scanContentItem(ContentItem $contentItem, $scannerReport = null, $util = null) {
        // Optional argument scannerReport is used when handling async Equal Access
        // requests, so then all we have to do is just make those into a UDOIT report
        $scanner = $_ENV['ACCESSIBILITY_CHECKER'];
        $report = null;
        $response = new ApiResponse();

        try {
            if ($scanner == 'phpally') {
                // TODO: implement flow for phpally scanning
                $htmlService = new HtmlService();
                $phpAlly = new PhpAllyService($htmlService, $util);
                $report = $phpAlly->scanContentItem($contentItem);
            }
            else if ($scanner == 'equalaccess_local') {
                // TODO: create a LocalAccessibilityService
            }
            else if ($scanner == 'equalaccess_lambda') {
                if ($contentItem->getBody() != null) {
                    $equalAccess = new EqualAccessService();
                    $document = $equalAccess->getDomDocument($contentItem->getBody());
                    if (!$scannerReport) {
                        // Report is null, we need to call the lambda function for a single page most likely
                        // $this->logToServer("null $scannerReport!");
                        $asyncReport = new AsyncEqualAccessReport();
                        $json = $asyncReport->postSingleAsync($contentItem);
                        $report = $equalAccess->generateReport($json, $document);
                    }
                    else {
                        // $this->logToServer("Generating report with existing JSON...");
                        // We already have the report, all we have to do is generate the UDOIT report
                        $report = $equalAccess->generateReport($scannerReport, $document);
                        // $this->logToServer("Report:");
                        // $this->logToServer($report);
                    }
                }
            }
            else {
                // Unknown scanner set in environment, should return error...
                throw new \Exception("Unknown scanner type!");
            }
        }
        catch (\Throwable $e) {
            $response->addMessage($e->getMessage(), 'error', 0);
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
            $dom->loadHTML("<html><body style=\"background-color:{$envBackgroundColor};color:{$envTextColor}\">{$html}</body></html>", LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        } else {
            $dom->loadHTML("<?xml encoding=\"utf-8\" ?><html><body style=\"background-color:{$envBackgroundColor};color:{$envTextColor}\">{$html}</body></html>", LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        }

        return $dom;

    }
}
