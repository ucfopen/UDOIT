<?php

namespace App\DataFixtures;

use App\Entity\ContentItem;
use App\Entity\Course;
use App\Entity\Institution;
use App\Entity\Issue;
use App\Entity\Report;
use App\Entity\User;
use DateTime;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    private $manager;
    private $institutions = [];
    private $users = [];
    private $courses = [];
    private $reports = [];
    private $contentItems = [];
    private $issues = [];

    public function load(ObjectManager $manager)
    {
        $this->manager = $manager;

        $this->loadInstitutions();
        $this->loadUsers();
        $this->loadCourses();
        $this->loadContentItems();
        $this->loadReports();
        $this->loadIssues();
        $this->loadQueueItems();
        
        $manager->flush();
    }

    private function loadInstitutions()
    {
        $inst1 = new Institution();
        $inst1->setTitle('Cidi Labs Test Account');
        $inst1->setLmsDomain("cidilabs.instructure.com");
        $inst1->setLmsId('canvas');
        $inst1->setLmsAccountId('608');
        $inst1->setConsumerKey("cidilabs.app");
        $inst1->setSharedSecret("udoit5c5395996a388");
        $inst1->setDeveloperId("84530000000000016");
        $inst1->setDeveloperKey('EufAkQwGdFgeLaFHlcggrF8WaVfeNH6IreasFYVd8Pu1Z5vyLdDUwgZ4FlwWuBy0');
        $inst1->setCreated(new DateTime('now'));
        $inst1->setStatus(1);
        $inst1->setVanityUrl("canvas.cidilabs.com");
        
        $this->manager->persist($inst1);
        $this->institutions[] = $inst1;

        for ($i = 0; $i < 10; $i++) {
            $inst = new Institution();
            $randNum = rand(1, 1000);

            $inst->setTitle('Institution #' . $i);
            $inst->setLmsDomain("cidilabs{$i}.instructure.com");
            $inst->setLmsId('canvas');
            $inst->setLmsAccountId($randNum);
            $inst->setConsumerKey("cidi.app.{$randNum}");
            $inst->setSharedSecret("cidisecret{$randNum}");
            $inst->setDeveloperId("8453000000000000{$randNum}");
            $inst->setDeveloperKey('1234567890123456789012345678901234567890');
            $inst->setCreated(new DateTime('now'));
            $inst->setStatus(1);
            $inst->setVanityUrl("canvas{$i}.cidilabs.com");

            $this->manager->persist($inst);
            $this->institutions[] = $inst;
        }
        echo sprintf("\tLoaded %s institutions into database.\n", sizeof($this->institutions));
        $this->manager->flush();
    }

    private function loadUsers()
    {
        $inst = reset($this->institutions);
        $user = new User();
        $lmsUserId = 2027;
        $domain = $inst->getLmsDomain();
        $user->setLmsUserId($lmsUserId);
        $user->setInstitution($inst);
        $user->setUsername("{$domain}||{$lmsUserId}");
        $user->setApiKey('8453~K11OechHKuWe99oEtN1Q22w1qCnrJJEEF5K0BETcshwVVTMA1Hv4iMRRszUcswPJ');
        $user->setRefreshToken('8453~1lptr9pGbHwDOAum048TfOwim90CsnuaRZcHndINUXgbDoUmqxha6Lw4NKrdhOY7');
        $user->setCreated(new \DateTime('now'));
        $user->setLastLogin(new \DateTime('now'));

        $this->manager->persist($user);
        $this->users[] = $user;

        foreach ($this->institutions as $inst) {
            for ($i = 0; $i < 3; $i++) {
                $user = new User();
                $lmsUserId = rand(1, 1000);
                $domain = $inst->getLmsDomain();
                $user->setLmsUserId($lmsUserId);
                $user->setInstitution($inst);
                $user->setUsername("{$domain}||{$lmsUserId}");
                $user->setApiKey('1234567890123456789012345678901234567890');
                $user->setRefreshToken('8453~1lptr9pGbHwDOAum048TfOwim90CsnuaRZcHndINUXgbDoUmqxha6Lw4NKrdhOY7');
                $user->setCreated(new \DateTime('now'));
                $user->setLastLogin(new \DateTime('now'));

                $this->manager->persist($user);
                $this->users[] = $user;
            }
        }
        echo sprintf("\tLoaded %s users into database.\n", sizeof($this->users));
        $this->manager->flush();
    }

    private function loadCourses()
    {
        foreach ($this->institutions as $inst) {
            $courseCount = rand(3, 8);
            for ($i = 0; $i < $courseCount; $i++) {
                $course = new Course();
                $course->setTitle('Course #' . $i);
                $course->setInstitution($inst);
                $course->setLmsAccountId(rand(1, 100));
                $course->setLmsCourseId(rand(100, 1000));
                $course->setLastUpdated(new \DateTime());

                $this->manager->persist($course);
                $this->courses[] = $course;
            }
        }
        echo sprintf("\tLoaded %s courses into database.\n", sizeof($this->courses));
        $this->manager->flush();
    }

    private function loadContentItems()
    {
        $contentTypes = ['assignment', 'quiz', 'page', 'announcement', 'module'];

        foreach ($this->courses as $course) {
            foreach ($contentTypes as $type) {
                $contentCount = rand(0, 8);
                for ($i = 0; $i < $contentCount; $i++) {
                    $item = new ContentItem();
                    $item->setCourse($course);
                    $item->setContentType($type);
                    $item->setLmsContentId(rand(1000,10000));
                    $item->setUpdated(new \DateTime());
                    $item->setActive(true);
                    $item->setTitle($type . " " . $i);

                    $this->manager->persist($item);
                    $this->contentItems[] = $item;
                }
            }
            $this->manager->flush();
        }
        echo sprintf("\tLoaded %s content items into database.\n", sizeof($this->contentItems));
    }

    private function loadReports() {
        foreach($this->courses as $course) {
            $reportCount = rand(1, 10);
            for($i = 0; $i < $reportCount; $i++) {
                $report = new Report();
                $report->setCourse($course);
                $report->setErrors(0);
                $report->setSuggestions(0);
                $report->setSuggestions(0);
                $report->setCreated(date_sub(new DateTime(),
                    date_interval_create_from_date_string($i . " days")));
                if($i === 0) {
                    $report->setReady(false);
                }
                else {
                    $report->setReady(true);
                }

                $this->manager->persist($report);
                $this->reports[] = $report;
            }
        }
        echo sprintf("\tLoaded %s reports into database.\n", sizeof($this->reports));
        $this->manager->flush();
    }


    private function loadIssues() {
        $rules = [
            'imgAltIsDifferent',
            'tableComplexHasSummary',
            'tableSummaryIsEmpty',
            'tableLayoutHasNoSummary',
            'boldIsNotUsed',
            'iIsNotUsed',
            'basefontIsNotUsed',
            'fontIsNotUsed',
            'bodyColorContrast',
        ];
        foreach($this->courses as $course) {
            foreach($course->getContentItems() as $contentItem) {
                foreach($course->getReports() as $report) {
                    $issueCount = rand(0, 4);
                    for ($i = 0; $i < $issueCount; $i++) {
                        $issue = new Issue();
                        $issue->setContentItem($contentItem);
                        $issue->setScanRuleId(rand(0, 8));
                        $issue->setHtml('<div>HTML goes here</div>');
                        $type = "";
                        if ($i % 2) {
                            $type = "error";
                        } else {
                            $type = "suggestion";
                        }
                        $issue->setType($type);
                        $issue->setStatus(0);
                        $issue->addReport($report);
                        if($type == "error") {
                            $reportErrorCount = $report->getErrors();
                            $report->setErrors($reportErrorCount + 1);
                        } else {
                            $reportSuggestionCount = $report->getSuggestions();
                            $report->setSuggestions($reportSuggestionCount + 1);
                        }

                        $this->manager->persist($issue);
                        $this->issues[] = $issue;
                    }
                }
            }
            $this->manager->flush();
        }
        echo sprintf("\tLoaded %s issues into database.\n", sizeof($this->issues));
    }



    private function loadQueueItems()
    {

    }
}
