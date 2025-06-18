<?php

namespace App\Entity;

use App\Services\HtmlService;
use App\Services\UtilityService;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: "App\Repository\ContentItemRepository")]
class ContentItem implements \JsonSerializable
{
    // Private Members

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    private $id;

    #[ORM\Column(type: "string", length: 255)]
    private $title;

    #[ORM\ManyToOne(targetEntity: "App\Entity\Course", inversedBy: "contentItems")]
    #[ORM\JoinColumn(nullable: false)]
    private $course;

    #[ORM\Column(type: "string", length: 255)]
    private $contentType;

    #[ORM\Column(type: "string", length: 512)]
    private $lmsContentId;

    #[ORM\Column(type: "datetime")]
    private $updated;

    #[ORM\Column(type: "text", nullable: true)]
    private $metadata;

    #[ORM\OneToMany(targetEntity: "App\Entity\Issue", mappedBy: "contentItem")]
    private $issues;

    #[ORM\Column(type: "boolean")]
    private $published;

    #[ORM\Column(type: "boolean")]
    private $active;

    #[ORM\Column(type: "text", nullable: true)]
    private $body;

    #[ORM\Column(type: "string", length: 255, nullable: true)]
    private $url;


    // Constructor
    public function __construct()
    {
        $this->issues = new ArrayCollection();
    }

    // Public Methods

    public function jsonSerialize(): array
    {
        return [
            'id' => $this->getId(),
            'title' => $this->getTitle(),
            'contentType' => $this->getContentType(),
            'lmsContentId' => $this->getLmsContentId(),
            'updated' => $this->getUpdated()->format('c'),
            'published' => $this->isPublished(),
            'status' => $this->isPublished(),
            'body' => $this->getBody(),
            'url' => $this->getUrl(),
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
        // If the updated date is a string, convert it to a DateTime object
        if (is_string($updated)) {
            $updated = new \DateTime($updated, UtilityService::$timezone);
        }

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
        // return html_entity_decode($this->body, ENT_QUOTES);
    }

    public function setBody(?string $body): self
    {
        $this->body = $body;
        // $this->body = HtmlService::clean($body);

        return $this;
    }

    public function getIssues(): Collection | array
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

    public function isPublished(): ?bool
    {
        return $this->published;
    }

    public function setPublished(bool $published): self
    {
        $this->published = $published;

        return $this;
    }

    public function isActive(): ?bool
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
        // try {
        $updatedDate = new \DateTime($lmsContent['updated'], UtilityService::$timezone);

        $this->setUpdated($updatedDate);
        $this->setTitle($lmsContent['title']);
        $this->setPublished($lmsContent['status']);
        $this->setActive(true);
        $this->setBody($lmsContent['body']);
        $this->setUrl($lmsContent['url']);

        // }
        // catch (\Exception $e) {

        // }

        return $this;
    }

    public function getUrl(): ?string
    {
        return $this->url;
    }

    public function setUrl(?string $url): self
    {
        $this->url = $url;

        return $this;
    }
}
