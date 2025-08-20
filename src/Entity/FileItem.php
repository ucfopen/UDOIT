<?php

namespace App\Entity;

use App\Repository\FileItemRepository;
use App\Services\UtilityService;
use Doctrine\ORM\Mapping as ORM;


#[ORM\Entity(repositoryClass: FileItemRepository::class)]
class FileItem implements \JsonSerializable
{

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    private $id;

    #[ORM\Column(type: "string", length: 255)]
    private $fileName;

    #[ORM\ManyToOne(targetEntity: Course::class, inversedBy: "fileItems")]
    private $course;

    #[ORM\Column(type: "string", length: 32)]
    private $fileType;

    #[ORM\Column(type: "string", length: 255)]
    private $lmsFileId;

    #[ORM\Column(type: "datetime", nullable: true)]
    private $updated;

    #[ORM\Column(type: "text", nullable: true)]
    private $metadata;

    #[ORM\Column(type: "boolean", nullable: true)]
    private $status;

    #[ORM\Column(type: "string", length: 255, nullable: true)]
    private $fileSize;

    #[ORM\Column(type: "boolean", nullable: true)]
    private $hidden;

    #[ORM\Column(type: "boolean", nullable: true)]
    private $reviewed;

    #[ORM\Column(type: "string", length: 255, nullable: true)]
    private $lmsUrl;

    #[ORM\Column(type: "string", length: 255, nullable: true)]
    private $downloadUrl;

    #[ORM\ManyToOne(targetEntity: User::class)]
    private $reviewedBy;

    #[ORM\Column(type: "datetime", nullable: true)]
    private $reviewedOn;

    #[ORM\Column(type: "boolean")]
    private $active;



    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFileName(): ?string
    {
        return $this->fileName;
    }

    public function setFileName(string $fileName): self
    {
        $this->fileName = $fileName;

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

    public function getFileType(): ?string
    {
        return $this->fileType;
    }

    public function setFileType(string $fileType): self
    {
        $this->fileType = $fileType;

        return $this;
    }

    public function getLmsFileId(): ?string
    {
        return $this->lmsFileId;
    }

    public function setLmsFileId(string $lmsFileId): self
    {
        $this->lmsFileId = $lmsFileId;

        return $this;
    }

    public function getUpdated(): ?\DateTimeInterface
    {
        return $this->updated;
    }

    public function setUpdated(?\DateTimeInterface $updated): self
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

    public function getStatus(): ?bool
    {
        return $this->status;
    }

    public function setStatus(?bool $status): self
    {
        $this->status = $status;

        return $this;
    }

    public function getFileSize(): ?string
    {
        return $this->fileSize;
    }

    public function setFileSize(?string $fileSize): self
    {
        $this->fileSize = $fileSize;

        return $this;
    }

    public function getHidden(): ?bool
    {
        return $this->hidden;
    }

    public function setHidden(?bool $hidden): self
    {
        $this->hidden = $hidden;

        return $this;
    }

    public function getReviewed(): ?bool
    {
        return $this->reviewed;
}

    public function setReviewed(?bool $reviewed): self
    {
        $this->reviewed = $reviewed;

        return $this;
    }

    public function update($file): self
    {
        $updatedDate = new \DateTime($file['updated'], UtilityService::$timezone);

        $this->setUpdated($updatedDate);
        // $this->setActive($file['status']);
        $this->setFileName($file['fileName']);
        $this->setStatus($file['status']);
        $this->setFileType($file['fileType']);
        $this->setFileSize($file['fileSize']);
        $this->setHidden($file['hidden']);
        $this->setDownloadUrl($file['url']);
        $this->setMetadata(\json_encode($file));

        return $this;
    }

    public function jsonSerialize(): array
    {
        return [
            'id' => $this->getId(),
            'fileName' => $this->getFileName(),
            'fileType' => $this->getFileType(),
            'lmsFileId' => $this->getLmsFileId(),
            'updated' => $this->getUpdated()->format('c'),
            'status' => $this->getStatus(),
            'active' => $this->isActive(),
            'fileSize' => $this->getFileSize(),
            'hidden' => $this->getHidden(),
            'reviewed' => $this->getReviewed(),
            'downloadUrl' => $this->getDownloadUrl(),
            'lmsUrl' => $this->getLmsUrl(),
        ];
    }

    public function getLmsUrl(): ?string
    {
        return $this->lmsUrl;
    }

    public function setLmsUrl(?string $url): self
    {
        $this->lmsUrl = $url;

        return $this;
    }

    public function getDownloadUrl(): ?string
    {
        return $this->downloadUrl;
    }

    public function setDownloadUrl(?string $url): self
    {
        $this->downloadUrl = $url;

        return $this;
    }

    public function getReviewedBy(): ?User
    {
        return $this->reviewedBy;
    }

    public function setReviewedBy(?User $reviewedBy): self
    {
        $this->reviewedBy = $reviewedBy;

        return $this;
    }

    public function getReviewedOn(): ?\DateTimeInterface
    {
        return $this->reviewedOn;
    }

    public function setReviewedOn(?\DateTimeInterface $reviewedOn): self
    {
        $this->reviewedOn = $reviewedOn;

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
}
