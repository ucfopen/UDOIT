<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: "App\Repository\ReportRepository")]
#[ORM\Table(name: 'report')]
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

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: "reports")]
    #[ORM\JoinColumn(nullable: false)]
    private $user;

    #[ORM\Column(type: "datetime")]
    private $created;

    #[ORM\Column(type: "integer", nullable: true)]
    private $issues;

    #[ORM\Column(type: "integer", nullable: true)]
    private $potential_issues;

    
    #[ORM\Column(type: "integer", nullable: true)]
    private $unreviewed_files;


    #[ORM\Column(type: "integer", nullable: true)]
    private $issues_fixed;

    #[ORM\Column(type: "integer", nullable: true)]
    private $issues_reviewed;

    #[ORM\Column(type: "integer", nullable: true)]
    private $potential_issues_fixed;

    #[ORM\Column(type: "integer", nullable: true)]
    private $potential_issues_reviewed;

    #[ORM\Column(type: "integer", nullable: true)]
    private $reviewed_files;

    #[ORM\Column(type: "string", length: 255)]
    private $highest_scan_rule;

    private $queueItems;

    // Constructor
    public function __construct()
    {
        $this->queueItems = new ArrayCollection();
    }


    // Public Methods
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }

    public function toArray(): array
    {
        return [
            "id" => $this->id,
            "courseId" => $this->course->getId(),
            "created" => $this->created->format($_ENV['DATE_FORMAT']),
            "issues" => $this->getIssues(),
            "potentialIssues" => $this->getPotentialIssues(),
            "unreviewedFiles" => $this->getUnreviewedFiles(),
            "issuesFixed" => $this->getIssuesFixed(),
            "issuesReviewed" => $this->getIssuesReviewed(),
            "potentialIssuesFixed" => $this->getPotentialIssuesFixed(),
            "potentialIssuesReviewed" => $this->getPotentialIssuesReviewed(),
            "reviewedFiles" => $this->getReviewedFiles(),
            "highestScanRule" => $this->getHighestScanRule(),
        ];
    }


    // Getters and Setters
    public function getId(): ?int
    {
        return $this->id;
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

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function getIssues(): int
    {
        return ($this->issues) ?: 0;
    }

    public function setIssues(?int $issues): self
    {
        $this->issues = $issues;

        return $this;
    }

    public function addToIssueCount(): self
    {
        $this->issues = $this->getIssues() + 1;

        return $this;
    }

    public function getPotentialIssues(): int
    {
        return ($this->potential_issues) ?: 0;
    }

    public function setPotentialIssues(?int $potentialIssues): self
    {
        $this->potential_issues = $potentialIssues;

        return $this;
    }

    public function addToPotentialIssueCount(): self
    {
        $this->potential_issues = $this->getPotentialIssues() + 1;

        return $this;
    }

    public function getUnreviewedFiles(): int
    {
        return ($this->unreviewed_files) ?: 0;
    }

    public function setUnreviewedFiles(?int $unreviewedFiles): self
    {
        $this->unreviewed_files = $unreviewedFiles;

        return $this;
    }

    public function getIssuesFixed(): int
    {
        return ($this->issues_fixed) ?: 0;
    }

    public function setIssuesFixed(?int $issuesFixed): self
    {
        $this->issues_fixed = $issuesFixed;

        return $this;
    }

    public function getIssuesReviewed(): int
    {
        return ($this->issues_reviewed) ?: 0;
    }

    public function setIssuesReviewed(?int $issuesReviewed): self
    {
        $this->issues_reviewed = $issuesReviewed;

        return $this;
    }

    public function getPotentialIssuesFixed(): int
    {
        return ($this->potential_issues_fixed) ?: 0;
    }

    public function setPotentialIssuesFixed(?int $potentialIssuesFixed): self
    {
        $this->potential_issues_fixed = $potentialIssuesFixed;

        return $this;
    }

    public function getPotentialIssuesReviewed(): int
    {
        return ($this->potential_issues_reviewed) ?: 0;
    }

    public function setPotentialIssuesReviewed(?int $potentialIssuesReviewed): self
    {
        $this->potential_issues_reviewed = $potentialIssuesReviewed;

        return $this;
    }

    public function getReviewedFiles(): int
    {
        return ($this->reviewed_files) ?: 0;
    }

    public function setReviewedFiles(?int $reviewedFiles): self
    {
        $this->reviewed_files = $reviewedFiles;

        return $this;
    }

    public function getHighestScanRule(): ?string
    {
        return $this->highest_scan_rule;
    }

    public function setHighestScanRule(string $highestScanRule): self
    {
        $this->highest_scan_rule = $highestScanRule;

        return $this;
    }

    public function getIssueCount(): int
    {
        return $this->getIssues()
            + $this->getPotentialIssues()
            + $this->getIssuesFixed()
            + $this->getIssuesReviewed()
            + $this->getPotentialIssuesFixed()
            + $this->getPotentialIssuesReviewed();
    }

    public function getActiveIssueCount(): int
    {
            return $this->getIssues()
            + $this->getPotentialIssues();
    }

    public function getQueueItems()
    {
        return $this->queueItems;
    }

    public function setQueueItems($queueItems): self
    {
        $this->queueItems = $queueItems;

        return $this;
    }
}
