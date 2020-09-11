<?php

namespace App\Message;

interface QueueItemInterface
{
    public function getCourseId();

    public function getUserId();

    public function getTask();

    public function getData();
}