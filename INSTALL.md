# Installing UDOIT
UDOIT can be installed on your own existing servers with the following instructions. UDOIT is also available as a hosted and maintained product by [Cidi Labs](https://cidilabs.com). UDOIT is built using the [PHP Symfony Framework](https://symfony.com).

## System Requirements
* Apache or Nginx webserver
* PHP 7.4, 8.0
* MySQL, MariaDB or PostgreSQL
* Git (If you are using The Git Method below) or if you plan on contributing to UDOIT
* Node v14+
* Yarn

## Source Code
We strongly recommend source code should be managed through Git. The benefit of this method is that you can update an existing installation of UDOIT by simply using git pull. It also lets you roll back to previous versions if needed. Follow these steps:

* Install Git on your server
* Navigate to the directory on your server where UDOIT will live
* Run `git clone git@github.com:ucfopen/UDOIT.git . ` (The . is important. It tells Git to download the files to the current directory.)

## Docker
We provide a fast and simple way of setting up a local UDOIT instance through the use of docker containers. By default the application is set up to create a MySQL database container, but if you wish to create a postgres container instead you can do so by modifying the file `docker-compose.yml`. To set up the docker containers, simply run the command:

    docker-compose up --build

Once the containers are up and running, you can access the php container by calling the command:

    docker exec -it udoit_php_1 /bin/bash

You can access the database container by calling the command:

    docker exec -it udoit_db_1 /bin/bash

Once you are finished, you can shut it down with the following command:

    docker-compose down

Once you have set up the containers in this way, you will still need to follow the rest of the instructions in this document.

## Configuring your Web Server
The details of configuring a web server with PHP are out of the scope of this README. You should configure your web server to point to UDOIT's "public" folder as the web root folder. Doing this will hide the configuration and source files so that they are not web accessible. It will also clean up your URL structure so that you don't need to include the "public" folder in any of the URLs to UDOIT.

If you are setting up a local UDOIT instance through Docker, you can simplify this step and quickly setup a server by calling the following command from within the php container:

    symfony server:ca:install

Followed by the following command:

    symfony serve -d

It is important to note that most browsers will automatically block unsigned certificates, and the tool might fail to load with the message that the website might be down or have moved to a new location. If this happens to you after going through the rest of the instructions, you can bypass this warning by opening the specified url in a new tab, granting the browser permission to access the webpage, and then going back to where the UDOIT tool has been integrated and refreshing the page.

## Installing Composer Dependencies
UDOIT uses Composer to install PHP dependencies. Installing Composer is out of the scope of this README, but here is some documentation on [Composer Installation](https://getcomposer.org/doc/00-intro.md#introduction).

Assuming you have Composer installed, navigate to your UDOIT directory in the CLI and run this command:

    php composer.phar install --no-dev

## .ENV Setup
UDOIT uses a `.env` file for storing configuration. Local configuration such as database information and URLs should be stored in a `.env.local` file that is NOT tracked in Git.
* Rename the file `.env.local.example` to `.env.local`.
* Add your database information to this `.env.local` file.
* Add the `BASE_URL`, which is the full URL to reach the `public` folder of UDOIT. (i.e. https://udoit3.ciditools.com)


### Database Setup
While UDOIT is configured to use MySQL or MariaDB by default, Symfony can be configured to work with other databases as well. See the Symfony documentation for details.

You can create your database manually, or use `Symfony` to create the database with this command:

    php bin/console doctrine:database:create

Once the database is created you can populate the database with the following command:

    php bin/console doctrine:migrations:migrate

Tip: If you are getting errors when running the migration script try the following:

    php bin/console doctrine:schema:update --force

If you are operating in a production environment you will need to generate the doctrine proxy classes by running the following command:

    php bin/console cache:warmup --env=prod

## Javascript
UDOIT uses `node` and `yarn` to compile the javascript. Instructions for installing Node and Yarn are out of the scope of this README. TO install the javascript dependencies run the command:

    yarn install

To build the javascript files for production, run the command:

    yarn build

## Testing Your Setup
Once you have completed the steps above you will want to test your setup. Unfortunately, UDOIT is an LTI tool that can only fully run within the LMS. You will need to complete the steps in the INSTALL_CANVAS.md or INSTALL_D2L.md to test UDOIT fully.

However, UDOIT does have one URL that is publicly available outside of the LMS. To test your server setup point your browser to:

    <BASE_URL>/lti/config

For example, if you are setting this up on your local computer it may look like:

    https://udoit.local/lti/config

## Configuring Your LMS
You will need to complete the steps in the INSTALL_CANVAS.md or INSTALL_D2L.md to configure UDOIT to work within your LMS.
