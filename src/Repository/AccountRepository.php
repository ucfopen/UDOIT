<?php

namespace App\Repository;

use App\Entity\Account;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Account|null find($id, $lockMode = null, $lockVersion = null)
 * @method Account|null findOneBy(array $criteria, array $orderBy = null)
 * @method Account[]    findAll()
 * @method Account[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class AccountRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Account::class);
    }

    public function getSubAccounts(User $user, $accountId){
        $institution = $user->getInstitution();

        $qb = $this->createQueryBuilder('a');

        $qb = $this->createQueryBuilder('a')
            ->andWhere('a.institution = :institution')
            ->andWhere(
                $qb->expr()->orX(
                    'a.lmsAccountId = :accountId',
                    'a.parentAccountId = :accountId'
                )
            )
            ->setParameter('institution', $institution)
            ->setParameter('accountId', $accountId);
        
        return $qb->getQuery()->getResult();
    }
}
