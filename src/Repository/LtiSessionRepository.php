<?php

namespace App\Repository;

use App\Entity\LtiSession;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;


class LtiSessionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, LtiSession::class);
    }

    public function getByState(string $state)
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('ls')
            ->from(LtiSession::class, 'ls')
            ->where('ls.state = :state')
            ->setParameter('state', $state)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function deleteExpired()
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->delete(LtiSession::class, 'ls')
            ->where('ls.expiresAt < :now')
            ->setParameter('now', new \DateTimeImmutable())
            ->getQuery()
            ->execute();
    }
}