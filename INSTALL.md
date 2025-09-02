# Installing UDOIT
UDOIT can be installed on your own existing servers with the following instructions. UDOIT is also available as a hosted and maintained product by [Cidi Labs](https://cidilabs.com). UDOIT is built using the [PHP Symfony Framework](https://symfony.com).

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
This method is strongly recommend as it allows UDOIT to be updated through a simple command on the terminal: `git pull`. It also lets you roll back to previous versions if needed. Follow these steps:

1. Install Git on your server (https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
2. Create a folder/directory in which UDOIT will reside (e.g `UDOIT`) and navigate to it.
3. Inside the UDOIT directory, run `git clone git@github.com:ucfopen/UDOIT.git . ` (The . is important; It tells Git to download the files to the current directory.)

### Option 2: Zip File
If you prefer not to use Git, you can download the zip file of the latest release from the [Releases Page](https://github.com/ucfopen/UDOIT/releases).  Unzip it in the directory in which UDOIT will reside.

## .ENV Setup
UDOIT stores configuration variables in a `.env` file. To create it:

1. Inside the UDOIT directory, run the following command in shell:
```
cp .env.example .env
```
This command copies the `.env.example` into `.env`, creating the `.env` file in the process if it does not exist.

2. Open `.env` with a text editor (i.e. Notepad, VS Code, etc.) and make the necessary changes to the following variables:
    - `APP_ENV`: If you are setting up a development environment, change this to `dev` and follow the steps in [Installing Composer Dependencies](#installing-composer-dependencies) without the `--no-dev` flag to obtain all of the development packages. Otherwise, leave it as `prod`.
    - `DATABASE_URL`: If you are hosting UDOIT on Docker or your local machine, leave it as it is. Otherwise, change it to your database URL.
    - `BASE_URL`: If you are hosting UDOIT on Docker or your local machine, leave it as it is. Otherwise, change it to the URL of your instance of UDOIT.
    - `WEBPACK_PUBLIC_PATH`: Uf you are hosting UDOIT on Docker or your local machine, leave it as it is. Otherwise, change it to match the `BASE_URL`in such a way that `/build` is located at the root of the `BASE_URL` (Example:  If your `BASE_URL` is set to `http://127.0.0.1:8000`, your `WEBPACK_PUBLIC_PATH` should be `/build`).
    - `APP_LMS`: `canvas` for Canvas LMS. `d2l` for D2l Brightspace LMS.
    - `JWK_BASE_URL`: If you are self-hosting Canvas, you may set it to the URL of your instance of Canvas. (Example: `JWK_BASE_URL="https://canvas.dev.myschool.edu"`)
   	- `DEFAULT_LANG`: (optional)  `en` for English. `es` for Spanish. This is English by default.
    - `DATABASE_ENCODE_KEY`: UDOIT encrypts your API keys within the database using this key. You will need to generate a key that will be used for encryption using the `create-key` script, explained further below.

## Installation

### Option 1: Docker
We provide a fast and simple way of setting up a local UDOIT instance through Docker.

1. Install [Docker Desktop](https://docs.docker.com/get-docker/). This will install Docker and Docker Compose on your system.
	> Alternatively, you may install Docker and [Docker Compose](https://docs.docker.com/compose/install/) individually.

2. Build the Containers

```
    make start
```

3. Once the containers are initialized, run the following command:

```
    make create-key
```
This will generate an encryption key that is used during encryption and decryption of sensitive API keys in the database.

You **must** generate a key, otherwise UDOIT will not start correctly.

4. Finally, with the containers still running, run the following command:
```
    make migrate
```
This applies migrations necessary to set up the database to store all UDOIT data.

Running this will give the following warning:

> WARNING! You are about to execute a migration in database "udoit3" that could result in schema changes and data loss. Are you sure you wish to continue? (yes/no) [yes]:

Type `yes` and proceed. The warning is expected and is a non issue.

> Note: You will need to run this command whenever you update to a new version of UDOIT.

UDOIT should be installed and running as Docker containers.

5. After generating an encryption key and applying migrations, run the following command to stop UDOIT:
```
    make down
```
You will need to stop UDOIT before loading it for the first time in order to allow the new encryption key to reload.

> Please be sure to review the `Makefile` for more information on what these commands do.

### Option 2: Manual Installation
If you prefer not to use Docker, the process is more complicated:

#### 1. Configuring your Web Server
 The details of configuring a web server with PHP are out of the scope of this README. You should configure your web server to point to UDOIT's "public" folder as the web root folder. Doing this will hide the configuration and source files so that they are not web accessible. It will also clean up your URL structure so that you don't need to include the "public" folder in any of the URLs to UDOIT.

If you are using NGINX as your web server, you can use the `build/nginx/nginx.conf` file as a starting point.

#### 2. Installing Composer Dependencies
UDOIT uses Composer to install PHP dependencies. Follow the upstream documentation on [Composer Installation](https://getcomposer.org/download/) to install `composer.phar` into the project root, then run the following:

    php composer.phar install --no-dev

> Remove the `--no-dev` flag if you set `APP_ENV=dev` in your `.env.local` file.

#### 3. Encryption Key Setup
UDOIT encrypts your API keys in the database using a generated encryption key.

This is done to protect against an attacker gaining access to your database and using the API keys to "act" as another user or UDOIT itself.

In order to generate the key, first ensure that you have created a `.env`. Then, run the following command from the root directory of UDOIT:

    php scripts/create-key.php .env

The script will then ask: `Create new key? (Y/n): `

Type `y` and then press enter. Then, you should see something like this (the generated key will be different):

```
Created new key: ha8HJt6CGAJdlO6S920eE6dUWVBOic+xJxN/O7Owu6s=
Updated .env with new key.
```

The script should automatically update the `DATABASE_ENCODE_KEY` field in your environment file with your generated key. Verify that your environment file has been updated by comparing the value of `DATABASE_ENCODE_KEY` with the generated key.

> Note: Ensure you include the correct filename of your environment file when running the key generation script. If you do not pass in any filename, you will receive the following error: `Please specify the environment file to modify!`

#### 4. Database Setup
While UDOIT is configured to use MySQL or MariaDB by default, Symfony can be configured to work with other databases as well. See the Symfony documentation for details.

Use Symfony to create the database with this command:

    php bin/console doctrine:database:create

Once the database is created you can populate the database with the following command:

    php bin/console doctrine:migrations:migrate

Tip: If you are getting errors when running the migration script try the following:

    php bin/console doctrine:schema:update --force

If you are operating in a production environment you will need to generate the doctrine proxy classes by running the following command:

    php bin/console cache:warmup --env=prod

#### 5. JavaScript
UDOIT uses [node](https://nodejs.org) and [yarn](https://yarnpkg.com/) to compile the JavaScript. Install Node and Yarn on your system, then run:

    yarn install

To build the JavaScript files for production, run the command:

    yarn build

## Testing successful installation
While UDOIT is an LTI tool that only functions fully within an LMS, you can plug the following URL in your browser to test if UDOIT is installed correctly:

    <BASE_URL>/lti/config

For example, if you are setting this up on your local computer via Docker, it may look like:

    http://127.0.0.1:8000/udoit3/lti/config


## Connecting UDOIT to an LMS
To configure it fully within your LMS, follow the installation instructions below that apply to you.
- To install it on Canvas, follow [INSTALL_CANVAS.md](INSTALL_CANVAS.md)
- or for D2l Brightspace, follow [INSTALL_D2L.md](INSTALL_D2L.md)
