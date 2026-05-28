<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection; 
use Doctrine\ORM\Mapping as ORM;


#[ORM\Entity(repositoryClass: "App\Repository\RegistrationRepository")]
#[ORM\Table(name: 'registration')]
class Registration
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    private ?int $id = null;

    #[ORM\Column(type: "string", length: 255)]
    private string $issuer;

    #[ORM\Column(type: "string", length: 255)]
    private string $clientId;

    // The redirect URL during LTI launch
    #[ORM\Column(type: "string", length: 2048)]
    private string $loginAuthEndpoint;

    // The LTI platform JWK URL
    #[ORM\Column(type: "string", length: 2048)]
    private string $jwksEndpoint;

    // The OAuth2 access token endpoint
    #[ORM\Column(type: "string", length: 2048)]
    private string $serviceAuthEndpoint;
    
    // The OAuth2 authorization endpoint
    #[ORM\Column(type: "string", length: 2048)]
    private string $serviceLoginEndpoint;

    #[ORM\Column(type: "string", length: 255)]
    private $apiClientId;

    #[ORM\Column(type: "string", length: 255)]
    private ?string $apiClientSecretEncrypted;

    #[ORM\OneToOne(targetEntity: Institution::class, inversedBy: 'registration')]
    #[ORM\JoinColumn(nullable: false, unique: true)]
    private Institution $institution;

    #[ORM\ManyToOne(
        targetEntity: SigningKeySet::class,
        inversedBy: "registrations",
    )]
    #[ORM\JoinColumn(onDelete: "RESTRICT")]
    private SigningKeySet $signingKeySet;

    #[ORM\OneToMany(targetEntity: Deployment::class, mappedBy: "registration", cascade: ["persist", "remove"])]
    private Collection $deployments;
    

    public function __construct(
      string $issuer,
      string $clientId,
      string $loginAuthEndpoint,
      string $jwksEndpoint,
      string $serviceAuthEndpoint,
      string $serviceLoginEndpoint,
      string $apiClientId,
      SigningKeySet $signingKeySet,
      Institution $institution
    )
    {
      $this->issuer = $issuer;
      $this->clientId = $clientId;
      $this->loginAuthEndpoint = $loginAuthEndpoint;
      $this->jwksEndpoint = $jwksEndpoint;
      $this->serviceAuthEndpoint = $serviceAuthEndpoint;
      $this->serviceLoginEndpoint = $serviceLoginEndpoint;
      $this->apiClientId = $apiClientId;
      $this->signingKeySet = $signingKeySet;
      $this->institution = $institution;
      $this->deployments = new ArrayCollection();
    }
    

    public function getId(): int
    {
        return $this->id;
    }

    public function getIssuer(): string
    {
        return $this->issuer;
    }

    public function setIssuer(string $issuer): static
    {
        $this->issuer = $issuer;

        return $this;
    }

    public function getClientId(): string
    {
        return $this->clientId;
    }

    public function setClientId(string $clientId): static
    {
        $this->clientId = $clientId;

        return $this;
    }

    public function getLoginAuthEndpoint(): string
    {
        return $this->loginAuthEndpoint;
    }

    public function setLoginAuthEndpoint(string $loginAuthEndpoint): static
    {
        $this->loginAuthEndpoint = $loginAuthEndpoint;

        return $this;
    }

    public function getJwksEndpoint(): string
    {
        return $this->jwksEndpoint;
    }

    public function setJwksEndpoint(string $jwksEndpoint): static
    {
        $this->jwksEndpoint = $jwksEndpoint;

        return $this;
    }

    public function getServiceAuthEndpoint(): string
    {
        return $this->serviceAuthEndpoint;
    }

    public function setServiceAuthEndpoint(string $serviceAuthEndpoint): static
    {
        $this->serviceAuthEndpoint = $serviceAuthEndpoint;

        return $this;
    }

    public function getServiceLoginEndpoint(): string
    {
        return $this->serviceLoginEndpoint;
    }

    public function setServiceLoginEndpoint(string $serviceLoginEndpoint): static
    {
        $this->serviceLoginEndpoint = $serviceLoginEndpoint;

        return $this;
    }

    public function getApiClientId(): string
    {
        return $this->apiClientId;
    }

    public function setApiClientId(string $apiClientId): static
    {
        $this->apiClientId = $apiClientId;

        return $this;
    }

    public function getApiClientSecretEncrypted(): ?string
    {
        return $this->apiClientSecretEncrypted;
    }

    public function setApiClientSecretEncrypted(string $apiClientSecretEncrypted): static
    {
        $this->apiClientSecretEncrypted = $apiClientSecretEncrypted;

        return $this;
    }

    public function getInstitution(): Institution
    {
        return $this->institution;
    }

    public function setInstitution(Institution $institution): static
    {
        $this->institution = $institution;

        return $this;
    }

    public function getSigningKeySet(): SigningKeySet
    {
        return $this->signingKeySet;
    }

    public function setSigningKeySet(SigningKeySet $signingKeySet): static
    {
        $this->signingKeySet = $signingKeySet;

        return $this;
    }

    public function getDeployments(): Collection
    {
        return $this->deployments;
    }

    public function addDeployment(Deployment $deployment): static
    {
        if (!$this->deployments->contains($deployment)) {
            $this->deployments->add($deployment);
            $deployment->setRegistration($this);
        }

        return $this;
    }

    public function removeDeployment(Deployment $deployment): static
    {
        $this->deployments->removeElement($deployment);

        return $this;
    }
}