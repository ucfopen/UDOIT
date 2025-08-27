<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use JsonSerializable;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @ORM\Entity(repositoryClass="App\Repository\UserRepository")
 * @ORM\Table(name="users")
 */
class User implements UserInterface, JsonSerializable
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * $username = <lms_domain>||<lms_user_id>
     * @ORM\Column(type="string", length=180, unique=true)
     */
    private string $username;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $name;

    /**
     * @ORM\Column(type="json", nullable=true)
     */
    private $roles = [];

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Institution", inversedBy="users")
     * @ORM\JoinColumn(nullable=false)
     */
    private $institution;

    /**
     * @ORM\Column(type="string", length=128)
     */
    private $lmsUserId;

    /**
     * @ORM\Column(type="string", length=2048, nullable=true)
     */
    private $apiKey;

    /**
     * @ORM\Column(type="string", length=512, nullable=true)
     */
    private $refreshToken;

    /**
     * @ORM\Column(type="datetime")
     */
    private $created;

    /**
     * @ORM\Column(type="datetime")
     */
    private $lastLogin;

    private $encodedKey;

    /**
     * @ORM\OneToMany(targetEntity=Report::class, mappedBy="author")
     */
    private $reports;


    public function __construct()
    {
        $this->reports = new ArrayCollection();
        $this->encodedKey = $_ENV["DATABASE_ENCODE_KEY"];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUsername(): string
    {
        return $this->username;
    }

    public function getUserIdentifier(): string
    {
        return $this->username;
    }

    public function setUserIdentifier(string $identifier): self
    {
        $this->username = $identifier;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function getPassword()
    {
        return null;
    }

    /**
     * @see UserInterface
     */
    public function getSalt()
    {
        // not needed for apps that do not check user passwords
        return null;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials()
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function getInstitution(): ?Institution
    {
        return $this->institution;
    }

    public function setInstitution(?Institution $institution): self
    {
        $this->institution = $institution;

        return $this;
    }

    public function getLmsUserId(): ?string
    {
        return $this->lmsUserId;
    }

    public function setLmsUserId(string $lmsUserId): self
    {
        $this->lmsUserId = $lmsUserId;

        return $this;
    }

    public function getApiKey(): ?string
    {
        if (empty($this->apiKey)) {
            return false;
        }

        return $this->decryptData($this->apiKey);
    }

    public function setApiKey(?string $apiKey): self
    {
        $this->apiKey = !empty($apiKey) ? $this->encryptData($apiKey) : '';

        return $this;
    }

    public function getRefreshToken(): ?string
    {
        return $this->refreshToken;
    }

    public function setRefreshToken(?string $refreshToken): self
    {
        $this->refreshToken = $refreshToken;

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

    public function getLastLogin(): ?\DateTimeInterface
    {
        return $this->lastLogin;
    }

    public function setLastLogin(\DateTimeInterface $lastLogin): self
    {
        $this->lastLogin = $lastLogin;

        return $this;
    }

    public function __serialize(): array
    {
        return [
            $this->id,
            $this->username,
            $this->lmsUserId
        ];
    }

    public function __unserialize(array $data): void
    {
        [$this->id, $this->username, $this->lmsUserId] = $data;
    }

    public function jsonSerialize(): array
    {
        $dateFormat = $_ENV['DATE_FORMAT'];
        $apiKey = $this->getApiKey();

        return [
            'id' => $this->getId(),
            'username' => $this->getUsername(),
            'name' => $this->getName(),
            'lmsUserId' => $this->getLmsUserId(),
            'roles' => $this->getRoles(),
            'lastLogin' => $this->getLastLogin()->format($dateFormat),
            'created' => $this->getCreated()->format($dateFormat),
            'hasApiKey' => !empty($apiKey),
            //'institution' => $this->getInstitution(),
        ];
    }

    private function encryptData($data): string
    {
        $key   = base64_decode($this->encodedKey);
        $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
        $encrypted_data = sodium_crypto_secretbox($data, $nonce, $key);

        return base64_encode($nonce . $encrypted_data);
    }

    private function decryptData($encrypted): bool | string
    {
        $key     = base64_decode($this->encodedKey);
        $decoded = base64_decode($encrypted);
        $nonce   = mb_substr($decoded, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES, '8bit');
        $encrypted_text = mb_substr($decoded, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES, NULL, '8bit');

        return sodium_crypto_secretbox_open($encrypted_text, $nonce, $key);
    }

    public function getReports(): Collection | array
    {
        return $this->reports;
    }

    public function addReport(Report $report): self
    {
        if (!$this->reports->contains($report)) {
            $this->reports[] = $report;
            $report->setAuthor($this);
        }

        return $this;
    }

    public function removeReport(Report $report): self
    {
        if ($this->reports->contains($report)) {
            $this->reports->removeElement($report);
            // set the owning side to null (unless already changed)
            if ($report->getAuthor() === $this) {
                $report->setAuthor(null);
            }
        }

        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): self
    {
        $this->name = $name;

        return $this;
    }
}
