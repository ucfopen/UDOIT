<?php

namespace App\Services;

use Doctrine\ORM\EntityManagerInterface;

class LmsContentService
{
    /** @var EntityManagerInterface $entityManager */
    protected $entityManager;

    public function __construct(
        EntityManagerInterface $entityManager
    ) {
        $this->entityManager = $entityManager;
    }

    
}