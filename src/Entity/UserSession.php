<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use JsonSerializable;
use Symfony\Component\Uid\Uuid;

/**
 * @ORM\Entity(repositoryClass=UserSessionRepository::class)
 */
class UserSession implements JsonSerializable
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $uuid;

    /**
     * @ORM\Column(type="json", nullable=true)
     */
    private $data = [];

    /**
     * @ORM\Column(type="datetime")
     */
    private $created;

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getUuid(): ?string
    {
        return $this->uuid;
    }

    public function setUuid(string $uuid): self
    {
        $this->uuid = $uuid;

        return $this;
    }

    public function getData(): ?array
    {
        return $this->data;
    }

    public function setData(?array $data): self
    {
        $this->data = $data;

        return $this;
    }

    public function get($key, $defaultVal = '')
    {
        return !empty($this->data[$key]) ? $this->data[$key] : $defaultVal;
    }

    public function set($key, $val): self
    {
        $this->data[$key] = $val;

        return $this;
    }

    public function has($key) 
    {
        return isset($this->data[$key]);
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

    public function jsonSerialize()
    {
        return [
            'id' => $this->getUuid(),
            'data' => $this->getData(),
            'created' => $this->getCreated(),
        ];
    }
}
