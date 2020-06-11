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

    /**
     * @ORM\ManyToMany(targetEntity="App\Entity\ContentItem", inversedBy="reports")
     */
    private $contentItems;


    // Constructor
    public function __construct()
    {
        $this->queue_items = new ArrayCollection();
        $this->queueItems = new ArrayCollection();
        $this->issues = new ArrayCollection();
        $this->contentItems = new ArrayCollection();
    }


    // Public Methods
    /**
     * Serializes Report Class into list of ContentItem with issues, grouped by content type.
     * @return array|mixed
     */
    public function jsonSerialize()
    {
        return [
            "courseId" =>$this->course->getId(),
            "created" => $this->created,
            "errors" => $this->errors,
            "suggestions" => $this->suggestions,
            "contentItems" => $this->getContentItemsGrouped()
        ];
    }


    // Private Methods

    /**
     * Creates new array of ContentItem grouped by contentType.
     * @return array
     */
    private function getContentItemsGrouped() {
        $groupedContentItems = array();
        foreach ($this->contentItems as $contentItem) {
            $contentTypePlural = $contentItem->getContentTypePlural();
            if(!array_key_exists($contentTypePlural, $groupedContentItems)) {
                $groupedContentItems[$contentTypePlural] = array();
            }
            array_push($groupedContentItems[$contentTypePlural], $contentItem);
        }
        ksort($groupedContentItems);
        return $groupedContentItems;
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

    public function getCourse(): ?Course
    {
        return $this->course;
    }

    public function setCourse(?Course $course): self
    {
        $this->course = $course;

        return $this;
    }

    /**
     * @return Collection|ContentItem[]
     */
    public function getContentItems(): Collection
    {
        return $this->contentItems;
    }

    public function addContentItem(ContentItem $contentItem): self
    {
        if (!$this->contentItems->contains($contentItem)) {
            $this->contentItems[] = $contentItem;
        }

        return $this;
    }

    public function removeContentItem(ContentItem $contentItem): self
    {
        if ($this->contentItems->contains($contentItem)) {
            $this->contentItems->removeElement($contentItem);
        }

        return $this;
    }
}
