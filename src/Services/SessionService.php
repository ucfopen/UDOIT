<?php

namespace App\Services;

use App\Entity\UserSession;
use App\Repository\UserSessionRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Uid\Uuid;

const FIVE_MINUTES = 300;

class SessionService
{
    protected UserSessionRepository $sessionRepo;
    protected Request $request;
    protected ?UserSession $userSession = null;
    protected ManagerRegistry $doctrine;

    public function __construct(
        UserSessionRepository $sessionRepo,
        RequestStack $requestStack,
        ManagerRegistry $doctrine,
    ) {
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

        $userSession = null;

        if ($uuid) {
            $userSession = $this->sessionRepo->findOneBy(['uuid' => $uuid]);
        }

        if ($userSession === null) {
            $this->userSession = $this->createSession();
        } else {
            $this->userSession = $userSession;
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

    public function createSession(): UserSession
    {
        $session = new UserSession();

        $session->setCreated(new \DateTime('now'));
        $uuid = Uuid::v4();
        $session->setUuid($uuid->toRfc4122());

        $this->doctrine->getManager()->persist($session);

        $this->userSession = $session;
        return $session;
    }

    public function saveTokenToSession($token, UserSession $session)
    {
        try {
            if (!empty($token->{'https://purl.imsglobal.org/spec/lti/claim/context'})) {
                $contextFields = (array) $token->{'https://purl.imsglobal.org/spec/lti/claim/context'};
                foreach ($contextFields as $key => $val) {
                    $session->set($key, $val);
                }
            }

            if (!empty($token->{'https://purl.imsglobal.org/spec/lti/claim/custom'})) {
                $customFields = (array) $token->{'https://purl.imsglobal.org/spec/lti/claim/custom'};
                foreach ($customFields as $key => $val) {
                    $session->set($key, $val);
                }
            }

            $roles = [];
            if (!empty($token->{'https://purl.imsglobal.org/spec/lti/claim/roles'})) {
                $roleFields = (array) $token->{'https://purl.imsglobal.org/spec/lti/claim/roles'};
                foreach ($roleFields as $role) {
                    $roleArr = explode('#', $role);
                    $roles[] = trim($roleArr[1]);
                }
            }

            $session->set('roles', array_values(array_unique($roles)));

            if (isset($token->name)) {
                $session->set('lms_user_name', $token->name);
            }

        } catch (\Exception $e) {
            print_r($e->getMessage());
        }
    }
}
