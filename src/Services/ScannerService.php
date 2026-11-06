<?php

namespace App\Services;

use App\Entity\ContentItem;
use App\Response\ApiResponse;
use App\Services\EqualAccessService;
use App\Services\HtmlService;
use App\Services\LocalApiAccessibilityService;
use App\Services\UtilityService;

// Main scanner class, expects a JSON report from whichever scanner is run

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

        $report = null;
        $response = new ApiResponse();
        $equalAccess = new EqualAccessService();
        $localService = new LocalApiAccessibilityService();
        $json = $localService->scanContentItem($contentItem);
        $report = $equalAccess->generateReport($json);

        return $report;
    }
}
