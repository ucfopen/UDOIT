# UDOIT Developer Guide

Installing and developing on UDOIT is actually quite easy, below is the documentation to help you get started!

## Installing
UDOIT uses [Composer](https://getcomposer.org/) to manage its dependencies, so `cd` into your UDOIT directory and run this command before anything else:

```
$ php composer.phar update
```

## Configuration
Make a copy of `config/localConfig.template.php`, rename it to `localConfig.php`.

### Canvas API

`$base_url`
This is the URL of your Canvas installation

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
Iterates through selected content types to build the final report object.

#### generateReport()
This calls the Quail library to scan HTML and check it for accessibility problems.

#### getCourseContent()
Makes API calls to Canvas and retrieves HTML and other data from selected content types.

#### parseLinks()
Increments the current page number for either Files or Pages in the event that their results are paginated.

## The Ufixit class
This is the class which will fix problem content and upload it to a Canvas course.

### Properties

### Methods

#### fixAltText()
Adds the alt text value to the image that's missing it.

#### fixCss()
Replaces the old color/background value with the one chosen by the user.

#### fixTableHeaders()
Converts the first row, first column, or both into `th` elements - It gives them the proper `scope` value as well.

#### fixTableThScopes()
Adds the `col` or `row` attribute to any `th` elements without them.

#### getFile()
Gets a file from a Canvas course based on the `$start_id` parameter.

#### renameElement()
Renames an element to whatever name is specified in the `$name` parameter.

#### uploadFixedAssignments()
Fixes the HTML within assignments and uploads it back to the Canvas course.

#### uploadFixedDiscussions()
Fixes the HTML within discussions and announcements - they are of the same content type - and uploads it back to the Canvas course.

#### uploadFixedFiles()
Creates a temporary file, fixes the HTML within it, then uploads it back to the Canvas course.

#### uploadFixedPages()
Fixes the HTML within pages and uploads it back to the Canvas course.

#### uploadFixedSyllabus()
Fixes the HTML within the syllabus and uploads it back to the Canvas course.

## Lib files

### cached.php
This file is called when clicking the "View Old Reports" tab. It connects to the database using [PDO](http://php.net/manual/en/class.pdo.php), selects reports matching the course id, and outputs a table with the data.

### parseResults.php
This file decodes a a UDOIT report either from a JSON file or a JSON string (if not viewing a cached report). Then, the report HTML is echoed to be displayed to the user.

### parsePdf.php
This creates a PDF from the HTML of a UDOIT scan and allows the user to download it.

### process.php
The file is where all the magic happens, so to speak.

### progress.php
Increments a progress key in the global _SESSION variable that some AJAX in default.js talks to in order to track the progress of a UDOIT scan.