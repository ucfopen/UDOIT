<?php

namespace App\Services;

use App\Entity\Institution;
use App\Entity\User;
use App\Repository\CourseRepository;
use App\Repository\ReportRepository;

class AdminService {
    /** @var CourseRepository $courseRepo */
    protected $courseRepo;

    protected $reportRepo;

    public function __construct(
        CourseRepository $courseRepo,
        ReportRepository $reportRepo
    )
    {
        $this->courseRepo = $courseRepo;
        $this->reportRepo = $reportRepo;
    }

    public function getCourseData(User $user, $accountId, $termId)
    {
        $institution = $user->getInstitution();
        $account = $institution->getAccountData($accountId);
        $subAccountIds = array_keys($account['subAccounts']);

        $courses = $this->courseRepo->findBy([
            'institution' => $institution,
            'active' => true,
        ]);
    }

    protected function getSubAccountIds(Institution $institution)
    {

    }

}