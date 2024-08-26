<?php

namespace App\Services;

use App\Entity\ContentItem;

use App\Services\PhpAllyService;
use App\Services\EqualAccessService;
use App\Services\AwsApiAccessibilityService;

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

    public function scanContentItem(ContentItem $contentItem) {
        // Check which scanner we're going to use from our environment variables
        $scanner = $_ENV['ACCESSIBILITY_CHECKER'];

        $this->logToServer($scanner);

        $report = null;

        if ($scanner == 'phpally') {
            $this->logToServer("phpally");
        }
        else if ($scanner == 'equalaccess_local') {
            $this->logToServer("equalaccess (local)");
            $equalAccess = new EqualAccessService();
            $report = $equalAccess->scanContentItem($contentItem);
            $this->logToServer(json_encode($report));
        }
        else if ($scanner == 'equalaccess_aws') {
            $this->logToServer("equalaccess (ec2)");
            $awsScanner = new AwsApiAccessibilityService();
            $report = $awsScanner->scanHtml($contentItem->getBody());
            $this->logToServer($report);
        }
        else {
            $this->logToServer("Unknown scanner!");
        }

        return $report;
    }
}
