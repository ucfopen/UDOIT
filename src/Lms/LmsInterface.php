<?php

namespace App\Lms;

use App\Entity\ContentItem;
use App\Entity\Course;
use App\Entity\FileItem;
use App\Entity\Registration;
use App\Entity\User;
use App\Entity\UserSession;

interface LmsInterface {
    public function getId();
    public function testApiConnection(User $user);
    public function updateCourseContent(Course $course, User $user);
    public function updateCourseData(Course $course, User $user);
    public function updateFileItem(Course $course, $file);
    public function updateContentItem(ContentItem $contentItem);
    public function postContentItem(ContentItem $contentItem);
    public function postFileItem(FileItem $file, string $newFileName);
    public function getOauthUri(Registration $registration, UserSession $session);
    public function getAccountData(User $user, $accountId);
    public function getCourseUrl(Course $course, User $user);
    public function getCourseSections(Course $course, User $user);
    public function getOauthTokenUri(Registration $registration);
    public function saveTokenToSession($token);
    public function getContentTypes();
}