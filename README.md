# UDOIT Developer Guide

Installing and developing on UDOIT is actually quite easy, below is the documentation to help you get started!

## Installing
UDOIT uses [Composer](https://getcomposer.org/) to manage its dependencies, so `cd` into your UDOIT directory and run this command before anything else:

``` bash
$ php composer.phar update
```

## Configuration
Make a copy of `config/localConfig.template.php`, rename it to `localConfig.php`.

### Canvas API

`$base_url`This is the URL of your Canvas installation

`$consume_key` Your consumer developer key from Canvas

`$shared_secret` Your shared secret key from Canvas

### Database Config
These value of these vars should be obvious:

`$db_host`

`$db_user`

`$db_password`

`$db_name`

`$db_user_table`

`$db_reports_table`

## The Udoit class
This is the class which will scan a Canvas course's content and a return a UDOIT report if any problems are found.

### Properties

### Methods

#### buildReport()
#### generateReport()
#### getCourseContent()
#### parseLinks()

## The Ufixit class
This is the class which will fix problem content and upload it to a Canvas course.

### Properties

### Methods