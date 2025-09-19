<?php
namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: \App\Repository\CourseUserRepository::class)]
#[ORM\Table(name: 'course_user')]
#[ORM\UniqueConstraint(name: 'uniq_course_lmsuser', columns: ['course_id','lms_user_id'])]
class CourseUser implements \JsonSerializable {
  #[ORM\Id, ORM\GeneratedValue, ORM\Column(type:'integer')]
  private ?int $id = null;

  #[ORM\ManyToOne(targetEntity: Course::class)]
  #[ORM\JoinColumn(nullable:false, onDelete:'CASCADE')]
  private Course $course;

  #[ORM\ManyToOne(targetEntity: User::class)]
  #[ORM\JoinColumn(nullable:true, onDelete:'SET NULL')]
  private ?User $user = null;

  #[ORM\Column(name:'lms_user_id', type:'string', length:64)]
  private string $lmsUserId;

  #[ORM\Column(name:'display_name', type:'string', length:255, nullable:true)]
  private ?string $displayName = null;

  #[ORM\Column(name:'fetched_at', type:'datetime', nullable:true)]
  private ?\DateTimeInterface $fetchedAt = null;

public function jsonSerialize(): mixed
    {
        return [
            'id'          => $this->getId(),
            'courseId'    => $this->getCourse()->getId(),
            'lmsUserId'   => $this->getLmsUserId(),
            'displayName' => $this->getDisplayName(),
            'fetchedAt'   => $this->getFetchedAt()?->format(DATE_ATOM),
        ];
    }

  public function getId(): ?int
{
    return $this->id;
}

public function getCourse(): Course
{
    return $this->course;
}

public function setCourse(Course $course): self
{
    $this->course = $course;
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

public function getLmsUserId(): string
{
    return $this->lmsUserId;
}

public function setLmsUserId(string $lmsUserId): self
{
    $this->lmsUserId = $lmsUserId;
    return $this;
}

public function getDisplayName(): ?string
{
    return $this->displayName;
}

public function setDisplayName(?string $displayName): self
{
    $this->displayName = $displayName;
    return $this;
}

public function getFetchedAt(): ?\DateTimeInterface
{
    return $this->fetchedAt;
}

public function setFetchedAt(?\DateTimeInterface $fetchedAt): self
{
    $this->fetchedAt = $fetchedAt;
    return $this;
}

}