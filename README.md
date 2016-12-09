[![Build Status](https://travis-ci.org/ucfopen/UDOIT.svg?branch=master)](https://travis-ci.org/ucfopen/UDOIT)
[![Join UCF Open Slack Discussions](https://ucf-open-slackin.herokuapp.com/badge.svg)](https://ucf-open-slackin.herokuapp.com/)

# Universal Design Online content Inspection Tool
UDOIT enables faculty to identify accessibility issues in Canvas by Instructure. Scan a course, generate reports, and provide resources to address common accessibility issues.

## Licenses
Please see [UDOIT_Release.pdf](UDOIT_Release.pdf) (distributed with the source code) for more information about licensing.

### UDOIT
> Copyright (C) 2014 University of Central Florida, created by Jacob Bates, Eric Colon, Fenel Joseph, and Emily Sachs.

> This program is free software: you can redistribute it and/or modify
> it under the terms of the GNU General Public License as published by
> the Free Software Foundation, either version 3 of the License, or
> (at your option) any later version.

> This program is distributed in the hope that it will be useful,
> but WITHOUT ANY WARRANTY; without even the implied warranty of
> MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
> GNU General Public License for more details.

> You should have received a copy of the GNU General Public License
> along with this program.  If not, see <http://www.gnu.org/licenses/>.

> Primary Contact:  Jacob Bates <jacob.bates@ucf.edu>

### Quail
UDOIT uses the [QUAIL PHP library](https://code.google.com/p/quail-lib/), which has been heavily customized to suit the needs of UDOIT. This library requires distribution of tools developed with their library under the [GNU General Public License version 3](http://www.gnu.org/licenses/gpl.html)

# Installing UDOIT
UDOIT can be installed on your own existing servers, but we've also configured an easy install to a free Heroku server.

Heroku instructions can be found in [HEROKU.md](HEROKU.md).

## System Requirements
* Apache or Nginx webserver
* PHP 5.4, 5.5, or 5.6 (some users have modified the code to work on 5.3)
* Bower
* MySQL or PostgreSQL

If you're using PHP 5.3:

* Convert all empty array initializations from using the newer `[]` syntax to use the older `array()` syntax.
* If you have `short_open_tag` disabled, you'll need to change all `<?=` to `<?php echo`

## Installing Bower Dependencies
[Bower](http://bower.io/) is used to install JavaScript dependencies. Composer automatically runs Bower during install in the next step, so install Bower before continuing.

> Currently there is only one bower library installed. You can also install manually by cloning [JSColor](https://github.com/callumacrae/JSColor) library into `assets/js/vendor/JSColor/`.

## Installing Composer Dependencies
UDOIT uses [Composer](https://getcomposer.org/) to install PHP dependencies. So `cd` into your UDOIT directory and run this command before anything else:

```
$ php composer.phar install
```

The libraries (other then Quail) that we rely on can be found in `bower.json` and `composer.json`.

Please refer to the documentation for these three libraries for additional information.

## Report Storage
Make sure the `reports` directory in the root of UDOIT is *writable by your webserver*.  UDOIT saves generated reports here for easy retrieval.  You may have to change the user, group, or permissions to get this working (sorry we can't be more specific, it varies greatly depending on your environment).

## Installing Database Tables
There are only two tables required to run UDOIT.

The **MySQL** tables are shown below. PostgreSQL table definitions can be found in the [Heroku Install Instructions](HEROKU.md)

You need to create them using the snippets below:

### Reports Table

```sql
/* MySQL - see Heroku instructions for PostgreSQL */
CREATE TABLE `reports` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `course_id` int(10) unsigned NOT NULL,
  `file_path` text NOT NULL,
  `date_run` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `errors` int(10) unsigned NOT NULL,
  `suggestions` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
```

### Users Table

```sql
/* MySQL - see Heroku instructions for PostgreSQL */
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL,
  `api_key` varchar(255) NOT NULL,
  `date_created` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
```


# Configuration and Setup
Make a copy of `config/localConfig.template.php`, rename it to `localConfig.php`.

## Canvas API
Please refer to the [Canvas API Policy](http://www.canvaslms.com/policies/api-policy) before using this application, as it makes heavy use of the Canvas API.

Edit `config/localConfig.php`:

* `$consumer_key`: A consumer key you make up.  Used when installing the LTI in Canvas.
* `$shared_secret`: The shared secret you make up.  Used when installing the LTI in Canvas.

## Canvas Oauth2
UDOIT uses Oauth2 to take actions on behalf of the user, you'll need to [sign up for a developer key](https://docs.google.com/forms/d/1C5vOpWHAAl-cltj2944-NM0w16AiCvKQFJae3euwwM8/viewform)

Edit `config/localConfig.php`:

* `$oauth2_id`: The Client_ID Instructure gives you
* `$oauth2_key`: The Secret Instructure gives you
* `$oauth2_uri`: The "Oauth2 Redirect URI" you provided Instructure.  This is the URI of the `auth2response.php` file in the UDOIT directory.

## Database Config
Edit `config/localConfig.php`:

* `$db_type` - default to 'mysql', also supports 'pgsql'
* `$db_host` - the host or ip address of your database server, typically 'localhost'
* `$db_port` - the database server's port, MySQL's default is '3306'
* `$db_user` - database user that has access to your tables
* `$db_password` - the database user's password
* `$db_name` -  The database name that contains the tables
* `$db_user_table` - Default is 'users', no change needed if you used the sql above to create your tables
* `$db_reports_table`: - Default is 'reports', no change needed if you used the sql above to create your tables

## Installing the LTI in Canvas
Log into Canvas to add UDOIT:

1. Under **Configuration Type**, choose **By URL**.
2. In the **Name** field, enter `UDOIT`.
3. In the **Consumer Key** field, copy the value from `$consumer_key` from `config/localConfig.php`
4. In the **Shared Secret** field, copy the value from `$shared_secret` from `config/localConfig.php`
5. In the **Config URL** field, paste the **FULL URL** that points to `udoit.xml.php`. **See LTI Config URL Notes below**.
6. Finish by clicking **Submit**.

### LTI Config URL Notes
The URL of your UDOIT LTI config depends on your webserver install.  The file is located the `public` directory. The examples below should give you are some possible values:

* `http://<DOMAIN>/udoit.xml.php`
* `http://<DOMAIN>/public/udoit.xml.php`
* `http://<DOMAIN>/udoit/udoit.xml.php`
* `http://<DOMAIN>/udoit/public/udoit.xml.php`

# Developing and Testing

For quick local development, set `$UDOIT_ENV = ENV_DEV;` in `config/localConfig.php`.  This flag disables authentication and allows you to quickly see a sample test report for most template, js, and css development. Use this along with the quick dev server below.

## Simple Dev Server

From the public directory, run:

```
$ php -S localhost:8000
```

Then open [http://localhost:8000 in a browser](http://localhost:8000).

## Running Tests
We use phpunit to run unit tests on UDOIT.  To run the tests, type the following command:

```
$ ./vendor/phpunit/phpunit/phpunit
```

## Contributors
* [Jacob Bates](https://github.com/bagofarms)
* [Eric Colon](https://github.com/accell)
* [Fenel Joseph](https://github.com/feneljoseph)
* [Emily Sachs](https://github.com/emilysachs)
* [Ian Turgeon](https://github.com/iturgeon)
* Karen Tinsley-Kim
* [Kevin Baugh](https://github.com/loraxx753)
* Joe Fauvel
* John Raible
* Kathleen Bastedo
* Nancy Swenson