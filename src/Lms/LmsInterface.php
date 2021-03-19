<?php

namespace App\Lms;

use App\Entity\ContentItem;
use App\Entity\Course;
use App\Entity\FileItem;
use App\Entity\Institution;
use App\Entity\User;

interface LmsInterface {
    public function getId();
    public function testApiConnection(User $user);
    public function updateCourseContent(Course $course, User $user);
    public function updateCourseData(Course $course, User $user);
    public function updateFileItem(Course $course, $file);
    public function updateContentItem(ContentItem $contentItem);
    public function postContentItem(ContentItem $contentItem);
    public function postFileItem(FileItem $file);
    public function getOauthUri(Institution $institution);
    public function getAccountData(User $user, $accountId);
    public function getCourseUrl(Course $course, User $user);
    public function getLtiAuthUrl($params);
    public function getOauthTokenUri(Institution $institution);
    public function getKeysetUrl();
    public function saveTokenToSession($token);
    public function getContentTypes();
}