<?php

namespace App\MessageHandler;

use App\Message\ScanContentItem;
use Symfony\Component\Messenger\Handler\MessageHandlerInterface;
use Symfony\Component\Console\Output\ConsoleOutput;
use App\Services\LmsFetchService;
use Doctrine\ORM\EntityManagerInterface;

class ScanContentItemHandler implements MessageHandlerInterface
{
    private $lmsFetchService;
    private $em;

    public function __construct(LmsFetchService $lmsFetchService, EntityManagerInterface $em)
    {
        $this->lmsFetchService = $lmsFetchService;
        $this->em = $em;
    }

    public function __invoke(ScanContentItem $message)
    {
        $printOutput = new ConsoleOutput();

        // Get content item ID from the message
        $contentItemId = $message->getContentItemData();

        // Fetch the ContentItem entity from the database
        $contentItem = $this->em->getRepository(\App\Entity\ContentItem::class)->find($contentItemId);

        if (!$contentItem) {
            $printOutput->writeln("ContentItem with ID $contentItemId not found.");
            return;
        }

        $printOutput->writeln("Processing content item ID: $contentItemId");

        // Call the LMSfetchservice method
        $this->lmsFetchService->scanContentItems([$contentItem]);

        $printOutput->writeln("Finished processing content item ID: $contentItemId");


    }
}
