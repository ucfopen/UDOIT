<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'deployment')]
class Deployment
{

  #[ORM\Id]
  #[ORM\GeneratedValue]
  #[ORM\Column(type: "integer")]
  private int $id;

  #[ORM\ManyToOne(
      targetEntity: Registration::class, 
      inversedBy: "deployments", 
  )]
  #[ORM\JoinColumn(nullable: false)]
  private Registration $registration;

  // The LMS-supplied ID for the deployment
  #[ORM\Column(type: "string", length: 2048, nullable: false)]
  private string $lmsDeploymentId;

  public function __construct(Registration $registration, string $lmsDeploymentId)
  {
    $this->registration = $registration;
    $this->lmsDeploymentId = $lmsDeploymentId;
  }

  public function getId(): int
  {
    return $this->id;
  }

  public function getRegistration(): Registration
  {
    return $this->registration;
  }

  public function setRegistration(Registration $registration): static
  {
    $this->registration = $registration;

    return $this;
  }

  public function getLmsDeploymentId(): string
  {
    return $this->lmsDeploymentId;
  }

  public function setLmsDeploymentId(string $lmsDeploymentId): static
  {
    $this->lmsDeploymentId = $lmsDeploymentId;

    return $this;
  }
}
