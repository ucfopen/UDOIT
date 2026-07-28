<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: "App\Repository\AccountRepository")]
class Account implements \JsonSerializable
{
    #[ORM\ManyToOne(targetEntity: Institution::class)]
    #[ORM\JoinColumn(name: "institution_id", referencedColumnName: "id", nullable: false)]
    private Institution $institution;

    #[ORM\Id]
    #[ORM\Column(name: "lms_account_id", type: "string", length: 255)]
    private string $lmsAccountId;

    #[ORM\Column(type: "string", length: 255)]
    private string $accountName;

    #[ORM\Column(name: "parent_account_id", type: "string", length: 255, nullable: true)]
    private string $parentAccountId;

    public function __construct(Institution $institution, string $lmsAccountId, string $accountName)
    {
        $this->institution = $institution;
        $this->lmsAccountId = $lmsAccountId;
        $this->accountName = $accountName;
        $this->parentAccountId = $parentAccountId;
    }

    public function jsonSerialize(): array
    {
        return [
            "lmsAccountId" => $this->lmsAccountId,
            "accountName" => $this->accountName,
            "parentAccountId" => $this->parentAccountId,
        ];
    }

    public function getLmsAccountId(): string
    {
        return $this->lmsAccountId;
    }

    public function setLmsAccountId(string $lmsAccountId): self
    {
        $this->lmsAccountId = $lmsAccountId;
        return $this;
    }

    public function getAccountName(): string
    {
        return $this->accountName;
    }

    public function setAccountName(string $accountName): self
    {
        $this->accountName = $accountName;
        return $this;
    }

    public function getInstitution(): Institution
    {
        return $this->institution;
    }

    public function setInstitution(Institution $institution): self
    {
        $this->institution = $institution;

        return $this;
    }

     public function getParentAccountId(): string
    {
        return $this->parentAccountId;
    }

    public function setParentAccountId(string $parentAccountId): self
    {
        $this->parentAccountId = $parentAccountId;
        return $this;
    }
}
