# Installing UDOIT
UDOIT can be installed on your own existing servers with the following instructions. It is also available as a hosted and maintained product by [Cidi Labs](https://cidilabs.com). 

UDOIT is built using the [PHP Symfony Framework](https://symfony.com).

## System Requirements
The system requirements depend on how you install UDOIT.

### Docker Method
* Docker
* Docker Compose
* Cmake (This is available on most systems by default)

### Manual Installation Method
* Apache or Nginx webserver
* PHP 8.1, 8.2
* MySQL, MariaDB or PostgreSQL
* Git (If you are using The Git Method below) or if you plan on contributing to UDOIT
* Node v16 is supported; later versions may work
* Yarn

## Download the Code
### Option 1: Git (Strongly recommended)
This method is strongly recommended as it allows UDOIT to be updated through your computer terminal using a simple command: `git pull`.

To quickly access your terminal:
- On Windows: Press `Windows key + X` and select `PowerShell`. This will open a window for you to navigate to the folder you want UDOIT installed in.
- On MacOS: Press `Cmd + Space`, type in `Terminal` and hit `Enter`.
- On Linux: Press `Ctrl + Alt + T` and search for `Terminal` or `Console`.   
>Note: Continuing with the following process in the `main` branch may mean working with changes in the latest development cycle. If you want to work on a stable release, go to the [release tags](https://github.com/dmols/UDOIT/tags) to find the version you want to work with, and follow the installation instructions from there!

Follow these steps:

1. Install Git on your server (https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
2. Create a folder/directory in which UDOIT will reside (e.g `UDOIT`) and navigate to it.
3. Inside the UDOIT directory, run `git clone git@github.com:ucfopen/UDOIT.git . ` (The . is important; It tells Git to download the files to the current directory.)

### Option 2: Zip File
If you prefer not to use Git, you can download the zip file of the latest release from the [Releases Page](https://github.com/ucfopen/UDOIT/releases). Unzip it in the directory in which UDOIT will reside.

## .ENV File Setup
UDOIT stores configuration variables in a `.env` file. To create it:

1. Inside the UDOIT directory, run `cp .env.example .env` in the terminal.

2. Open the `.env` file with a text editor (i.e. Notepad, VS Code, etc.) and make the necessary changes to the following variables:
   - `APP_ENV`: If you are setting up a development environment, change this to `dev`. Otherwise, leave it as `prod`.
   - `DATABASE_URL`: If you are hosting UDOIT on Docker or your local machine, leave it as it is. Otherwise, change it to your database URL.
   - `BASE_URL`: If you are hosting UDOIT on Docker or your local machine, leave it as it is. Otherwise, change it to the URL of your instance of UDOIT.
   - `WEBPACK_PUBLIC_PATH`: Uf you are hosting UDOIT on Docker or your local machine, leave it as it is. Otherwise, change it to match the `BASE_URL`in such a way that `/build` is located at the root of the `BASE_URL` (Example:  If your `BASE_URL` is set to `http://127.0.0.1:8000`, your `WEBPACK_PUBLIC_PATH` should be `/build`).
   	- `APP_LMS`: `canvas` for Canvas LMS. `d2l` for D2l Brightspace LMS.
   - `JWK_BASE_URL`: If you are self-hosting Canvas, you may set it to the URL of your instance of Canvas. (Example: `JWK_BASE_URL="https://canvas.dev.myschool.edu"`)
   	- `DEFAULT_LANG`: (optional)  `en` for English. `es` for Spanish. This is English by default.

## Installation

There are a couple different ways you can configure your UDOIT instance. We strongly recommend the Docker installation if possible, as it tends to be a lot more straightforward and easier to debug.
### Option 1: Docker
We provide a fast and simple way of setting up a local UDOIT instance through Docker.

#### 1. Install [Docker Desktop](https://docs.docker.com/get-docker/). This will install Docker and Docker Compose on your system.
> Alternatively, you may install Docker and [Docker Compose](https://docs.docker.com/compose/install/) individually.

#### 2. (Optional) Install the Necessary PHP Dependencies for Dev Environment

UDOIT uses Composer to install PHP dependencies. Running the following command will handle installing the dependencies for you.

#### 3. Build the Containers

- Run the command `make start` on your terminal. 


*Note: This may take a while to fully initiate. This is normal.*
#### 4. Set Up Database

The following command applies migrations necessary to set up the database to store all UDOIT data. Please make sure the containers have fully spun up before proceeding.

- Run `make migrate`.

Running this command will give the following warning:

> WARNING! You are about to execute a migration in database "udoit3" that could result in schema changes and data loss. Are you sure you wish to continue? (yes/no) [yes]:

Type `yes` and proceed. The warning is meant to deter you if you already have data in the database but we don't yet.

> Note: You will need to run this command whenever you update to a new version of UDOIT.

UDOIT should be installed and running as Docker containers. You won't see any data in the tables yet and that is normal in this step of the process.

#### Stopping the UDOIT containers
To stop the UDOIT containers, run `make down` on your terminal.

*Please be sure to review the `Makefile` for more information on what this command and others do.*

If UDOIT is running without errors, you can move on to [installing it for your LMS](#connecting-udoit-to-an-lms)! If you're encountering errors, please check out the [wiki](https://github.com/ucfopen/UDOIT/wiki).

### Option 2: Manual Installation
If you prefer not to use Docker, the process is more complicated.

#### 1. Configuring your Web Server
 The details of configuring a web server with PHP are out of the scope of this README. You should configure your web server to point to UDOIT's "public" folder as the web root folder. Doing this will hide the configuration and source files so that they are not web accessible. It will also clean up your URL structure so that you don't need to include the "public" folder in any of the URLs to UDOIT.

If you are using NGINX as your web server, you can use the `build/nginx/nginx.conf` file as a starting point.

#### 2. Installing Composer Dependencies
UDOIT uses Composer to install PHP dependencies. Follow the upstream documentation on [Composer Installation](https://getcomposer.org/download/) to install `composer.phar` into the project root. After that, you can proceed to this step.

- Run `php composer.phar install --no-dev`.

> Remove the `--no-dev` flag if you set `APP_ENV=dev` in your `.env.local` file.

#### 3. Database Setup
While UDOIT is configured to use MySQL or MariaDB by default, Symfony can be configured to work with other databases as well. See the Symfony documentation for details.

- Use Symfony to create the database by running `php bin/console doctrine:database:create`.

- Once the database is created you can populate the databasee by running `php bin/console doctrine:migrations:migrate`.

Tip: If you are getting errors when running the migration script try running `php bin/console doctrine:schema:update --force`.

If you are operating in a production environment you will need to generate the doctrine proxy classes by running `php bin/console cache:warmup --env=prod`.

#### 4. JavaScript
UDOIT uses [node](https://nodejs.org) and [yarn](https://yarnpkg.com/) to compile the JavaScript. Install Node and Yarn on your system, then follow these steps.

- Run `yarn install`.

- To build the JavaScript files for production, run `yarn build`.

## Testing successful installation
While UDOIT is an LTI tool that only functions fully within an LMS, you can plug the following URL in your browser to test if UDOIT is installed correctly:

    <BASE_URL>/lti/config

For example, if you are setting this up on your local computer via Docker, it may look like:

    http://127.0.0.1:8000/udoit3/lti/config


## Connecting UDOIT to an LMS
To configure it fully within your LMS, follow the installation instructions below that apply to you.
- To install it on Canvas, follow [INSTALL_CANVAS.md](INSTALL_CANVAS.md)
- or for D2l Brightspace, follow [INSTALL_D2L.md](INSTALL_D2L.md)

## Encountering Errors
Please resort to the [wiki page](https://github.com/ucfopen/UDOIT/wiki) for some commonly found errors when setting up UDOIT.
