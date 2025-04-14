<?php

namespace App\Message;

class ScanContentItem
{
    private $contentItemData;

    public function __construct($contentItemData)
    {
        $this->contentItemData = $contentItemData;
    }

    public function getContentItemData()
    {
        return $this->contentItemData;
    }
}
