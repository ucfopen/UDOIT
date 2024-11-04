<?php

namespace App\Services;

use App\Entity\ContentItem;

use DOMDocument;

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

        $data = $this->checkMany($html, [], []); 

        return $data;
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

    public function checkMany($content, $ruleIds = [], $options = []) {
        $document = $this->getDomDocument($content);
        $response = $this->postData("http://host.docker.internal:3000/check", $document->saveHTML());
        $json = json_decode($response, true);
        return $json;
    }

    public function scanHtml($html, $rules = [], $options = []) {
        $html = HtmlService::clean($html);

        return $this->checkMany($html, [], []);
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
