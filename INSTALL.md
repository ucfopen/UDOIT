# Installing UDOIT
UDOIT can be installed on your own existing servers with the following instructions. UDOIT is also available as a hosted and maintained product by [Cidi Labs](https://cidilabs.com). UDOIT is built using the [PHP Symfony Framework](https://symfony.com).

## System Requirements
* Apache or Nginx webserver
* PHP 8.1+
* MySQL, MariaDB or PostgreSQL
* Git (If you are using The Git Method below) or if you plan on contributing to UDOIT
* Node v16 is supported; other versions may work
* Yarn

## Source Code
We strongly recommend source code should be managed through Git. The benefit of this method is that you can update an existing installation of UDOIT by simply using git pull. It also lets you roll back to previous versions if needed. Follow these steps:

* Install Git on your server
* Navigate to the directory on your server where UDOIT will live
* Run `git clone git@github.com:ucfopen/UDOIT.git . ` (The . is important. It tells Git to download the files to the current directory.)

## .ENV Setup
UDOIT uses a `.env.local` file for storing configuration variables. To create it:

1. Copy the file `.env.local.example` to `.env.local` by running
```
cp .env.local.example .env.local
```
2. Leave `APP_ENV` set to `prod`
> If you are setting up a development environment, set this to `dev` and follow the steps in [Installing Composer Dependencies](#installing-composer-dependencies) without the `--no-dev` flag to obtain all of the development packages.
3. Add your database information to thie `DATABASE_URL` variable.  The default value of `mysql://root:root@db:3306/udoit3` is suitable for running it on your local computer using Docker.
4. Modify the `BASE_URL` to match the URL of your instance of UDOIT.  The default value of `http://127.0.0.1:8000/udoit3` is suitable for running it on your local computer using Docker.
5. Set `APP_LMS` to the name of your LMS.
   * `canvas` if you are using the Canvas LMS.
   * `d2l` if you are using the D2l Brightspace LMS.
6. (Optional) You can change the default language for your entire UDOIT instance by adding the `DEFAULT_LANG` variable. Currently supported languages are English (`en`) and Spanish (`es`).
7. (Optional) If you are using UDOIT with a self-hosted instance of Canvas, you can add the `JWK_BASE_URL` variable and set it to the URL of your instance of Canvas. (Example: `JWK_BASE_URL="https://canvas.dev.myschool.edu"`)

## Docker
We provide a fast and simple way of setting up a local UDOIT instance through the use of Docker containers.

### 1. Install Docker
To set up the docker containers, you must first install [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/).

### (Option 1) 2. Use the existing containers
TODO: Use Shea's repo as the guide for this.

### (Option 2) 2. Build the Containers
If you prefer to build the containers yourself, or you are actively developing UDOIT and need to rebuild the containers to test your cahnges, run the following command from within the UDOIT directory:

    docker-compose -f docker-compose.nginx.yml up

### 3. Set up the Database
The first time you start the containers, you will need to set up the database to handle all the information UDOIT generates as it runs.  Run the following command:

    docker-compose -f docker-compose.nginx.yml run php php bin/console doctrine:migrations:migrate

> You will also need to run that command whenever you update to a new version of UDOIT.

### Stopping the Containers
If you ever want to stop the containers, you can do so with the following command:

    docker-compose -f docker-compose.nginx.yml down

> Skip to [Testing your Setup](#testing-your-setup) to continue.

## Manual Installation
If you prefer not to use Docker, the process is more complicated.

### Configuring your Web Server
The details of configuring a web server with PHP are out of the scope of this README. You should configure your web server to point to UDOIT's "public" folder as the web root folder. Doing this will hide the configuration and source files so that they are not web accessible. It will also clean up your URL structure so that you don't need to include the "public" folder in any of the URLs to UDOIT.

If you are using NGINX as your web server, you can use the `build/nginx/nginx.conf` file as a starting point.

### Installing Composer Dependencies
UDOIT uses Composer to install PHP dependencies. Follow the upstream documentation on [Composer Installation](https://getcomposer.org/download/) to install `composer.phar` into the project root, then run the following:

    php composer.phar install --no-dev

> Remove the `--no-dev` flag if you set `APP_ENV=dev` in your `.env.local` file.

### Database Setup
While UDOIT is configured to use MySQL or MariaDB by default, Symfony can be configured to work with other databases as well. See the Symfony documentation for details.

Use Symfony to create the database with this command:

    php bin/console doctrine:database:create

Once the database is created you can populate the database with the following command:

    php bin/console doctrine:migrations:migrate

Tip: If you are getting errors when running the migration script try the following:

    php bin/console doctrine:schema:update --force

If you are operating in a production environment you will need to generate the doctrine proxy classes by running the following command:

    php bin/console cache:warmup --env=prod

### JavaScript
UDOIT uses [node](https://nodejs.org) and [yarn](https://yarnpkg.com/) to compile the JavaScript. Install Node and Yarn on your system, then run:

    yarn install

To build the JavaScript files for production, run the command:

    yarn build

## Testing Your Setup
Once you have completed the steps above you will want to test your setup. Unfortunately, UDOIT is an LTI tool that can only fully run within the LMS. You will need to complete the steps in the [INSTALL_CANVAS.md](INSTALL_CANVAS.md) or [INSTALL_D2L.md](INSTALL_D2L.md) to test UDOIT fully.

However, UDOIT does have one URL that is publicly available outside of the LMS. To test your server setup point your browser to:

    <BASE_URL>/lti/config

For example, if you are setting this up on your local computer via Docker, it may look like:

    http://127.0.0.1:8000/udoit3/lti/config

## Configuring Your LMS
You will need to complete the steps in the [INSTALL_CANVAS.md](INSTALL_CANVAS.md) or [INSTALL_D2L.md](INSTALL_D2L.md) to configure UDOIT to work within your LMS.
