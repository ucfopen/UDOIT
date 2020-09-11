<?php

namespace App\Entity;

use App\Services\UtilityService;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\ContentItemRepository")
 */
class ContentItem implements \JsonSerializable
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
     * @ORM\ManyToOne(targetEntity="App\Entity\Course", inversedBy="contentItems")
     * @ORM\JoinColumn(nullable=false)
     */
    private $course;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $contentType;

    /**
     * @ORM\Column(type="string", length=512)
     */
    private $lmsContentId;

    /**
     * @ORM\Column(type="datetime")
     */
    private $updated;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $metadata;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Issue", mappedBy="contentItem")
     */
    private $issues;

    /**
     * @ORM\Column(type="boolean")
     */
    private $active;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $body;

    // Constructor
    public function __construct()
    {
        $this->issues = new ArrayCollection();
    }

    // Public Methods

    /**
     * Serializes ContentItem into JSON.
     * @return array|mixed
     */
    public function jsonSerialize()
    {
        return $array = [
            'id' => $this->getId(),
            'title' => $this->getTitle(),
            'contentType' => $this->getContentType(),
            'lmsContentId' => $this->getLmsContentId(),
            'updated' => $this->getUpdated()->format('c'),
            'isActive' => $this->getActive()
        ];
    }

    public function __toString()
    {
        return \json_encode($this->jsonSerialize());
    }


    // Getters and Setters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCourse(): ?Course
    {
        return $this->course;
    }

    public function setCourse(?Course $course): self
    {
        $this->course = $course;
        $course->addContentItem($this);

        return $this;
    }

    public function getContentType(): ?string
    {
        return $this->contentType;
    }

    public function setContentType(string $contentType): self
    {
        $this->contentType = $contentType;

        return $this;
    }

    public function getLmsContentId(): ?string
    {
        return $this->lmsContentId;
    }

    public function setLmsContentId(string $lmsContentId): self
    {
        $this->lmsContentId = $lmsContentId;

        return $this;
    }

    public function getUpdated(): ?\DateTimeInterface
    {
        return $this->updated;
    }

    public function setUpdated(\DateTimeInterface $updated): self
    {
        $this->updated = $updated;

        return $this;
    }

    public function getMetadata(): ?string
    {
        return $this->metadata;
    }

    public function setMetadata(?string $metadata): self
    {
        $this->metadata = $metadata;

        return $this;
    }
    
    public function getBody(): ?string
    {
        return $this->body;
    }

    public function setBody(?string $body): self
    {
        $this->body = $body;

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
            $issue->setContentItem($this);
        }

        return $this;
    }

    public function removeIssue(Issue $issue): self
    {
        if ($this->issues->contains($issue)) {
            $this->issues->removeElement($issue);
            // set the owning side to null (unless already changed)
            if ($issue->getContentItem() === $this) {
                $issue->setContentItem(null);
            }
        }

        return $this;
    }

    public function getActive(): ?bool
    {
        return $this->active;
    }

    public function setActive(bool $active): self
    {
        $this->active = $active;

        return $this;
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
    
    public function update($lmsContent): self
    {
        try {
            $updatedDate = new \DateTime($lmsContent['updated'], UtilityService::$timezone);
            $this->setUpdated($updatedDate);
            $this->setTitle($lmsContent['title']);
            $this->setActive(true);
            $this->setBody($lmsContent['body']);
        }
        catch (\Exception $e) {
            
        }

        return $this;
    }
}
