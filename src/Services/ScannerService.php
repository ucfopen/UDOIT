<?php

namespace App\Services;

use App\Entity\ContentItem;

use App\Services\PhpAllyService;
use App\Services\EqualAccessService;
use App\Services\AsyncEqualAccessReport;

use DOMDocument;

// Main scanner class, expects a phpAlly-styled JSON report from whichever scanner is run 

class ScannerService {

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

    public function scanContentItem(ContentItem $contentItem, $scannerReport = null) {
        // Optional argument scannerReport is used when handling async Equal Access
        // requests, so then all we have to do is just make those into a UDOIT report
        $scanner = $_ENV['ACCESSIBILITY_CHECKER'];
        $report = null;

        if ($scanner == 'phpally') {
            // TODO: implement flow for phpally scanning
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
                    $this->logToServer("No report passed in!");
                    $asyncReport = new AsyncEqualAccessReport();
                    $json = $asyncReport->postSingleAsync($contentItem);
                    $report = $equalAccess->generateReport($json, $document);
                }
                else {
                    // We already have the report, all we have to do is generate the UDOIT report
                    $report = $equalAccess->generateReport($scannerReport, $document);
                }
            }
        }
        else {
            // Unknown scanner set in environment, should return error...
            throw new \Exception("Unknown scanner type!");
        }

        return $report;
    }

    public function getDomDocument($html)
    {
        $dom = new DOMDocument('1.0', 'utf-8');
        libxml_use_internal_errors(true);
        if (strpos($html, '<?xml encoding="utf-8"') !== false) {
            $dom->loadHTML("<html><body>{$html}</body></html>", LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        } else {
            $dom->loadHTML("<?xml encoding=\"utf-8\" ?><html><body>{$html}</body></html>", LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        }

        return $dom;

    }
}
