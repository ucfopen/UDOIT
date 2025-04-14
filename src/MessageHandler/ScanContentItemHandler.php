<?php

namespace App\MessageHandler;

use App\Message\ScanContentItem;
use Symfony\Component\Messenger\Handler\MessageHandlerInterface;
use Symfony\Component\Console\Output\ConsoleOutput;

class ScanContentItemHandler implements MessageHandlerInterface
{
    public function __invoke(ScanContentItem $message)
    {
        $printOutput = new ConsoleOutput();

        // Get data from the message
        $contentItemData = $message->getContentItemData();

        // Process the content item data (e.g., perform scanning)
        $printOutput->write("Processing content item: " . json_encode($contentItemData) . "\n");

        // Add more logic as needed for processing
    }
}
