[![Join UCF Open Slack Discussions](https://badgen.net/badge/icon/ucfopen?icon=slack&label=slack)](https://dl.ucf.edu/join-ucfopen)
![Build Status](https://github.com/ucfopen/UDOIT/actions/workflows/udoit.yml/badge.svg)

# Universal Design Online content Inspection Tool
UDOIT enables faculty to identify accessibility issues in Canvas by Instructure. Scan a course, generate reports, and provide resources to address common accessibility issues.

UDOIT was originally developed by the University of Central Florida (UCF) in 2014. In 2020, UDOIT was in need of a code refresh and UCF partnered with Cidi Labs to rewrite UDOIT from the ground up.

## Prerequisites
 - PHP 8.1, 8.2
 - Symfony
 - Composer
 - Node v16 is supported; other versions may work
 - Yarn
 - MYSQL 5.7+ / MariaDB

## Skills Needed for Installation
To complete this installation you will need the following skills:

* Command line familiarity
* MySQL familiarity
* LMS admin permissions

UDOIT is built using PHP, the Symfony framework, the React framework, the Instructure UI component library, and other open source libraries. However, knowledge of PHP or Javascript is _**NOT REQUIRED**_ for installation.

## Where to Start
**Tip:** Join the [UCF Open Slack community](https://dl.ucf.edu/join-ucfopen).  They can help solve any issues you may encounter.

1. Start the installation process by setting up UDOIT. Instructions are in [INSTALL.md](INSTALL.md).

2. Once UDOIT is running on your web server you need to configure your LMS. Instructions for the different LMS's are in `INSTALL_<LMS_NAME>.md`.

## Installing UDOIT on Heroku
UDOIT can be installed on your own existing servers, but we've also configured an easy install to a Heroku server. Check out the [HEROKU.md Readme](HEROKU.md) for more information.

## Contributing

Like any other open source project, UDOIT relies on contributions from the community to improve the tool.  If you are interested in contributing to UDOIT, follow the instructions in [CONTRIBUTING.md](CONTRIBUTING.md).

## Licenses
UDOIT is distributed under the GNU GPL v3 license.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.

Primary Contact: Daniel Molares (dm@ucf.edu)

## Supported Languages
UDOIT currently offers support for both English (en) and Spanish (es). This can be configured either across the entire UDOIT instance or for a specific institution.
