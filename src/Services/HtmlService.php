<?php

namespace App\Services;

use DOMDocument;

class HtmlService {
    protected $dom;
    protected $util;

    public function __construct(UtilityService $util)
    {
        $this->util = $util;  
        $this->dom = new DOMDocument('1.0', 'utf-8');
    }

    public function isValid($html) 
    {
        try {
            if (strpos($html, '<?xml encoding="utf-8"') !== false) {
                return $this->dom->loadHTML($html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
            } else {
                return $this->dom->loadHTML('<?xml encoding="utf-8" ?>' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
            }
        }
        catch (\Exception $e) {
            return false;
        }
    }

    public function tidy($html)
    {
        return htmLawed($html, [
            'tidy' => -1,
        ]);
    }

    public function domClean($html) 
    {
        if (!$this->isValid($html)) {
            return;
        }

        $out = [];

        if ($this->dom->hasChildNodes()) {
            foreach ($this->dom->childNodes as $node) {
                $out[] = $this->dom->saveHTML($node);
            }
        }

        return implode('', $out);
    }

    public function compare()
    {

    }
}