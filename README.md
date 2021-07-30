[![Build Status](https://travis-ci.org/ucfopen/UDOIT.svg?branch=master)](https://travis-ci.org/ucfopen/UDOIT)
[![Join UCF Open Slack Discussions](https://ucf-open-slackin.herokuapp.com/badge.svg)](https://ucf-open-slackin.herokuapp.com/)

# Universal Design Online content Inspection Tool

Note: This is the "Classic" version of UDOIT.  It is no longer in active development. You can find the latest version of UDOIT in the [main branch](https://github.com/ucfopen/UDOIT/tree/main).

UDOIT enables faculty to identify accessibility issues in Canvas by Instructure. Scan a course, generate reports, and provide resources to address common accessibility issues.

In late 2013, the proposal submitted by UCF's Center for Distributed Learning won Instructure, Inc.’s Canvas Grant in the higher education category. The $10,000 grant was awarded to UCF – CDL to take an existing tool and further develop this solution into what is now known as UDOIT.

## What Does UDOIT Look For?

### Errors

| Internal Name | What condition triggers it to produce an error in the resulting report |
| ------------- | ---------------------------------------------------------------------- |
| imgAltIsDifferent | If the attribute is the same as the file name. |
| imgAltIsTooLong | If the alt attribute is too long (configurable, default 120 characters). |
| imgAltNotPlaceHolder | If the alt attribute is one of these strings:  'nbsp', '&amp;nbsp;', 'spacer', 'image', 'img', 'photo' |
| imgAltNotEmptyInAnchor | Triggers if the alt attribute is empty on an image in an anchor tag. |
| imgHasLongDesc | If the image has an alt attribute and long description that contain the exact same text. |
| imgHasAltDeco | If the image is marked as decorative, but does not have an empty alt attribute. |
| objectMustContainText | If an object tag does not contain a text equivalent. |
| embedHasAssociatedNoEmbed | If an embed tag does not have a text equivalent contained in a noembed tag. |
| tableDataShouldHaveTh | If a table does not have any table header (th) tags. |
| tableThShouldHaveScope | If a table header (th) tag does not have a scope attribute that is set to "row" or "col". |
| basefontIsNotUsed | If a "basefont" tag exists in the page. |
| fontIsNotUsed | If a "font" tag exists in the page. |
| blinkIsNotUsed | If a "blink" tag exists in the page. |
| marqueeIsNotUsed | If a "marquee" tag exists in the page. |
| aMustContainText | If a link does not contain any text. |
| cssTextHasContrast | If text has less than a 4.5:1 contrast ratio between the foreground and background. |
| headersHaveText | If a header tag does not contain text. |
| videoProvidesCaptions | If a video tag does not have a caption track tag. |
| videosEmbeddedOrLinkedNeedCaptions | If a YouTube or Vimeo video does not have human-generated captions. |
| brokenLink | If a link is broken |
| headingLevelSkipped | If a heading level has been skipped |
| documentReadingDirection | If text that is in Hebrew, Arabic, or Dhivehi/Maldivian does not have the dir attribute set to rtl |

### Suggestions

| Internal Name | What condition triggers it to produce a suggestion in the resulting report |
| ------------- | -------------------------------------------------------------------------- |
| imgHasAlt | If an image does not have an alt attribute at all |
| inputImageNotDecorative | If an input of type "image" exists on the page. |
| contentTooLong | If the page is over 5000 characters long (configurable). |
| aLinksToSoundFilesNeedTranscripts | If a link to a sound file exists on the page. |
| aLinksToMultiMediaRequireTranscript | If a link to a video file exists on the page. |
| objectShouldHaveLongDescription | If an "object" tag exists on the page. |
| objectTagDetected | If an "object" tag exists on the page. |
| pNotUsedAsHeader | If a paragraph tag that is not the child of a table is bolded, underlined, or has a font tag wrapped around it.  This catches a bolded line of text being used instead of a heading. |
| preShouldNotBeUsedForTabularLayout | If a "pre" tag contains a carriage return. |
| objectInterfaceIsAccessible | If an "object" tag exists in the page. |
| imgGifNoFlicker | If a GIF image contains any frame delays at all, which might cause it to flicker. |
| aSuspiciousLinkText | If a link consists entirely of the following strings: 'click here', 'click', 'more', 'here'. |
| noHeadings | If a page does not contain any headings. |
| cssTextStyleEmphasize | If colored text is not emphasized as bold or italicized. |
| videoEmbedChecked | If an iframe, link, or object tag linking to a Dailymotion video exists on the page. |
| videoCaptionsAreCorrectLanguage | If a YouTube or Vimeo video has human-generated captions, but they do not match the set language of the course. |
| tableHasFixedWidth | If a table or its cells have fixed width |
| videoUnlistedOrNotFound | If a video is unlisted or can not be found |
| redirectedLink | If a link is redirected |

## Awards

UDOIT has been recognized by the industry, heres a quick list of the awards it's won.

* 2017 - [WCET WOW Award](http://wcet.wiche.edu/wow2017)
* 2017 - [Prudential Productivity Award](http://www.floridataxwatch.org/Events/PrudentialProductivityAwards/2017Winners.aspx)
* 2017 - [Platinum IMS Global Learning Impact Award - Established Projects Category](https://www.imsglobal.org/article/ims-global-learning-consortium-announces-2017-award-winners)
* 2016 - [Campus Technology Innovators - Administration Category](https://campustechnology.com/innovators)
* 2015 - [Online Learning Consortium Effective Practice Award](https://onlinelearningconsortium.org/about/2015-olc-effective-practice-award-winners/)
* 2013 - [Instructure's Canvas Grant Award](https://www.canvaslms.com/canvasgrants/past-winners)

## Licenses
UDOIT is distributed under the [GNU GPL v3 license](LICENSE).

> Copyright (C) 2014 University of Central Florida, created by Jacob Bates, Eric Colon, Fenel Joseph, and Emily Sachs.
>
> This program is free software: you can redistribute it and/or modify
> it under the terms of the GNU General Public License as published by
> the Free Software Foundation, either version 3 of the License, or
> (at your option) any later version.
>
> This program is distributed in the hope that it will be useful,
> but WITHOUT ANY WARRANTY; without even the implied warranty of
> MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
> GNU General Public License for more details.
>
> You should have received a copy of the GNU General Public License
> along with this program.  If not, see <http://www.gnu.org/licenses/>.
>
> Primary Contact:  Jacob Bates <jacob.bates@ucf.edu>

UDOIT includes a modified [QUAIL library](https://code.google.com/p/quail-lib/). QUAIL requires derivitives to be distributed under the [GNU General Public License version 3](LICENSE)

UDOIT includes a [Composer](https://getcomposer.org) binary which is distributed under the [MIT license](https://github.com/composer/composer/blob/master/LICENSE)

# Installing UDOIT
UDOIT can be installed on your own existing servers, but we've also configured an easy install to a free Heroku server.

To start the Heroku deployment process, you can click the button below, please note, that although this button eliminates much of the installation complexity, there are still some configuration steps that need to be followed, those steps are outlined in the [HEROKU.md Readme](HEROKU.md).

<a href="https://heroku.com/deploy?template=https://github.com/ucfopen/UDOIT/tree/classic" title="Deploy to Heroku"><img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy to Heroku" title="Deploy to Heroku Button"></a>

## System Requirements
* Apache or Nginx webserver
* PHP 7.2, 7.3, 7.4, 8.0
  * [GD Graphics Library](http://php.net/manual/en/book.image.php)
* MySQL, MariaDB or PostgreSQL
* Git (If you are using [The Git Method](#the-git-method) below) or if you plan on contributing to UDOIT

## Downloading the Source Code
There are two methods of obtaining the source code and maintaining your installation of UDOIT:  Git Clone or Download ZIP.

### The Git Method
The benefit of this method is that you can update an existing installation of UDOIT by simply using `git pull`.  It also lets you roll back to previous versions if needed.  Follow these steps:
1. [Install Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) on your server
2. Navigate to the directory on your server where UDOIT will live
3. Run `git clone git@github.com:ucfopen/UDOIT.git .` (The ` .` is important.  It tells Git to download the files to the current directory.)

### The ZIP Method
This method is useful if you don't want to install Git on your server, but if you want to update UDOIT later, you will have to manually overwrite files with the new versions.  Follow these steps:
1. Go to the [releases page](https://github.com/ucfopen/UDOIT/releases).
2. The latest release is displayed first.  Scroll down to the Downloads area of that release.
3. Download either the .zip or .tar.gz, depending on which one you prefer.
4. Navigate to the directory on your server where UDOIT will live.
5. Unzip the archive.

## Configuring your Web Server
The details of configuring a web server with PHP are out of the scope of this README. However, there is an optional configuration step you can take to increase the security of your UDOIT installation.  Without any special web server configuration, UDOIT will work if you place it in the web root of your server.  You can even place it in a subfolder inside your web root with no issues.  If someone tries to access any of your configuration files via a URL, they will only see a blank page.

If you'd like to add a little extra security to your installation, you can configure your web server to point to UDOIT's "public" folder.  Doing this will hide the configuration files so that they are not web accessible.  It will also clean up your URL structure so that you don't need to include the "public" folder in any of the URLs to UDOIT.  See the [LTI Config URL Notes](#lti-config-url-notes) section of this README for examples.

## Installing Composer Dependencies
UDOIT uses [Composer](https://getcomposer.org/) to install PHP dependencies. So `cd` into your UDOIT directory and run this command before anything else:

```
$ php composer.phar install --no-dev
```

The libraries (other then Quail) that we rely on can be found in `composer.json`.

Please refer to the documentation for these three libraries for additional information.

## Folder permissions
After [Insalling Dependencies](#installing-composer-dependencies), the following directories need to be made writable by your webserver:
* `vendor/mpdf/mpdf/ttfontdata`
* `vendor/mpdf/mpdf/tmp`
* `public/reports`
* `config`

## Database Setup
UDOIT works with MySQL, MariaDB, or PostgreSQL

1. Create a database for UDOIT.
2. Create a user with access to your database
3. Give that user permission to ALTER tables. MySQL uses `GRANT` while Pg requires `OWNER`.

### Database Config
If `config/localConfig.php` doesn't exist, create it using a copy of the template:

```
$ cp config/localConfig.template.php config/localConfig.php
```

Edit `config/localConfig.php`:

* `$db_type` - use 'mysql' or 'pgsql'
* `$db_host` - the host or ip address of your database server, often 'localhost'
* `$db_port` - the database server's port, MySQL's default is '3306'
* `$db_user` - database user that has access to your tables
* `$db_password` - the database user's password
* `$db_name` -  The database name that contains the tables
* `$db_user_table` - Default is 'users', no change needed unless you change the table names
* `$db_reports_table`: - Default is 'reports', no change needed unless you change the table names
* `$db_job_queue_table`: - Default is 'job_queue', no change needed unless you change the table names

### Installing Database Tables

To create the required tables, run the creation script below.  You'll need to complete the db steps above first.

```
$ php composer.phar db-setup
```

The table schema can be found in [bin/db_create_tables.php](bin/db_create_tables.php)

## Configuration and Setup
If you didn't already make `config/localConfig.php` when you set up the database, do it now.

### Canvas API
Please refer to the [Canvas API Policy](http://www.canvaslms.com/policies/api-policy) before using this application, as it makes heavy use of the Canvas API.

### LTI Security
UDOIT uses the trust built into the LTI v1.1 specification to authorize usage from within your LMS.  LTI v1.1 requires a strong key and secret for this security process to work. You will need the key and secret when setting up the LTI tool in the LMS.

Edit `config/localConfig.php`:

* `$consumer_key`: A value you make up.
* `$shared_secret`: The value you make up.

### Canvas Oauth2
UDOIT uses Oauth2 to take actions on behalf of the user, so you'll need to ask your Canvas administrator to generate a Developer Key for you.  Here is the information you need to provide them:

* ***Key Name:*** Probably ***UDOIT*** or ***UDOIT Test*** for your test instance
* ***Owner Email:*** The email address of whoever is responsible for UDOIT at your institution
* ***Redirect URI:*** This is the URI of the `oauth2response.php` file in the UDOIT directory.
 * If you did a normal install into the web root of your server, it would be `https://www.example.com/public/oauth2response.php`. (Replace 'www.example.com' with the url of your UDOIT server.)
* ***Icon URL:*** The URL of the UDOIT icon.  This is `https://www.example.com/public/assets/img/udoit_icon.png`.  (Replace 'www.example.com' with the url of your UDOIT server.)

Your Canvas administrator will perform the following tasks:
1. Navigate to your institution's ***Account Admin panel*** in Canvas.
2. Click on the ***Developer Keys*** menu option.
3. Click the ***+ Developer Key*** button and select the ***API Key*** option.
4. Enter the data provided above into the form, leaving the ***Redirect URI (Legacy)*** and ***Vendor Code (LTI 2)*** fields blank.
5. (Optional) If you would like to Enforce Scopes on this developer key, which limits this Developer Key to only allow access to the functions UDOIT requires, enable the option and check the boxes outlined in the [Scoped Developer Keys](#scoped-developer-keys) section below.
6. Click ***Save Key***
7. Find the new Developer Key in the list, and send the values from the ***Details*** column to the person requesting the key.  The top value is the ***Oauth2 ID***, and the value revealed by clicking on the ***Show Key*** button is the ***Oauth2 Key***.

After you receive your Developer Key from your Canvas admin, edit the following variables in `config/localConfig.php`:

* `$oauth2_id`: The ***Oauth2 ID*** your Canvas admin gives you
* `$oauth2_key`: The ***Oauth2 Key*** your Canvas admin gives you
* `$oauth2_uri`: The ***Redirect URI*** you provided to your Canvas admin
* `$oauth2_enforce_scopes`: Set to ***true*** if you are using [Scoped Developer Keys](#scoped-developer-keys).

#### Scoped Developer Keys
If you'd like to use this option, you'll need set the following scopes for your developer key.
* Assignments
	* url:GET|/api/v1/courses/:course_id/assignments
	* url:GET|/api/v1/courses/:course_id/assignments/:id
	* url:PUT|/api/v1/courses/:course_id/assignments/:id
* Courses
	* url:PUT|/api/v1/courses/:id
	* url:GET|/api/v1/courses/:id
	* url:POST|/api/v1/courses/:course_id/files
* Discussion Topics
	* url:GET|/api/v1/courses/:course_id/discussion_topics
	* url:GET|/api/v1/courses/:course_id/discussion_topics/:topic_id
	* url:PUT|/api/v1/courses/:course_id/discussion_topics/:topic_id
* Files
	* url:GET|/api/v1/courses/:course_id/files
	* url:GET|/api/v1/courses/:course_id/folders/:id
	* url:GET|/api/v1/folders/:id/folders
	* url:GET|/api/v1/folders/:id/files
* Modules
	* url:GET|/api/v1/courses/:course_id/modules
	* url:GET|/api/v1/courses/:course_id/modules/:module_id/items
* Pages
	* url:GET|/api/v1/courses/:course_id/pages
	* url:GET|/api/v1/courses/:course_id/pages/:url
	* url:PUT|/api/v1/courses/:course_id/pages/:url
* Users
	* url:GET|/api/v1/users/:user_id/profile

### Google/YouTube API Key
To allow UDOIT to scan YouTube videos for closed captioning, you will need to create a YouTube Data API key.  Follow the instructions below:

1. Go to the [Google Developer Console](https://console.developers.google.com).
2. Create a project.
3. Enable ***YouTube Data API V3***
4. Create an ***API key*** credential.
5. Add the key to `config/localConfig.php` in the `define('GOOGLE_API_KEY', '');` statement.  For example, if your API key is `heythisisanapikey`, that line should look like `define('GOOGLE_API_KEY', 'heythisisanapikey');` when you're done.

If you do not provide a Google API key, a warning log will be recorded in `config/log.log` and all YouTube videos will be marked for manual inspection by the user.

### Vimeo API Key
To allow UDOIT to scan Vimeo videos for closed captioning, you will need to create a Vimeo API key. Follow the instructions below:

1. [Create a new App on Vimeo Developer API](https://developer.vimeo.com/apps/new?source=getting-started), please note you must have a Vimeo Developer account.
2. On your applications "Authentication" page, Generate a new Access Token.  (Select the `Public` and `Private` checkboxes for Scopes.)
3. Add the key to `config/localConfig.php` in the `define('VIMEO_API_KEY', '');` statement.  For example, if your API key is `heythisisanapikey`, that line should look like `define('VIMEO_API_KEY', 'heythisisanapikey');` when you're done.

If you do not provide a Vimeo API key, a warning log will be recorded in `config/log.log` and all Vimeo videos will be marked for manual inspection by the user.

### Google Analytics
If you would like to use Google Analytics for tracking usage of UDOIT, create a new tracking code and add it to `config/localConfig.php` in the `define('GA_TRACKING_CODE', '');` statement.  For example, if your tracking code is `UA-12345678-1`, that line should look like `define('GA_TRACKING_CODE', 'UA-12345678-1');` when you're done.

### Admin Panel
As of 2.5.0, the admin panel is still an experimental feature.  Consider it a first draft of what we'd like it to be.  It lets you view reports across your institution, generate statistics about reports and user growth, and administer user accounts.  This feature is disabled by default.  To enable it, change `$admin_panel_enabled` to `true`.

### Installing the LTI in Canvas
Log in to Canvas to add UDOIT:

1. You can install UDOIT at the sub-account level or the course level.  Either way, start by going to the **settings** area.
2. Click the **Apps** tab.
3. Click the **View App Configurations** button.
4. Click the **Add App** button.
5. Under **Configuration Type**, choose **By URL**.
6. In the **Name** field, enter `UDOIT`.
7. In the **Consumer Key** field, copy the value from `$consumer_key` from `config/localConfig.php`
8. In the **Shared Secret** field, copy the value from `$shared_secret` from `config/localConfig.php`
9. In the **Config URL** field, paste the **FULL URL** that points to `udoit.xml.php`. **See** LTI Config URL Notes.
10. Finish by clicking **Submit**.

#### LTI Config URL Notes
The URL of your UDOIT LTI config depends on your webserver install.  The file is located the `public` directory. The examples below should give you are some possible values:

* `https://<DOMAIN>/udoit.xml.php`
* `https://<DOMAIN>/public/udoit.xml.php`
* `https://<DOMAIN>/udoit/udoit.xml.php`
* `https://<DOMAIN>/udoit/public/udoit.xml.php`

## Upgrading UDOIT
The instructions below are general guidelines for upgrading your installation of UDOIT from one version to the next.  However, the release notes for a particular version might contain specific instructions for that version, and those instructions supersede the ones below.  Since the instructions differ depending on how you installed UDOIT, they are separated by these methods below.

### Heroku
Install a new instance of UDOIT using the [HEROKU.md Readme](HEROKU.md).  Then, swap the old one out with the new one in Canvas.

### Git
1. In the command line, make sure you're on the Master branch in the root of the UDOIT project.
2. Run `git pull`
3. Update your localConfig.php file to include any new fields that may be present in the localConfig.sample.php file
4. Run `php composer.phar install`
5. Run `php composer.phar migrate`

### ZIP
1. Download [the latest version](https://github.com/ucfopen/UDOIT/releases/latest).
2. Install it to a new directory on your server.
3. Copy the localConfig.sample.php file into localConfig.php.
4. Copy values from your old localConfig.php file into your new one, paying attention to any new fields you will need to fill.
5. Run `php composer.phar install`.

## Using UDOIT
For more information about how to use UDOIT you can read the [UDOIT User Guide](https://lor.instructure.com/resources/6bf40e8d2254428cbbfd213586c84406) created by Clemson University. It can be accessed by importing the pages as modules into an existing course. The guide covers the reasoning behind the accessibility issues that UDOIT addresses as well as detailed descriptions of how to interpret and interact with the results of a scan.

## General Troubleshooting
Navigate to your LTI install page at `https://<domain>/udoit.xml.php` where `domain` is the location of your install. This URL may also look like the list from the section above.

This page will display XML if all of the following are true:
* You are using the correct install domain
* The app file permissions are okay
* PHP is running
* The SSL certificate is working

Here's an example of a working LTI install page: [https://udoit.herokuapp.com/udoit.xml.php](https://udoit.herokuapp.com/udoit.xml.php)

Turn on PHP tracing on the server to view possible errors.

If you see an issue pertaining to `require_once(__DIR__.'/../vendor/autoload.php');` make sure you've run Composer to install all of the dependencies. In the root UDOIT folder on your server run:
```
$ php composer.phar install
```
If you get a warning about Bower not being found, you will need to install Bower on your server and run the above command again.

The `oauth2response.php` file generates an API key to gain access to the Canvas API.
If you suspect that there is an authentication problem, first try echoing or error logging the variable `$base_url` from this file to check the URL.

Whether hosted on your own server or on Heroku, the URL where UDOIT has been installed needs to be designated as an authorized domain for your Google/YouTube API keys.

If database migrations fail, make sure the database user has the ability to alter tables in your udoit database. Give that user permission to ALTER tables. MySQL uses `GRANT` while PostgreSQL requires `OWNER`.

## FAQs

### How do I get in touch with you if I have questions?
There are a few different ways you can get in touch with us, depending on what you're most comfortable with:
* [Canvas Community](https://community.canvaslms.com/groups/accessibility) - The easiest option is to comment on the blog post for your version of UDOIT.
* [Slack](https://ucf-open-slackin.herokuapp.com/) - We have channels for all of our open source projects, including UDOIT.
* Email - If you're more comfortable with email, you can contact me directly at [jacob.bates@ucf.edu](mailto:jacob.bates@ucf.edu).

### How much time will I have to spend maintaining UDOIT?
UDOIT should require little to no maintenance. It is up to your institution to choose when you update UDOIT to the latest release. UDOIT can be updated by running `git pull` on this repository.

### Does Heroku keep UDOIT updated?
The `Deploy to Heroku` button installs the latest release of UDOIT when clicked. Your Heroku instance will not be updated automatically when new updates are released. You can either:
* Use the command line to pull the latest version of UDOIT down to your Heroku instance using the [Heroku CLI](https://devcenter.heroku.com/articles/git)
* Fork UDOIT here on Github, [link that git repository to your Heroku instance](https://devcenter.heroku.com/articles/github-integration), and set up automatic updates that trigger whenever you update your forked version of UDOIT.

### Which ports will UDOIT need on my server?
* Allow inbound traffic from world to UDOIT on 80 and 443
* Allow outbound traffic from UDOIT to Canvas on 443

### Why am I recieving a "Due to LMS limitations, UDOIT is unable to scan this section." error?
When an institution installs UDOIT and uses a scoped developer key, certain features of the Canvas API are unavailable to UDOIT, including retrieving content from the Syllabus tool.  This limitation does not affect UDOIT installations that use a non-scoped developer key.  For more information, refer to the "Canvas API Includes" section of the <a href="https://canvas.instructure.com/doc/api/file.developer_keys.html">Canvas API Documentation</a>.

# Developing and Testing

For quick local development, set `$UDOIT_ENV = ENV_DEV;` in `config/localConfig.php`.  This flag disables authentication and allows you to quickly see a sample test report for most template, js, and css development. Use this along with the quick dev server below.

## Simple Dev Server

From the public directory, run:

```
$ php composer.phar start
```

Then open [http://localhost:8000 in a browser](http://localhost:8000).

## Docker

To setup the Docker environment, follow the steps outlined in the [DOCKER.md Readme](DOCKER.md).

## Running Tests
We use phpunit to run unit tests on UDOIT.  To run the tests, type the following command:

```
$ php composer.phar test
```

We included a Dockerfile, docker-compose.yml, and tests script to run your tests in a predictable environment.  To run tests using docker run this command:

```
$ php composer.phar docker-test
```

By default, we exclude functional tests that include external APIs.  If you would like to run those tests, run this command:

```
$ ./vendor/phpunit/phpunit/phpunit
```

## Contributors
<!--
Add contributors here and dont forget composer.json!)
(Please sort each group alphabetically)
-->

### Project Lead

* [Jacob Bates](https://github.com/bagofarms)

### Contributors

* [Cooper Fellows](https://github.com/cooperfellows)
* [Emily Sachs](https://github.com/emilysachs)
* [Eric Colon](https://github.com/accell)
* [Fenel Joseph](https://github.com/feneljoseph)
* [Ian Turgeon](https://github.com/iturgeon)
* Joe Fauvel
* [John Raible](https://github.com/rebelaide)
* [Kevin Baugh](https://github.com/loraxx753)
* [Sean Hernandez](https://github.com/seanlh)
* [Ethan Finlay](https://github.com/atarisafari)
* [Kenny G Perez](https://github.com/kennygperez)

### Special Thanks

* Karen Tinsley-Kim
* Kathleen Bastedo
* Nancy Swenson
