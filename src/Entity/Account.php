<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: "App\Repository\AccountRepository")]
class Account implements \JsonSerializable
{
    #[ORM\Id]
    #[ORM\Column(name: "lms_account_id", type: "string", length: 255)]
    private string $lmsAccountId;

    #[ORM\Column(type: "string", length: 255)]
    private string $accountName;

    #[ORM\ManyToOne(targetEntity: "App\Entity\Institution", inversedBy: "accounts")]
    #[ORM\JoinColumn(nullable: false)]
    private $institution;

    public function __construct(string $lmsAccountId, string $accountName)
    {
        $this->lmsAccountId = $lmsAccountId;
        $this->accountName = $accountName;
    }

    public function jsonSerialize(): array
    {
        return [
            "lmsAccountId" => $this->lmsAccountId,
            "accountName" => $this->accountName,
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
