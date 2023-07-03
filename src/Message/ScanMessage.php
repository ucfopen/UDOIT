<?php

namespace App\Message;

class ScanMessage
{
    private array $contentItems;
    private $course;
    private $user;

    public function __construct($course, $user) 
    {
        $this->course = $course;
        $this->user = $user;
    }

    public function getContent(): array
    {
        return $this->contentItems;
    }

    public function getCourse() 
    {
        return $this->course;
    }

    public function getUser() 
    {
        return $this->user;
    }
}
