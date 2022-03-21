# Installing UDOIT
UDOIT can be installed on your own existing servers with the following instructions. UDOIT is also available as a hosted and maintained product by [Cidi Labs](https://cidilabs.com). UDOIT is built using the [PHP Symfony Framework](https://symfony.com).

## System Requirements
UDOIT can be installed with Docker, or manually. If you have no preference, the Docker configuration is recommended.

You will need:

* Git (installation only)
* Docker
* Docker Compose

for the Docker configuration. See [QUICKSTART.md](./QUICKSTART.md) for instructions.

If you want to attempt a manual installation, you will need:

* Git (installation only)
* Apache or Nginx webserver
* PHP 8.1+
* MySQL, MariaDB, or PostgreSQL
* Node v17 is supported; other versions may work
* Yarn

## Source Code
We strongly recommend to manage source code through Git. The benefit of this method is that you can update an existing installation of UDOIT by simply using `git pull`. It also lets you roll back to previous versions if needed. Follow these steps:

* Install Git on your server if necessary. Most Linux distributions preinstall a version of Git. You can verify Git is installed by running 
```bash
git --version
```
* Navigate to the directory on your server where UDOIT will live.
* Download this repository with:
```bash
git clone git@github.com:ucfopen/UDOIT.git .
```

> The trailing `.` is important. If you omit it, Git will create a folder called UDOIT in the current directory with the contents of the repo rather than downloading the contents into the local directory itself.

## Configuring your Web Server
The details of configuring a web server with PHP are out of the scope of this README. You should configure your web server to point to UDOIT's "public" folder as the web root folder. Doing this will hide the configuration and source files so that they are not web accessible. It will also clean up your URL structure so that you don't need to include the "public" folder in any of the URLs to UDOIT.

## Installing Composer Dependencies
If you're not using Docker, follow the upstream documentation on [Composer Installation](https://getcomposer.org/download/) to install `composer.phar` into the project root, then run the following:

    php composer.phar install --no-dev

> Remove the `--no-dev` flag if you wish to use `APP_ENV=dev` below.

## .ENV Setup
UDOIT uses a `.env` file for storing configuration. Local configuration such as database information and URLs should be stored in a `.env.local` file that is NOT tracked in Git.

> These changes should be made outside any of the Docker containers.

1. Copy the file `.env.local.example` to `.env.local`.
```
cp .env.local.example .env.local
```
2. Leave `APP_ENV` set to `prod`
> If you are setting up a development environment, set this to `dev` and follow the steps in [Installing Composer Dependencies](#installing-composer-dependencies) without the `--no-dev` flag to obtain all of the development packages.
3. Add your database information to this `DATABASE_URL` variable.
4. Add the `BASE_URL`, which is the full URL to reach the `public` folder of UDOIT. (i.e. https://udoit3.ciditools.com) WITHOUT the trailing slash.
5. Set `APP_LMS` to the name of your LMS.
   * `canvas` if you are using the Canvas LMS.
   * `d2l` if you are using the D2l Brightspace LMS.
6. (Optional) You can change the default language for your entire UDOIT instance by overriding the `DEFAULT_LANG` variable. Currently supported languages are English (`en`) and Spanish (`es`).

## Database Setup
While UDOIT is configured to use MySQL or MariaDB by default, Symfony can be configured to work with other databases as well. See the Symfony documentation for details.

You can create your database manually, or use Symfony to create the database with this command:

    php bin/console doctrine:database:create

Once the database is created you can populate the database with the following command:

    php bin/console doctrine:migrations:migrate

Tip: If you are getting errors when running the migration script try the following:

    php bin/console doctrine:schema:update --force

If you are operating in a production environment you will need to generate the doctrine proxy classes by running the following command:

    php bin/console cache:warmup --env=prod

## JavaScript
UDOIT uses [node](https://nodejs.org) and [yarn](https://yarnpkg.com/) to compile the JavaScript. Instructions for installing Node and Yarn are out of the scope of this README.

To install the JavaScript dependencies run the command:

    yarn install

To build the JavaScript files for production, run the command:

    yarn build

## Testing Your Setup
Once you have completed the steps above you will want to test your setup. Unfortunately, UDOIT is an LTI tool that can only fully run within the LMS. You will need to complete the steps in the INSTALL_CANVAS.md or INSTALL_D2L.md to test UDOIT fully.

However, UDOIT does have one URL that is publicly available outside of the LMS. To test your server setup point your browser to:

    <BASE_URL>/lti/config

For example, if you are setting this up on your local computer on port 8080, it may look like:

    https://localhost:8080/lti/config

## Configuring Your LMS
You will need to complete the steps in the [INSTALL_CANVAS.md](INSTALL_CANVAS.md) or [INSTALL_D2L.md](INSTALL_D2L.md) to configure UDOIT to work within your LMS.
