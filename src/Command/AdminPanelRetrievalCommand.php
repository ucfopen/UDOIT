<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Output\ConsoleOutput;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Account;
use App\Entity\Course;
use App\Entity\Institution;
use App\Entity\Term;
use App\Lms\Canvas\CanvasApi;

#[AsCommand(
    name: 'app:admin-panel-retrieval',
    description: 'Retrieve admin panel data',
)]
class AdminPanelRetrievalCommand extends Command
{
    public function __construct(private EntityManagerInterface $em)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $batchSize = 500;
        $output = new ConsoleOutput();
        $requiredEnvVars = [
            'ADMIN_RETRIEVAL_LMS_URL',
            'ADMIN_RETRIEVAL_API_TOKEN',
            'ADMIN_PANEL_INSTITUTION_ID',
        ];

        foreach ($requiredEnvVars as $var) {
            if (false === getenv($var)) {
                $output->writeln("<error>Missing required environment variable: {$var}</error>");
                return Command::FAILURE;
            }
        }

        $institutionId = (int) getenv('ADMIN_PANEL_INSTITUTION_ID');
        $institution = $this->em->getRepository(Institution::class)->find($institutionId);

        $canvas = new CanvasApi(getenv('ADMIN_RETRIEVAL_LMS_URL'), getenv('ADMIN_RETRIEVAL_API_TOKEN'));

        $accounts = $canvas->apiGet('accounts')->getContent();
        $rootAccount = null;

        foreach ($accounts as $account) {
            if ($account['parent_account_id'] === null) {
                $rootAccount = $account;
                break;
            }
        }

        $subAccounts = $canvas->apiGet("accounts/{$rootAccount['id']}/sub_accounts?recursive=true")->getContent();
        $subAccounts[] = $rootAccount;

        $accounts = $subAccounts;

        $courses = $canvas
                ->apiGet("accounts/{$rootAccount['id']}/courses?include[]=term&include[]=teachers")
                ->getContent();
        $allCourses = [];
        $allTerms = [];

        foreach ($courses as &$course) {
            if ($course['term'] !== null && !isset($allTerms[$course['term']['id']])) {
                $allTerms[$course['term']['id']] = $course['term']['name'];
            }
            $allCourses[$course['id']] = $course;
        }

        foreach ($accounts as $account) {
            $existing = $this->em->getRepository(Account::class)->find($account['id']);
            if (!$existing) {
                $accountModel = new Account($institution, $account['id'], $account['name']);
                $this->em->persist($accountModel);
            }
        }
        $this->em->flush();

        foreach ($allTerms as $key => $value) {
            $existing = $this->em->getRepository(Term::class)->find($key);
            if (!$existing) {
                $term = new Term($institution, $key, $value);
                $this->em->persist($term);
            }
        }
        $this->em->flush();

        $i = 0;
        foreach ($allCourses as $courseData) {
            $existing = $this->em->getRepository(Course::class)->findOneBy([
                'lmsCourseId' => $courseData['id'],
                'institution' => $institution,
            ]);

            $professors = $courseData['teachers'];
            $professorNames = [];

            foreach ($professors as $professor) {
                $professorNames[] = $professor['display_name'];
            }

            if ($existing) {
                $course = $existing;
            } else {
                $course = new Course();
                $course->setLmsCourseId($courseData['id']);
                $course->setInstitution($institution);
                $course->setDirty(false);
            }

            $course->setTitle($courseData['name']);
            $course->setActive(true);
            $course->setCourseProfessors($professorNames);

            if ($courseData['account_id']) {
                $account = $this->em->getRepository(Account::class)->find($courseData['account_id']);
                $course->setAccount($account);
            }

            if ($courseData['term'] !== null) {
                $term = $this->em->getRepository(Term::class)->find($courseData['term']['id']);
                $course->setTerm($term);
            }

            $this->em->persist($course);

            if (++$i % $batchSize === 0) {
                $this->em->flush();
            }
        }
        $this->em->flush();

        return Command::SUCCESS;
    }
}
