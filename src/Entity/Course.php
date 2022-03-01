<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\CourseRepository")
 */
class Course implements \JsonSerializable
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
     * @ORM\ManyToOne(targetEntity="App\Entity\Institution", inversedBy="courses")
     * @ORM\JoinColumn(nullable=false)
     */
    private $institution;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $lmsAccountId;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $lmsCourseId;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $lastUpdated;

    /**
     * @ORM\Column(type="boolean", nullable=true)
     */
    private $active;

    /**
     * @ORM\Column(type="boolean", nullable=true)
     */
    private $dirty;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\ContentItem", mappedBy="course", orphanRemoval=true)
     */
    private $contentItems;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Report", mappedBy="course", orphanRemoval=true)
     */
    private $reports;

    /**
     * @ORM\OneToMany(targetEntity=FileItem::class, mappedBy="course")
     */
    private $fileItems;

    /**
     * @ORM\Column(type="integer", nullable=true)
     */
    private $lmsTermId;


    // Constructor
    public function __construct()
    {
        $this->reports = new ArrayCollection();
        $this->contentItems = new ArrayCollection();
        $this->fileItems = new ArrayCollection();
    }


    // Public Methods

    /**
     * Serializes Course with basic information needed by front-end.
     * @return array
     */
    public function jsonSerialize(): array
    {
        return [
            "id" => $this->id,
            "title" => $this->title,
            "lmsAccountId" => $this->lmsAccountId,
            "lmsCourseId" => $this->lmsCourseId,
            "lastUpdated" => (!empty($this->lastUpdated)) ? $this->lastUpdated->format('c') : false,
            "active" => $this->active,
            "dirty" => $this->dirty,
            //"contentItems" => (!empty($this->contentItems)) ? $this->contentItems->toArray() : [],
        ];
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

    public function setTitle(?string $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function isActive(): ?bool
    {
        return $this->active;
    }

    public function setActive(?bool $status): self
    {
        $this->active = $status;

        return $this;
    }

    public function isDirty(): ?bool
    {
        return $this->dirty;
    }

    public function setDirty(?bool $status): self
    {
        $this->dirty = $status;

        return $this;
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

    public function getLmsAccountId(): ?string
    {
        return $this->lmsAccountId;
    }

    public function setLmsAccountId(?string $lms_account_id): self
    {
        $this->lmsAccountId = $lms_account_id;

        return $this;
    }

    public function getLmsCourseId(): ?string
    {
        return $this->lmsCourseId;
    }

    public function setLmsCourseId(?string $lms_course_id): self
    {
        $this->lmsCourseId = $lms_course_id;

        return $this;
    }

    public function getLastUpdated(): ?\DateTimeInterface
    {
        return $this->lastUpdated;
    }

    public function setLastUpdated(?\DateTimeInterface $last_updated): self
    {
        $this->lastUpdated = $last_updated;

        return $this;
    }

    /**
     * @return ContentItem[]
     */
    public function getContentItems(): Array
    {
        $contentItems = [];

        $items = $this->contentItems->toArray();
        usort($items, [$this, 'sortContentItems']);

        foreach ($items as $item) {
            if ($item->isActive()) {
                $contentItems[$item->getId()] = $item;
            }
        }

        return $contentItems;
    }

    public function addContentItem(ContentItem $contentItem): self
    {
        if (!$this->contentItems->contains($contentItem)) {
            $this->contentItems[] = $contentItem;
            $contentItem->setCourse($this);
        }

        return $this;
    }

    public function removeContentItem(ContentItem $contentItem): self
    {
        if ($this->contentItems->contains($contentItem)) {
            $this->contentItems->removeElement($contentItem);
            // set the owning side to null (unless already changed)
            if ($contentItem->getCourse() === $this) {
                $contentItem->setCourse(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection|Report[]
     */
    public function getReports(): Collection
    {
        return $this->reports;
    }

    public function addReport(Report $report): self
    {
        if (!$this->reports->contains($report)) {
            $this->reports[] = $report;
            $report->setCourse($this);
        }

        return $this;
    }

    public function removeReport(Report $report): self
    {
        if ($this->reports->contains($report)) {
            $this->reports->removeElement($report);
            // set the owning side to null (unless already changed)
            if ($report->getCourse() === $this) {
                $report->setCourse(null);
            }
        }

        return $this;
    }

    public function getPreviousReport(): ?Report
    {
        $reports = $this->reports->toArray();
        $count = count($reports);
        
        return ($count > 1) ? $reports[$count-2] : null;
    }
    
    public function getLatestReport(): ?Report
    {
        return $this->reports->last() ?: null;
    }


    public function getUpdatedReport()
    {
        $errors = $suggestions = $fixed = $resolved = $filesReviewed = 0;

        $report = $this->getLatestReport();
        /** @var \App\Entity\Issue[] $issues */
        $issues = $this->getAllIssues();

        foreach ($issues as $issue) {
            if ($issue->getStatus() === Issue::$issueStatusFixed) {
                $fixed++;
            } else if ($issue->getStatus() === Issue::$issueStatusResolved) {
                $resolved++;
            } else {
                if ('error' === $issue->getType()
                ) {
                    $errors++;
                } else {
                    $suggestions++;
                }
            }
        }

        $files = $this->getFileItems();
        foreach ($files as $file) {
            if ($file->getReviewed()) {
                $filesReviewed++;
            }
        }

        $report->setErrors($errors);
        $report->setSuggestions($suggestions);
        $report->setContentFixed($fixed);
        $report->setContentResolved($resolved);
        $report->setFilesReviewed($filesReviewed);
        
        return $report;
    }

    /**
     * @return FileItem[]
     */
    public function getFileItems($activeOnly = true): Array
    {
        $files = [];

        foreach ($this->fileItems as $file) {
            if ($activeOnly && !$file->isActive()) {
                continue;
            }
            $files[$file->getId()] = $file;
        }

        return $files;
    }

    public function addFileItem(FileItem $fileItem): self
    {
        if (!$this->fileItems->contains($fileItem)) {
            $this->fileItems[] = $fileItem;
            $fileItem->setCourse($this);
        }

        return $this;
    }

    public function removeFileItem(FileItem $fileItem): self
    {
        if ($this->fileItems->contains($fileItem)) {
            $this->fileItems->removeElement($fileItem);
            // set the owning side to null (unless already changed)
            if ($fileItem->getCourse() === $this) {
                $fileItem->setCourse(null);
            }
        }

        return $this;
    }

    public function getActiveIssues()
    {
        $activeIssues = [];

        foreach ($this->getContentItems() as $contentItem) {
            if ($contentItem->isActive()) {
                /** @var \App\Entity\Issue[] $issues */
                $issues = $contentItem->getIssues();

                foreach ($issues as $issue) {
                    if (Issue::$issueStatusActive === $issue->getStatus()) {
                        $activeIssues[] = $issue;
                    }
                }
            }
        }

        return $activeIssues;
    }

    public function getAllIssues()
    {
        $allIssues = [];

        foreach ($this->getContentItems() as $contentItem) {
            $allIssues = array_merge($allIssues, $contentItem->getIssues()->toArray());
        }

        return $allIssues;
    }

    protected function sortContentItems(ContentItem $a, ContentItem $b) 
    {
        return (strtolower($a->getTitle()) > strtolower($b->getTitle())) ? 1 : -1;
    }

    public function getLmsTermId(): ?int
    {
        return $this->lmsTermId;
    }

    public function setLmsTermId(?int $lmsTermId): self
    {
        $this->lmsTermId = $lmsTermId;

        return $this;
    }
}
