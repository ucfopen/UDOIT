<?php
// File: src/Services/test.php

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/AwsApiAccessibilityService.php';
require_once __DIR__ . '/HtmlService.php';

use App\Services\AwsApiAccessibilityService;
use App\Services\HtmlService;

// Mock ContentItem class for testing purposes
class ContentItem {
    private $body;

    public function __construct($body) {
        $this->body = $body;
    }

    public function getBody() {
        return $this->body;
    }
}

// Initialize services
$htmlService = new HtmlService();
$accessibilityService = new AwsApiAccessibilityService($htmlService);

// Test HTML content
$testHtml = '
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Test Page</title>
</head>
<body>
    <h1>Welcome to the Test Page</h1>
    <img src="example.jpg" alt=""> <!-- Missing alt text for accessibility issue -->
    <p>This is a paragraph with some text.</p>
    <a href="#">Click here</a> <!-- Non-descriptive link text for accessibility issue -->
</body>
</html>
';

// Test scanHtml method
echo "Testing scanHtml method:\n";
$htmlResult = $accessibilityService->scanHtml($testHtml);
print_r($htmlResult);

// Test scanContentItem method
// echo "\nTesting scanContentItem method:\n";
// $contentItem = new ContentItem($testHtml);
// $contentItemResult = $accessibilityService->scanContentItem($contentItem);
// print_r($contentItemResult);
