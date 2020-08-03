<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\ReportRepository")
 */
class Report implements \JsonSerializable
{
    // Private Members
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;
    
    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Course", inversedBy="reports")
     * @ORM\JoinColumn(nullable=false)
     */
    private $course;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $data;

    /**
     * @ORM\Column(type="datetime")
     */
    private $created;

    /**
     * @ORM\Column(type="integer", nullable=true)
     */
    private $errors;

    /**
     * @ORM\Column(type="integer", nullable=true)
     */
    private $suggestions;

    /**
     * @ORM\ManyToMany(targetEntity="App\Entity\Issue", mappedBy="reports")
     */
    private $issues;


    private $serializeIssues = false;

    /**
     * @ORM\Column(type="boolean")
     */
    private $ready;

    // Constructor
    public function __construct()
    {
        $this->queue_items = new ArrayCollection();
        $this->queueItems = new ArrayCollection();
        $this->issues = new ArrayCollection();
    }


    // Public Methods
    /**
     *
     * @return array|mixed
     */
    public function jsonSerialize()
    {
        $result = [
            "id" => $this->id,
            "ready" => $this->ready
        ];
        if($this->ready) {
            $result["created"] = $this->created;
            $result["errors"] = $this->errors;
            $result["suggestions"] = $this->suggestions;

            if($this->serializeIssues) {
                $result["issues"] = $this->issues->toArray();
            }
        }
        return $result;
    }


    // Getters and Setters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getData(): ?string
    {
        return $this->data;
    }

    public function setData(?string $data): self
    {
        $this->data = $data;

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

    public function getErrors(): ?int
    {
        return $this->errors;
    }

    public function setErrors(?int $errors): self
    {
        $this->errors = $errors;

        return $this;
    }

    public function getSuggestions(): ?int
    {
        return $this->suggestions;
    }

    public function setSuggestions(?int $suggestions): self
    {
        $this->suggestions = $suggestions;

        return $this;
    }

    /**
     * @return Collection|Issue[]
     */
    public function getIssues(): Collection
    {
        return $this->issues;
    }

    public function addIssue(Issue $issue): self
    {
        if (!$this->issues->contains($issue)) {
            $this->issues[] = $issue;
            $issue->addReport($this);
        }

        return $this;
    }

    public function removeIssue(Issue $issue): self
    {
        if ($this->issues->contains($issue)) {
            $this->issues->removeElement($issue);
            $issue->removeReport($this);
        }

        return $this;
    }

    /**
     * Undocumented function
     *
     * @return Course|null
     */
    public function getCourse(): ?Course
    {
        return $this->course;
    }

    public function setCourse(?Course $course): self
    {
        $this->course = $course;
        $course->addReport($this);

        return $this;
    }


    /**
     * @return bool
     */
    public function isSerializeIssues(): bool
    {
        return $this->serializeIssues;
    }

    /**
     * @param bool $serializeIssues
     */
    public function setSerializeIssues(bool $serializeIssues): void
    {
        $this->serializeIssues = $serializeIssues;
    }

    public function getReady(): ?bool
    {
        return $this->ready;
    }

    public function setReady(bool $ready): self
    {
        $this->ready = $ready;

        return $this;
    }
}
