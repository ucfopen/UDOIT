<?php

namespace App\Services;

use App\Entity\ContentItem;

use App\Services\PhpAllyService;
use App\Services\EqualAccessService;

use App\Services\HtmlService;
use App\Services\UtilityService;

use App\Response\ApiResponse;
use App\Services\LocalApiAccessibilityService;

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

        if ($contentItem->getBody() == null) {
            // No body to scan, return null
            return null;
        }

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
            else if ($scanner == 'equalaccess' || $scanner == 'equalaccess_local') {
                $equalAccess = new EqualAccessService();
                $localService = new LocalApiAccessibilityService();
                $json = $localService->scanContentItem($contentItem);
                $report = $equalAccess->generateReport($json);
            }
            else {
                // Unknown scanner set in environment, should return error...
                throw new \Exception("Unknown scanner type!");
            }
        }
        catch (\Throwable $e) {
            $response->addMessage($e->getMessage(), 'error');
        }

        return $report;
    }
}
