<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;


#[ORM\Entity(repositoryClass: "App\Repository\IssueRepository")]
class Issue implements \JsonSerializable
{
    static $issueError = 'error';
    static $issuePotential = 'potential';
    static $issueSuggestion = 'suggestion';
    static $issueStatusActive = 0;
    static $issueStatusFixed = 1;
    static $issueStatusResolved = 2;

    // Private Members
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    private $id;

    #[ORM\ManyToOne(targetEntity: "App\Entity\ContentItem", inversedBy: "issues")]
    #[ORM\JoinColumn(nullable: false)]
    private $contentItem;

    #[ORM\Column(type: "string", length: 255)]
    private $scanRuleId;

    #[ORM\Column(type: "text", nullable: true)]
    private $html;

    #[ORM\Column(type: "string", length: 255)]
    private $type;

    #[ORM\Column(type: "smallint")]
    private $status;


    #[ORM\ManyToOne(targetEntity: User::class)]
    private $fixedBy;

    #[ORM\Column(type: "datetime", nullable: true)]
    private $fixedOn;


    #[ORM\Column(type: "text", nullable: true)]
    private $previewHtml;

    #[ORM\Column(type: "text", nullable: true)]
    private $newHtml;

    #[ORM\Column(type: "json", nullable: true)]
    private $metadata;

    // Constructor
    public function __construct()
    {
        $this->reports = new ArrayCollection();
    }


    // Public Methods

    public function jsonSerialize(): array
    {
        return [
            "id" => $this->id,
            "status" => $this->status,
            "contentItemId" => $this->contentItem->getId(),
            "scanRuleId" => $this->scanRuleId,
            "type" => $this->type,
            "sourceHtml" => $this->html,
            "previewHtml" => $this->previewHtml,
            "metadata" => $this->metadata,
        ];
    }

    // Getters and Setters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getContentItem(): ?ContentItem
    {
        return $this->contentItem;
    }

    public function setContentItem(?ContentItem $contentItem): self
    {
        $this->contentItem = $contentItem;

        return $this;
    }

    public function getScanRuleId(): ?string
    {
        return $this->scanRuleId;
    }

    public function setScanRuleId(string $scanRuleId): self
    {
        $this->scanRuleId = $scanRuleId;

        return $this;
    }

    public function getHtml(): ?string
    {
        return $this->html;
    }

    public function setHtml(?string $html): self
    {
        $this->html = $html;

        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): self
    {
        $this->type = $type;

        return $this;
    }

    public function getStatus(): ?int
    {
        return $this->status;
    }

    public function setStatus(int $status): self
    {
        $this->status = $status;

        return $this;
    }

    public function getFixedBy(): ?User
    {
        return $this->fixedBy;
    }

    public function setFixedBy(?User $fixedBy): self
    {
        $this->fixedBy = $fixedBy;

        return $this;
    }

    public function getFixedOn(): ?\DateTimeInterface
    {
        return $this->fixedOn;
    }

    public function setFixedOn(?\DateTimeInterface $fixedOn): self
    {
        $this->fixedOn = $fixedOn;

        return $this;
    }

    public function getPreviewHtml(): ?string
    {
        return $this->previewHtml;
    }

    public function setPreviewHtml(?string $previewHtml): self
    {
        $this->previewHtml = $previewHtml;

        return $this;
    }

    public function getNewHtml(): ?string
    {
        return $this->newHtml;
    }

    public function setNewHtml(?string $newHtml): self
    {
        $this->newHtml = $newHtml;

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

}
