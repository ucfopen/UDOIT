<?php

namespace App\Repository;

use App\Entity\Registration;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;


class RegistrationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Registration::class);
    }

    public function getByIssAndClientId(string $iss, string $clientId)
    {
        return $this->getEntityManager()->createQueryBuilder()
            ->select('r')
            ->from(Registration::class, 'r')
            ->where('r.issuer = :iss')
            ->andWhere('r.clientId = :clientId')
            ->setParameter('iss', $iss)
            ->setParameter('clientId', $clientId)
            ->getQuery()
            ->getResult();
    }
}