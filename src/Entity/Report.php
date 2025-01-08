<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\ReportRepository")
 */
class Report implements \JsonSerializable
{
    // Private Members
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    private $id;

    #[ORM\ManyToOne(targetEntity: "App\Entity\Course", inversedBy: "reports")]
    #[ORM\JoinColumn(nullable: false)]
    private $course;

    #[ORM\Column(type: "text", nullable: true)]
    private $data;

    #[ORM\Column(type: "datetime")]
    private $created;

    #[ORM\Column(type: "integer", nullable: true)]
    private $errors;

    #[ORM\Column(type: "integer", nullable: true)]
    private $suggestions;

    #[ORM\Column(type: "boolean")]
    private $ready;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: "reports")]
    #[ORM\JoinColumn(nullable: false)]
    private $author;

    #[ORM\Column(type: "integer", nullable: true)]

    private $contentFixed;

    #[ORM\Column(type: "integer", nullable: true)]
    private $contentResolved;


    #[ORM\Column(type: "integer", nullable: true)]

    private $filesReviewed;

    // Constructor
    public function __construct()
    {
        $this->queue_items = new ArrayCollection();
        $this->queueItems = new ArrayCollection();
        $this->issues = new ArrayCollection();
    }


    // Public Methods
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }

    public function toArray(): array
    {
        $result = [
            "id" => $this->id,
            "ready" => $this->ready,
            "created" => $this->created->format($_ENV['DATE_FORMAT']),
            "errors" => $this->getErrors(),
            "suggestions" => $this->getSuggestions(),
            "contentFixed" => $this->getContentFixed(),
            'contentResolved' => $this->getContentResolved(),
            'filesReviewed' => $this->getFilesReviewed(),
        ];

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

    public function getErrors(): int
    {
        return ($this->errors) ?: 0;
    }

    public function setErrors(int $errors): self
    {
        $this->errors = $errors;

        return $this;
    }

    public function getSuggestions(): int
    {
        return ($this->suggestions) ?: 0;
    }

    public function setSuggestions(int $suggestions): self
    {
        $this->suggestions = $suggestions;

        return $this;
    }

    public function addToErrorCount()
    {
        $this->errors++;

        return $this;
    }

    public function addToSuggestionCount()
    {
        $this->suggestions++;

        return $this;
    }

    public function getIssueCount()
    {
        return ($this->getSuggestions() + $this->getErrors() + $this->getContentFixed() + $this->getContentResolved());
    }


    // Undocumented function
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

    public function isReady(): ?bool
    {
        return $this->ready;
    }

    public function setReady(bool $ready): self
    {
        $this->ready = $ready;

        return $this;
    }

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(?User $author): self
    {
        $this->author = $author;

        return $this;
    }

    public function getContentFixed(): ?int
    {
        return ($this->contentFixed) ?: 0;
    }

    public function setContentFixed(?int $contentFixed): self
    {
        $this->contentFixed = $contentFixed;

        return $this;
    }

    public function getContentResolved(): ?int
    {
        return ($this->contentResolved) ?: 0;
    }

    public function setContentResolved(?int $contentResolved): self
    {
        $this->contentResolved = $contentResolved;

        return $this;
    }

    public function getFilesReviewed(): ?int
    {
        return ($this->filesReviewed) ?: 0;
    }

    public function setFilesReviewed(?int $filesReviewed): self
    {
        $this->filesReviewed = $filesReviewed;

        return $this;
    }
}
