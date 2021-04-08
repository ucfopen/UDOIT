<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use JsonSerializable;

/**
 * @ORM\Entity(repositoryClass="App\Repository\InstitutionRepository")
 */
class Institution implements JsonSerializable
{
    // Private Members
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $title;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $lmsDomain;

    /**
     * @ORM\Column(type="string", length=64, nullable=true)
     */
    private $lmsId;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $lmsAccountId;

    /**
     * @ORM\Column(type="datetime")
     */
    private $created;

    /**
     * @ORM\Column(type="boolean")
     */
    private $status;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $vanityUrl;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $metadata;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Course", mappedBy="institution")
     */
    private $courses;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\User", mappedBy="institution")
     */
    private $users;

    private $encodedKey = 'niLb/WbAODNi7E4ccHHa/pPU3Bd9h6z1NXmjA981D4o=';

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    private $apiClientId;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $apiClientSecret;


    // Constructor
    public function __construct()
    {
        $this->courses = new ArrayCollection();
        $this->users = new ArrayCollection();
    }


    // Public Methods
    public function encryptDeveloperKey(): self
    {
        $this->setApiClientSecret($this->apiClientSecret);

        return $this;
    }


    // Private Methods
    /**
     * @param $data
     *
     * @return string
     */
    private function encryptData($data)
    {
        $key   = base64_decode($this->encodedKey);
        $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
        $encrypted_data = sodium_crypto_secretbox($data, $nonce, $key);

        return base64_encode($nonce . $encrypted_data);
    }

    /**
     * @param $encrypted
     *
     * @return bool|string
     */
    private function decryptData($encrypted)
    {
        $key     = base64_decode($this->encodedKey);
        $decoded = base64_decode($encrypted);
        $nonce   = mb_substr($decoded, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES, '8bit');
        $encrypted_text = mb_substr($decoded, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES, NULL, '8bit');
     
        return sodium_crypto_secretbox_open($encrypted_text, $nonce, $key);
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
        return \json_decode($this->metadata, true);
    }

    public function setMetadata(array $metadata): self
    {
        $this->metadata = \json_encode($metadata);

        return $this;
    }

    /**
     * @return Collection|Course[]
     */
    public function getCourses(): Collection
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

    /**
     * @return Collection|User[]
     */
    public function getUsers(): Collection
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

    public function getApiClientId(): ?string
    {
        return $this->apiClientId;
    }

    public function setApiClientId(?int $apiClientId): self
    {
        $this->apiClientId = $apiClientId;

        return $this;
    }

    public function getApiClientSecret(): ?string
    {
        return $this->decryptData($this->apiClientSecret);
    }

    public function setApiClientSecret(?string $apiClientSecret): self
    {
        $this->apiClientSecret = $this->encryptData($apiClientSecret);

        return $this;
    }

    public function jsonSerialize()
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

    public function getAccountData($accountId) 
    {
        $metadata = $this->getMetadata();
        
        return isset($metadata['accounts'][$accountId]) 
            ? $metadata['accounts'][$accountId] : false;
    }

    public function setAccountData($accountId, $accountData)
    {
        $metadata = $this->getMetadata();
        $accounts = isset($metadata['accounts']) ? $metadata['accounts'] : [];

        $accounts[$accountId] = $accountData;
        $metadata['accounts'] = $accounts;
        
        $this->setMetadata($metadata);
    }
}
