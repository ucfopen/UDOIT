<?php

namespace App\Message;

interface QueueItemInterface
{
    public function getCourseId();

    public function getTask();

    public function getData();
}