[![Join UCF Open Slack Discussions](https://ucf-open-slackin.herokuapp.com/badge.svg)](https://ucf-open-slackin.herokuapp.com/)
![Build Status](https://github.com/ucfopen/UDOIT/actions/workflows/udoit.yml/badge.svg)

# Universal Design Online content Inspection Tool
UDOIT enables faculty to identify accessibility issues in Canvas by Instructure. Scan a course, generate reports, and provide resources to address common accessibility issues.

UDOIT was originally developed by the University of Central Florida (UCF) in 2014. In 2020, UDOIT was in need of a code refresh and UCF partnered with Cidi Labs to rewrite UDOIT from the ground up.

## Prerequisites
 - PHP 7.4+
 - Symfony
 - Composer
 - Node v14
 - Yarn
 - MYSQL v5.7 / MariaDB

## Skills Needed for Installation
To manually complete this installation you will need the following skills:

* Web server configuration (Apache or Nginx)
* Command line familiarity
* MySQL familiarity
* LMS admin permissions

UDOIT is built using PHP, the Symfony framework, the React framework, the Instructure UI component library, and other open source libraries. However, knowledge of PHP or Javascript is _**NOT REQUIRED**_ for installation.

## Where to Start
1. Start the installation process by setting up UDOIT on your web server. Instructions are in [INSTALL.md](INSTALL.md).

2. Once UDOIT is running on your web server you need to configure your LMS. Instructions for the different LMS's are in `INSTALL_<LMS_NAME>.md`.

## Installing UDOIT on Heroku
UDOIT can be installed on your own existing servers, but we've also configured an easy install to a free Heroku server.

To start the Heroku deployment process, you can click the button below, please note, that although this button eliminates much of the installation complexity, there are still some configuration steps that need to be followed, those steps are outlined in the [HEROKU.md Readme](HEROKU.md).

<a href="https://heroku.com/deploy?template=https://github.com/ucfopen/UDOIT/tree/issue/570-heroku" title="Deploy to Heroku"><img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy to Heroku" title="Deploy to Heroku Button"></a>

## Contributing

Like any other open source project, UDOIT relies on contributions from the community to improve the tool.  If you are interested in contributing to UDOIT, follow the instructions in [CONTRIBUTING.md](CONTRIBUTING.md).

## Licenses
UDOIT is distributed under the GNU GPL v3 license.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.

Primary Contact: Jacob Bates (jacob.bates@ucf.edu)
