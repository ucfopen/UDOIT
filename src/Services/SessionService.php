<?php

namespace App\Services;

use App\Entity\UserSession;
use App\Repository\UserSessionRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Uid\Uuid;

const FIVE_MINUTES = 300;

class SessionService {
    protected UserSessionRepository $sessionRepo;
    protected Request $request;
    protected UserSession $userSession;
    protected ManagerRegistry $doctrine;

    public function __construct(
        UserSessionRepository $sessionRepo,
        RequestStack $requestStack,
        ManagerRegistry $doctrine,
    )
    {
        $this->sessionRepo = $sessionRepo;
        $this->request = $requestStack->getCurrentRequest();
        $this->doctrine = $doctrine;
    }

    public function getSession(?string $uuid = null): UserSession
    {
        if (empty($uuid) && !empty($this->userSession)) {
            return $this->userSession;
        }

        // Check request header
        if (!$uuid) {
            $uuid = $this->request->headers->get('X-AUTH-TOKEN');
        }

        // Check request GET params
        if (!$uuid) {
            $uuid = $this->request->query->get('auth_token');
        }

        // Check PHP session for a UUID
        if (!$uuid) {
            $uuid = $this->request->cookies->get('AUTH_TOKEN');
        }

        // Check state for UUID from Oauth
        if (!$uuid) {
            $uuid = $this->request->query->get('state');
        }

        if ($uuid) {
            $this->userSession = $this->sessionRepo->findOneBy(['uuid' => $uuid]);
        }

        if (empty($this->userSession)) {
            $this->userSession = $this->createSession();
        }

        return $this->userSession;
    }

    public function hasSession(?string $uuid = null): bool
    {
        if (empty($uuid) && !empty($this->userSession)) {
            return true;
        }

        // Check request header
        if (!$uuid) {
            $uuid = $this->request->headers->get('X-AUTH-TOKEN');
        }

        // Check request GET params
        if (!$uuid) {
            $uuid = $this->request->query->get('auth_token');
        }

        // Check PHP session for a UUID
        if (!$uuid) {
            $uuid = $this->request->cookies->get('AUTH_TOKEN');
        }

        if ($uuid) {
            $userSession = $this->sessionRepo->findOneBy(['uuid' => $uuid]);

            if ($userSession) {
                $this->userSession = $userSession;
            }
        }

        return !empty($this->userSession);
    }

    public function removeExpiredSessions(): void
    {
        $userId = $this->userSession->get('userId');

        $userSessions = $this->sessionRepo->findByUser($userId);

        foreach ($userSessions as $userSess) {
            if ($userSess != $this->userSession) {
                $this->doctrine->getManager()->remove($userSess);
            }
        }

        $this->doctrine->getManager()->flush();
    }

    protected function createSession(): UserSession
    {
        $session = new UserSession();

        $session->setCreated(new \DateTime('now'));
        $uuid = Uuid::v4();
        $session->setUuid($uuid->toRfc4122());

        $this->doctrine->getManager()->persist($session);

        return $session;
    }

    public function generateNonce(): string {
        $session = $this->getSession();
        $nonce = bin2hex(random_bytes(8));
        $session->set('nonce', [$nonce, time()]);
        $this->doctrine->getManager()->flush();
        return $nonce;
    }

    public function verifyNonce(string $nonceToVerify): bool {
        $session = $this->getSession();
        $nonceData = $session->get('nonce', false);
        if ($nonceData) {
            [$storedNonce, $timestamp] = $nonceData;
            unset($session->getData()['nonce']);
            $this->doctrine->getManager()->flush();
            return time() - $timestamp < FIVE_MINUTES && $storedNonce === $nonceToVerify;
        }
        return false;
    }
}
