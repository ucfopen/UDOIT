<?php

namespace App\Entity;

use App\Repository\LtiSessionRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\DBAL\Types\Types;

#[ORM\Entity(repositoryClass: LtiSessionRepository::class)]
#[ORM\Table(name: 'lti_session')]
class LtiSession
{

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]

    private int $id;

    #[ORM\Column(type: 'string', length: 255)]
    private string $state;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $nonce;

    #[ORM\ManyToOne(targetEntity: Registration::class)]
    private Registration $registration;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $expiresAt;

    public function __construct(
        string $state,
        string $nonce,
        Registration $registration,
        \DateTimeImmutable $expiresAt,
    ) {
        $this->state = $state;
        $this->nonce = $nonce;
        $this->registration = $registration;
        $this->expiresAt = $expiresAt;
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getState(): string
    {
        return $this->state;
    }

    public function getNonce(): string
    {
        return $this->nonce;
    }

    public function removeNonce(): static
    {
        $this->nonce = null;

        return $this;
    }

    public function getRegistration(): Registration
    {
        return $this->registration;
    }

    public function getExpiresAt(): \DateTimeImmutable
    {
        return $this->expiresAt;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

}
