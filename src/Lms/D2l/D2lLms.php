<?php

namespace App\Lms\D2l;

use App\Entity\ContentItem;
use App\Entity\Course;
use App\Entity\FileItem;
use App\Entity\Institution;
use App\Entity\User;
use App\Lms\LmsInterface;

class D2lLms implements LmsInterface {

    public function __construct()
    {
        
    }

    public function getId() 
    {
        return 'd2l';
    }

    public function testApiConnection(User $user)
    {
        return true;
    }

    public function updateCourseContent(Course $course, User $user)
    {
        return true;
    }
    public function updateCourseData(Course $course, User $user)
    {
        return true;
    }

    public function updateContentItem(ContentItem $contentItem)
    {
        return true;
    }

    public function updateFileItem(Course $course, $file) 
    {
        return true;
    }

    public function postContentItem(ContentItem $contentItem)
    {
        return true;
    }

    public function postFileItem(FileItem $file)
    {
        return true;
    }

    public function getOauthUri(Institution $institution) 
    {
        return '';
    }

    protected function getScopes()
    {
        $scopes = [
            '*:*'
        ];

        return implode(' ', $scopes);
    }
}