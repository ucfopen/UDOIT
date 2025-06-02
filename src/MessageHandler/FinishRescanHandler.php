<?php

namespace App\MessageHandler;

use App\Message\FinishRescanMessage;
use App\Services\LmsFetchService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Console\Output\ConsoleOutput;
use App\Entity\Issue;

/**
 * Runs *once* per rescan: builds the final report and flips `$report->ready`
 * so the UI knows the scan is complete.
 */
#[AsMessageHandler]
final class FinishRescanHandler
{
    public function __construct(
        private LmsFetchService        $lmsFetch,
        private EntityManagerInterface $em,
    ) {}

    public function __invoke(FinishRescanMessage $msg): void
    {
        $course = $this->em->getRepository(\App\Entity\Course::class)->find($msg->getCourseId());
        $user   = $this->em->getRepository(\App\Entity\User::class)->find($msg->getUserId());

        if (!$course || !$user) {
            error_log(sprintf(
                'FinishRescanHandler: missing entities (course=%s, user=%s)',
                $msg->getCourseId(),
                $msg->getUserId()
            ));
            return;
        }

        try {
            $output = new ConsoleOutput();
            $report = $this->lmsFetch->updateReport($course, $user);
            // --------------------------------------------------------------
            // Build a flattened list of *all* issues for this course
            // --------------------------------------------------------------
            $issuesData = [];
            foreach ($course->getContentItems() as $ci) {
                foreach ($ci->getIssues() as $issue) {
                    $issuesData[] = [
                        'id'            => $issue->getId(),
                        'type'          => $issue->getType(),
                        'status'        => $issue->getStatus(),
                        'rule'          => $issue->getScanRuleId(),
                        'contentItemId' => $ci->getId(),
                        // Trim the raw HTML so the log stays readable
                        'html'          => mb_substr($issue->getHtml() ?? '', 0, 120) . '…',
                    ];
                }
            }

            $output->writeln(
                "Generated report summary:\n" .
                json_encode($report->toArray(), JSON_PRETTY_PRINT)
            );

            $output->writeln(
                "Full issue list (" . \count($issuesData) . " items):\n" .
                json_encode($issuesData, JSON_PRETTY_PRINT)
            );
            $report->setReady(true);
            $this->em->flush();

            $output->writeln(sprintf(
                'FinishRescanHandler: Finished scanning for user #%s',
                $user->getId()
            ));
        } catch (\Throwable $e) {
            error_log('FinishRescanHandler: '.$e->getMessage());
        }
    }
}
