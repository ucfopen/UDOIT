<?php

namespace App\Repository;

use App\Entity\Term;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Term|null find($id, $lockMode = null, $lockVersion = null)
 * @method Term|null findOneBy(array $criteria, array $orderBy = null)
 * @method Term[]    findAll()
 * @method Term[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class TermRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Term::class);
    }

    public function getAllTerms(User $user){
        $institution = $user->getInstitution();

        $qb = $this->createQueryBuilder('c')
            ->andWhere('c.institution = :institution')
            ->setParameter('institution', $institution);

        
        return $qb->getQuery()->getResult();

    }
}
