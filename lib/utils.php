<?php
/**
*   Copyright (C) 2014 University of Central Florida, created by Jacob Bates, Eric Colon, Fenel Joseph, and Emily Sachs.
*
*   This program is free software: you can redistribute it and/or modify
*   it under the terms of the GNU General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.
*
*   This program is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU General Public License for more details.
*
*   You should have received a copy of the GNU General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
*   Primary Author Contact:  Jacob Bates <jacob.bates@ucf.edu>
*/
class Utils
{
    public static $regex = array(
        '@youtube\.com/embed/([^"\& ]+)@i',
        '@youtube\.com/v/([^"\& ]+)@i',
        '@youtube\.com/watch\?v=([^"\& ]+)@i',
        '@youtube\.com/\?v=([^"\& ]+)@i',
        '@youtu\.be/([^"\& ]+)@i',
        '@youtu\.be/v/([^"\& ]+)@i',
        '@youtu\.be/watch\?v=([^"\& ]+)@i',
        '@youtu\.be/\?v=([^"\& ]+)@i',
    );

    public static function getYouTubeId($link_url)
    {
        $matches = null;
        foreach(static::$regex as $pattern) {
            if(preg_match($pattern, $link_url, $matches)) {
                return $matches[1];
            }
        }
        return null;
    }

    public static function exitWithPageError($error){
        $templates = new League\Plates\Engine('../templates');
        echo $templates->render('error', ['error' => $error]);
        error_log($error);
        exit();
    }

    public static function exitWithPartialError($error){
        $templates = new League\Plates\Engine('../templates');
        echo $templates->render('partials/error', ['error' => $error]);
        error_log($error);
        exit();
    }

}
