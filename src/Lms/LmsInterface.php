<?php

namespace App\Lms;

use App\Entity\Course;

interface LmsInterface {
    public function getId();
    public function getLmsDomain();
    public function getLmsCourseId();
    public function getLmsUserId();
    public function getLmsAccountId();
    public function getLmsRootAccountId();
    public function testApiConnection();
    public function getCourseContentUrls($courseId);
    public function getCourseContent(Course $course);
}