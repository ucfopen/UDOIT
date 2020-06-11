<?php

namespace App\Repository;

use App\Entity\Course;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Common\Persistence\ManagerRegistry;

/**
 * @method Course|null find($id, $lockMode = null, $lockVersion = null)
 * @method Course|null findOneBy(array $criteria, array $orderBy = null)
 * @method Course[]    findAll()
 * @method Course[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 * @method Course[]    findCoursesNeedingUpdate($maxAge)
 */
class CourseRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Course::class);
    }

    /**
     * @return Course[] Returns an array of Course objects
     */
    public function findCoursesNeedingUpdate($maxAge = '1D')
    {
        $now = new \DateTime();
        $expiryDate = $now->sub(new \DateInterval('P' . $maxAge));
        
        return $this->createQueryBuilder('c')
            ->andWhere('c.lastUpdated < :val')
            ->andWhere('c.active = 1')
            ->andWhere('c.dirty = 0')
            ->setParameter('val', $expiryDate->format('Y-m-d h:i:s'))
            ->orderBy('c.lastUpdated', 'ASC')
            ->getQuery()
            ->getResult()
        ;
    }

    /**
     * Gets list of all courses in an institution.
     * @param $institutionId
     * @return int|mixed|string
     */
    public function findCoursesInInstitution($institutionId) {
        return $this->createQueryBuilder('c')
            ->where('c.institution = :institutionId')
            ->orderBy('c.title', 'ASC')
            ->setParameter('institutionId', $institutionId)
            ->getQuery()
            ->getResult();
    }

    /*
    public function findOneBySomeField($value): ?Course
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
