<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: "App\Repository\TermRepository")]
class Term implements \JsonSerializable
{
    #[ORM\Id]
    #[ORM\Column(name: "lms_term_id", type: "string", length: 255)]
    private string $lmsTermId;

    #[ORM\Column(type: "string", length: 255)]
    private string $termName;

    #[ORM\ManyToOne(targetEntity: "App\Entity\Institution", inversedBy: "terms")]
    #[ORM\JoinColumn(nullable: false)]
    private $institution;

    public function __construct(string $lmsTermId, string $termName)
    {
        $this->lmsTermId = $lmsTermId;
        $this->termName = $termName;
    }

    public function jsonSerialize(): array
    {
        return [
            "lmsTermId" => $this->lmsTermId,
            "termName" => $this->termName,
        ];
    }

    public function getLmsTermId(): string
    {
        return $this->lmsTermId;
    }

    public function setLmsTermId(string $lmsTermId): self
    {
        $this->lmsTermId = $lmsTermId;
        return $this;
    }

    public function getTermName(): string
    {
        return $this->termName;
    }

    public function setTermName(string $termName): self
    {
        $this->termName = $termName;
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
}

