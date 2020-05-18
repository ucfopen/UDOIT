<?php

namespace App\DataFixtures;

use App\Entity\ContentItem;
use App\Entity\Course;
use App\Entity\Institution;
use App\Entity\Issue;
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
    private $contentItems = [];

    public function load(ObjectManager $manager)
    {
        $this->manager = $manager;

        $this->loadInstitutions();
        $this->loadUsers();
        $this->loadCourses();
        $this->loadContentItems();
        $this->loadIssues();
        $this->loadQueueItems();
        
        $manager->flush();
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
    }

    private function loadCourses()
    {
        foreach ($this->institutions as $inst) {
            for ($i = 0; $i < 4; $i++) {
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
    }

    private function loadContentItems()
    {
        $contentTypes = ['assignment', 'quiz', 'page', 'announcement', 'module'];

        foreach ($this->courses as $course) {
            foreach ($contentTypes as $type) {
                for ($i = 0; $i < 4; $i++) {
                    $item = new ContentItem();
                    $item->setCourse($course);
                    $item->setContentType($type);
                    $item->setLmsContentId(rand(1000,10000));
                    $item->setUpdated(new \DateTime());
                    
                    $this->manager->persist($item);
                    $this->contentItems[] = $item;
                }
            }
        }
    }

    private function loadIssues()
    {
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
        foreach ($this->contentItems as $item) {
            $issueCount = rand(0, 15);
            for ($i = 0; $i < $issueCount; $i++) {
                $issue = new Issue();
                $issue->setContentItem($item);
                $issue->setScanRuleId(rand(0,8));
                $issue->setHtml('<div>HTML goes here</div>');
                $issue->setType('what does this field do?');
                $issue->setStatus(0);

                $this->manager->persist($issue);
            }
        }
    }

    private function loadQueueItems()
    {

    }
}
