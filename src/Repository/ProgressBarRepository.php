<?php 

namespace App\Repository;

use App\Entity\ProgressBar;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method ProgressBar|null find($id, $lockMode = null, $lockVersion = null)
 * @method ProgressBar|null findOneBy(array $criteria, array $orderBy = null)
 * @method ProgressBar[]    findAll()
 * @method ProgressBar[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */

class ProgressBarRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ProgressBar::class);
    }
}
