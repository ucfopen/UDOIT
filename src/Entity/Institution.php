<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use JsonSerializable;


#[ORM\Entity(repositoryClass: "App\Repository\InstitutionRepository")]
#[ORM\Table(name: 'institution')]

class Institution implements JsonSerializable
{
    // Private Members
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    private $id;


    #[ORM\Column(type: "string", length: 255)]
    private $title;

    #[ORM\Column(type: "string", length: 255, nullable: true)]
    private $lmsDomain;

    #[ORM\Column(type: "string", length: 64, nullable: true)]
    private $lmsId;

    #[ORM\Column(type: "string", length: 255, nullable: true)]
    private $lmsAccountId;

    #[ORM\Column(type: "datetime")]
    private $created;

    #[ORM\Column(type: "boolean")]
    private $status;

    #[ORM\Column(type: "string", length: 255, nullable: true)]
    private $vanityUrl;

    #[ORM\Column(type: "text", nullable: true)]
    private $metadata;

    #[ORM\OneToMany(targetEntity: "App\Entity\Course", mappedBy: "institution")]
    private $courses;

    #[ORM\OneToMany(targetEntity: "App\Entity\User", mappedBy: "institution")]
    private $users;

    private $encodedKey = 'niLb/WbAODNi7E4ccHHa/pPU3Bd9h6z1NXmjA981D4o=';

    #[ORM\OneToOne(targetEntity: Registration::class, mappedBy: 'institution')]
    private ?Registration $registration;


    // Constructor
    public function __construct()
    {
        $this->courses = new ArrayCollection();
        $this->users = new ArrayCollection();
    }


    // Getters and Setters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function getLmsDomain(): ?string
    {
        return $this->lmsDomain;
    }

    public function setLmsDomain(?string $lms_domain): self
    {
        $this->lmsDomain = $lms_domain;

        return $this;
    }

    public function getLmsId(): ?string
    {
        return $this->lmsId;
    }

    public function setLmsId(string $lms_id): self
    {
        $this->lmsId = $lms_id;

        return $this;
    }

    public function getLmsAccountId(): ?string
    {
        return $this->lmsAccountId;
    }

    public function setLmsAccountId(?string $lms_account_id): self
    {
        $this->lmsAccountId = $lms_account_id;

        return $this;
    }

    public function getCreated(): ?\DateTimeInterface
    {
        return $this->created;
    }

    public function setCreated(\DateTimeInterface $created): self
    {
        $this->created = $created;

        return $this;
    }

    public function getStatus(): ?bool
    {
        return $this->status;
    }

    public function setStatus(bool $status): self
    {
        $this->status = $status;

        return $this;
    }

    public function getVanityUrl(): ?string
    {
        return $this->vanityUrl;
    }

    public function setVanityUrl(?string $vanity_url): self
    {
        $this->vanityUrl = $vanity_url;

        return $this;
    }

    public function getMetadata(): ?array
    {
        if ($this->metadata !== null) {
            return json_decode($this->metadata, true);
        }

        return null;
    }

    public function setMetadata(array $metadata): self
    {
        $this->metadata = \json_encode($metadata);

        return $this;
    }

    public function getCourses(): Collection | array
    {
        return $this->courses;
    }

    public function addCourse(Course $course): self
    {
        if (!$this->courses->contains($course)) {
            $this->courses[] = $course;
            $course->setInstitution($this);
        }

        return $this;
    }

    public function removeCourse(Course $course): self
    {
        if ($this->courses->contains($course)) {
            $this->courses->removeElement($course);
            // set the owning side to null (unless already changed)
            if ($course->getInstitution() === $this) {
                $course->setInstitution(null);
            }
        }

        return $this;
    }

    public function getUsers(): Collection | array
    {
        return $this->users;
    }

    public function addUser(User $user): self
    {
        if (!$this->users->contains($user)) {
            $this->users[] = $user;
            $user->setInstitution($this);
        }

        return $this;
    }

    public function removeUser(User $user): self
    {
        if ($this->users->contains($user)) {
            $this->users->removeElement($user);
            // set the owning side to null (unless already changed)
            if ($user->getInstitution() === $this) {
                $user->setInstitution(null);
            }
        }

        return $this;
    }

    public function getRegistration(): ?Registration
    {
        return $this->registration;
    }

    public function setRegistration(Registration $registration): static
    {
        $this->registration = $registration;

        return $this;
    }

    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'lmsDomain' => $this->lmsDomain,
            'lmsId' => $this->lmsId,
            'created' => $this->getCreated(),
            'status' => $this->getStatus(),
            'vanityUrl' => $this->vanityUrl,
        ];
    }
}
