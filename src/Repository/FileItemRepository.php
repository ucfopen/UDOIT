<?php

namespace App\Repository;

use App\Entity\Course;
use App\Entity\FileItem;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method FileItem|null find($id, $lockMode = null, $lockVersion = null)
 * @method FileItem|null findOneBy(array $criteria, array $orderBy = null)
 * @method FileItem[]    findAll()
 * @method FileItem[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class FileItemRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, FileItem::class);
    }

    public function findByCourse(Course $course)
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.course = :course')
            ->setParameter(':course', $course)
            ->orderBy('c.fileName', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function setCourseFileItemsInactive(Course $course)
    {
        $em = $this->getEntityManager();
        $query = $em->createQuery('UPDATE App\Entity\FileItem f SET f.active=FALSE WHERE f.course=:course')
        ->setParameter(':course', $course);

        return $query->execute();
    }

    //  Returns an array of FileItem objects
    /*
    public function findByExampleField($value): array
    {
        return $this->createQueryBuilder('f')
            ->andWhere('f.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('f.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?FileItem
    {
        return $this->createQueryBuilder('f')
            ->andWhere('f.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
