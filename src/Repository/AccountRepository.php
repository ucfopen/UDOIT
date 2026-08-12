<?php

namespace App\Repository;

use App\Entity\Account;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Console\Output\ConsoleOutput;


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

    public function getAccountTree(User $user, $accountId): array
    {
        $institution = $user->getInstitution();
        $visitedAccountIds = [];
        $accounts = [$accountId];
        $parentAccounts = [$accountId];
        $includeRootAccount = true;

        while (!empty($parentAccounts)) {
            $qb = $this->createQueryBuilder('a')
                ->andWhere('a.institution = :institution')
                ->setParameter('institution', $institution)
                ->setParameter('accountIds', $parentAccounts);

            if ($includeRootAccount) {
                $qb->andWhere('a.lmsAccountId IN (:accountIds) OR a.parentAccountId IN (:accountIds)');
                $includeRootAccount = false;
            } else {
                $qb->andWhere('a.parentAccountId IN (:accountIds)');
            }

            $parentAccounts = [];

            foreach ($qb->getQuery()->getResult() as $account) {
                $lmsAccountId = $account->getLmsAccountId();

                if (isset($visitedAccountIds[$lmsAccountId])) {
                    continue;
                }

                $visitedAccountIds[$lmsAccountId] = true;
                $accounts[] = $lmsAccountId;
                $parentAccounts[] = $lmsAccountId;
            }
        }

        return $accounts;
    }
}
