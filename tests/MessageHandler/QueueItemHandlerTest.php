<?php


namespace App\Tests\MessageHandler;


use App\Entity\ContentItem;
use App\MessageHandler\QueueItemHandler;
use PHPUnit\Framework\TestCase;


class QueueItemHandlerTest extends TestCase
{
    public function testFilterOldContentItemsPass() {
        $contentItemsCount = 11;
        $contentItems = $this->createContentItems($contentItemsCount);
        $courseLastUpdated = new \DateTime();
        $courseLastUpdated->modify('-' . intdiv($contentItemsCount, 2)  . ' days');
        $filteredContentItems = QueueItemHandler::filterOldContentItems($contentItems, $courseLastUpdated);
        $this->assertEquals(intdiv($contentItemsCount, 2), sizeof($filteredContentItems));
    }

    private function createContentItems(int $count) : array {
        $contentItems = [];
        for($i = 0; $i < $count; $i++) {
            $contentItem = new ContentItem();
            $updatedDate = new \DateTime();
            $updatedDate->modify('-' . $i . ' day');
            $updatedDate->modify('-1 minutes');
            $contentItem->setUpdated($updatedDate);
            array_push($contentItems, $contentItem);
        }
        return $contentItems;
    }


}