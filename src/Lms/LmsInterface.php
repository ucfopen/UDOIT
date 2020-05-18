<?php

namespace App\Lms;

interface LmsInterface {
    public function getId();
    public function getLmsDomain();
    public function getLmsCourseId();
    public function getLmsUserId();
    public function getLmsAccountId();
    public function getLmsRootAccountId();
    public function getUserProfile();
    public function getCourseContentUrls($courseId);
}