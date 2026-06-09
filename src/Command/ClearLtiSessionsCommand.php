<?php

namespace App\Command;

use App\Repository\LtiSessionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;

#[AsCommand(
  name: 'app:clear-lti-sessions',
  description: 'Clear expired LTI sessions'
)]
class ClearLtiSessionsCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em,
        private LtiSessionRepository $ltiSessionRepository,
    )
    {
        parent::__construct();
    }

    public function __invoke()
    {
        $this->ltiSessionRepository->deleteExpired();
    }
}