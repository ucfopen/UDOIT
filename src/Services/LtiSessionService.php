<?php

namespace App\Services;

use App\Entity\LtiSession;
use App\Entity\Registration;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

class LtiSessionService
{

    private const string nonceExpiryTime = '+5 minutes';

    public function __construct(
        private EntityManagerInterface $em,
        private LoggerInterface $logger,
    ) {}


    public function createLtiSession(Registration $registration): LtiSession
    {
        $state = \bin2hex(\random_bytes(32));
        $nonce = \bin2hex(\random_bytes(32));

        $expiresAt = new \DateTimeImmutable($this::nonceExpiryTime);

        $ltiSession = new LtiSession($state, $nonce, $registration, $expiresAt);
        $this->em->persist($ltiSession);
        $this->em->flush();

        return $ltiSession;
    }

    public function verifyAndDeleteNonce(LtiSession $ltiSession, string $nonce): bool
    {
        if ($ltiSession->getNonce() !== $nonce) return false;

        $now = new \DateTimeImmutable();

        if ($now >= $ltiSession->getExpiresAt()) return false;

        $ltiSession->removeNonce();
        $this->em->flush();
        return true;
    }

}