<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: "signing_key")]
class SigningKey
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    private ?int $id = null;

    #[ORM\Column(type: "text")]
    private string $publicKey;

    #[ORM\Column(type: "text")]
    private string $privateKey;

    #[ORM\Column(type: "string", length: 200)]
    private string $algorithm;

    #[ORM\ManyToOne(targetEntity: SigningKeySet::class, inversedBy: "signingKeys")]
    #[ORM\JoinColumn(nullable: true, onDelete: "SET NULL")]
    private ?SigningKeySet $signingKeySet = null;

    public function __construct(
        string $publicKey,
        string $privateKey,
        string $algorithm,
        ?SigningKeySet $signingKeySet = null
    ) 
    {
        $this->publicKey = $publicKey;
        $this->privateKey = $privateKey;
        $this->algorithm = $algorithm;
        $this->signingKeySet = $signingKeySet;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getPublicKey(): string
    {
        return $this->publicKey;
    }

    public function setPublicKey(string $publicKey): static
    {
        $this->publicKey = $publicKey;

        return $this;
    }

    public function getPrivateKey(): string
    {
        return $this->privateKey;
    }

    public function setPrivateKey(string $privateKey): static
    {
        $this->privateKey = $privateKey;

        return $this;
    }

    public function getAlgorithm(): string
    {
        return $this->algorithm;
    }

    public function setAlgorithm(string $algorithm): static
    {
        $this->algorithm = $algorithm;

        return $this;
    }

    public function getSigningKeySet(): ?SigningKeySet
    {
        return $this->signingKeySet;
    }

    public function setSigningKeySet(?SigningKeySet $signingKeySet): static
    {
        $this->signingKeySet = $signingKeySet;

        return $this;
    }
}