<?php
namespace App\Repository;

use App\Entity\Course;
use App\Entity\CourseUser;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

final class CourseUserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CourseUser::class);
    }

    /** Read all rows for a course (DB is the cache) */
    public function findByCourse(Course $course): array
    {
            return $this->findBy(
            ['course' => $course],
            ['displayName' => 'ASC']
        );
    }

    /** For TTL check: when did we last fetch any row for this course? */
    public function maxFetchedAt(Course $course): ?\DateTimeInterface
    {
        $val = $this->createQueryBuilder('cu')
            ->select('MAX(cu.fetchedAt)')
            ->andWhere('cu.course = :course')
            ->setParameter('course', $course)
            ->getQuery()->getSingleScalarResult();

        return $val ? new \DateTimeImmutable($val) : null;
    }

    /** Find the unique mapping row */
    public function findOneByCourseAndLmsUserId(Course $course, string $lmsUserId): ?CourseUser
    {
        return $this->findOneBy(['course' => $course, 'lmsUserId' => $lmsUserId]);
    }

    /**
     * Idempotent insert-or-update from API data.
     * - Ensures one row per (course, lms_user_id)
     * - Updates display_name if missing
     * - Stamps fetched_at
     * - Optionally links a User (when you have it)
     */
    public function upsertFromApi(Course $course, string $lmsUserId, ?string $displayName, ?User $user = null): CourseUser
    {
        $em = $this->getEntityManager();

        $cu = $this->findOneByCourseAndLmsUserId($course, $lmsUserId);
        if (!$cu) {
            $cu = new CourseUser();
            $cu->setCourse($course);
            $cu->setLmsUserId($lmsUserId);
            $em->persist($cu);
        }

        if ($displayName && !$cu->getDisplayName()) {
            $cu->setDisplayName($displayName);
        }

        if ($user && !$cu->getUser()) {
            $cu->setUser($user);
        }

        $cu->setFetchedAt(new \DateTimeImmutable());
        // Do not flush here if you’ll call this in a loop; let the caller flush once.
        return $cu;
    }
}