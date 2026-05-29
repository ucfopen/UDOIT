<?php

/*
    Because UDOIT does not currently use LTI messaging,
    it does not sign any JWT, so this table is 
    not used. However, it is still implemented to maintain
    the standard practice for LTI applications and allow
    easy future key implementations if necessary.
*/


namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: "App\Repository\SigningKeySetRepository")]
#[ORM\Table(name: "signing_key_set")]
class SigningKeySet
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    private ?int $id = null;

    #[ORM\OneToMany(targetEntity: SigningKey::class, mappedBy: "signingKeySet", cascade: ["persist"])]
    private Collection $signingKeys;

    #[ORM\OneToMany(targetEntity: Registration::class, mappedBy: "signingKeySet")]
    private Collection $registrations;


    public function __construct()
    {
        $this->signingKeys = new ArrayCollection();
        $this->registrations = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getSigningKeys(): Collection
    {
        return $this->signingKeys;
    }

    public function addSigningKey(SigningKey $signingKey): static
    {
        if (!$this->signingKeys->contains($signingKey)) {
            $this->signingKeys->add($signingKey);
            $signingKey->setSigningKeySet($this);
        }

        return $this;
    }

    public function removeSigningKey(SigningKey $signingKey): static
    {
        if ($this->signingKeys->removeElement($signingKey)) {
            if ($signingKey->getSigningKeySet() === $this) {
                $signingKey->setSigningKeySet(null);
            }
        }

        return $this;
    }

    public function getRegistrations(): Collection
    {
        return $this->registrations;
    }

    public function addRegistration(Registration $registration): static
    {
        if (!$this->registrations->contains($registration)) {
            $this->registrations->add($registration);
            $registration->setSigningKeySet($this);
        }
        
        return $this;
    }

    public function removeRegistration(Registration $registration): static
    {
        $this->registrations->removeElement($registration);

        return $this;
    }
}