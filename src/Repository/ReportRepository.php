<?php

namespace App\Repository;

use App\Entity\Report;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Report|null find($id, $lockMode = null, $lockVersion = null)
 * @method Report|null findOneBy(array $criteria, array $orderBy = null)
 * @method Report[]    findAll()
 * @method Report[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ReportRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Report::class);
    }

    public function findAllInCourse($course) {
        return  $this->createQueryBuilder('r')
            ->where('r.course = :course')
            ->orderBy('r.created', 'ASC')
            ->setParameter('course', $course)
            ->getQuery()
            ->getResult();
    }

    public function findLatestByCourseIds(array $courseIds): array
    {
        if (!$courseIds) {
            return [];
        }

        $qb = $this->createQueryBuilder('r');

        $subQb = $this->getEntityManager()->createQueryBuilder()
            ->select('r2.id')
            ->from(Report::class, 'r2')
            ->where('r2.course = r.course')
            ->andWhere('r2.created > r.created OR (r2.created = r.created AND r2.id > r.id)');

        return $qb
            ->join('r.course', 'c')
            ->where('c.lmsCourseId IN (:courseIds)')
            ->andWhere($qb->expr()->not($qb->expr()->exists($subQb->getDQL())))
            ->setParameter('courseIds', $courseIds)
            ->orderBy('c.lmsCourseId', 'ASC')
            ->getQuery()
            ->getResult();
    }

    // Returns an array of Report objects
    /*
    public function findByExampleField($value): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('r.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?Report
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
