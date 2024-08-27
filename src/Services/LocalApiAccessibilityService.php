<?php

namespace App\Services;

use App\Entity\ContentItem;

use DOMDocument;
use DOMXPath;

/*
    Sends a POST request to a local accessibility-checker server (at port 3000)
    and returns the Equal Access JSON report. 
*/

class LocalApiAccessibilityService {

    /** @var App\Service\HtmlService */
    protected $htmlService;

    public function scanContentItem(ContentItem $contentItem) {
        $html = HtmlService::clean($contentItem->getBody());

        if (!$html) {
            return;
        }

        $data = $this->checkMany($html); 

        return $data;
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

    public function postData(string $url, string $html) {
        $options = [
            'http' => [
                'header' => "Content-type: text/html\r\n",
                'method' => 'POST',
                'content' => $html,
            ],
        ];

        $context = stream_context_create($options);
        $result = file_get_contents($url, false, $context);

        return $result;
    }

    public function checkMany($content) {
        $document = $this->getDomDocument($content);
        $response = $this->postData("http://host.docker.internal:3000/check", $document->saveHTML());
        $json = json_decode($response, true);
        $this->logToServer(json_encode($json, JSON_PRETTY_PRINT));
        $report = $this->generateReport($json, $document);
        return $report;
    }

    public function scanHtml($html, $rules = [], $options = []) {
        $html = HtmlService::clean($html);

        return $this->checkMany($html, [], []);
    }

    public function xpathToSnippet($domXPath, $xpathQuery): \DOMElement {
        // Query the document and save the results into an array
        // In a perfect world this array should only have one element
        $xpathResults = $domXPath->query($xpathQuery);
        $htmlSnippet = null;

        // TODO: For now, if there are multiple results we're just
        // going to choose the "last" one
        if (!is_null($xpathResults)) {
            foreach ($xpathResults as $xpathResult) {
                $htmlSnippet = $xpathResult;
            }
        }

        return $htmlSnippet;
    }

    public function getDomDocument($html)
    {
        $dom = new DOMDocument('1.0', 'utf-8');
        if (strpos($html, '<?xml encoding="utf-8"') !== false) {
            $dom->loadHTML("<html><body>{$html}</body></html>", LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        } else {
            $dom->loadHTML("<?xml encoding=\"utf-8\" ?><html><body>{$html}</body></html>", LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        }

        return $dom;

    }
}
