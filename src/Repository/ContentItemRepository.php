<?php

namespace App\Repository;

use App\Entity\ContentItem;
use App\Entity\Course;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method ContentItem|null find($id, $lockMode = null, $lockVersion = null)
 * @method ContentItem|null findOneBy(array $criteria, array $orderBy = null)
 * @method ContentItem[]    findAll()
 * @method ContentItem[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ContentItemRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ContentItem::class);
    }

    public function setCourseContentInactive(Course $course)
    {
        $em = $this->getEntityManager();
        $query = $em->createQuery('UPDATE App\Entity\ContentItem c SET c.active=FALSE WHERE c.course=:course')
            ->setParameter(':course', $course);

        return $query->execute();
    }

    public function removeInactiveContentItems()
    {
        return $this->getEntityManager()
            ->createQuery('DELETE App\Entity\ContentItem ci WHERE ci.active = FALSE')->execute();
    }

    public function getUpdatedContentItems(Course $course)
    {
        $latestReport = $course->getLatestReport();

        if (!$latestReport) {
            return $this->createQueryBuilder('c')
                ->andWhere('c.course = :course')
                ->andWhere('c.active = TRUE')
                ->setParameter('course', $course)
                ->getQuery()
                ->getResult();
        }

        return $this->createQueryBuilder('c')
            ->andWhere('c.course = :course')
            ->andWhere('c.updated > :updated')
            ->andWhere('c.active = TRUE')
            ->setParameter('course', $course)
            ->setParameter('updated', $latestReport->getCreated())
            ->getQuery()
            ->getResult();
    }

    // Get all content items that haven't changed since the course was last updated.
    public function getUnchangedContentItems(Course $course): Array
    {
        $lastUpdated = $course->getLastUpdated();
        if (!$lastUpdated) {
            return [];
        }

        return $this->createQueryBuilder('c')
            ->andWhere('c.course = :course')
            ->andWhere('c.updated < :updated')
            ->andWhere('c.active = TRUE')
            ->setParameter('course', $course)
            ->setParameter('updated', $lastUpdated)
            ->getQuery()
            ->getResult();
    }

    // Find content items by content type
    public function findByContentType(Course $course, $contentType): Array
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.course = :course')
            ->andWhere('c.active = TRUE')
            ->andWhere('c.contentType = :contentType')
            ->setParameter('course', $course)
            ->setParameter('contentType', $contentType)
            ->getQuery()
            ->getResult();
    }

    // Returns an array of ContentItem objects
    /*
    public function findByExampleField($value): array
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('c.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?ContentItem
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
