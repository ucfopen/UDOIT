# Heroku Deploy
## Heroku Button
If you wish to install Heroku using the one-click deployment process, please click the purple "Deploy to Heroku" button in the [repository home page](https://github.com/ucfopen/UDOIT/tree/main#installing-udoit-on-heroku).

## Installation Instructions
Installing UDOIT using the Heroku button is very easy, but still requires some setup.

### Step 1: Setting up Heroku
After clicking the Heroku button above:

1. Create an account (if you don't have one already).
2. Give the app a name.
3. Set `APP_ENV` to prod for the production version of UDOIT. Please note: The dev environment is not available on Heroku.
4. Set `APP_LMS` to the name of your LMS.
5. Fill out the `BASE_URL` field with `https://yourapp.herokuapp.com`. (Replace 'yourapp' with the name you gave in step 2.)
5. Fill out the `JWK_BASE_URL` field with the URL to your LMS. The default value works for instructure hosted instances of Canvas, but will need to be modified according to the LMS and host.
6. Click the Deploy button and wait for the process to complete.

### Step 2: Clone UDOIT and Push to Heroku
1. Follow the instruction under the ['Source Code' section of INSTALL.md](https://github.com/ucfopen/UDOIT/blob/main/INSTALL.md#source-code).
2. Install and log in to the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli).
3. Next, from within your UDOIT's root folder on your machine, connect your local repository to Heroku:
```
heroku git:remote -a your_app_name
```
4. Finally, run the following to upload the source to Heroku:
```
git push heroku main:master -f
```

### Step 3: Database Migration and Setup
Next we need to set up the database and insert our institution in to the appropriate table.
1. Access your Heroku instance by running
```bash
heroku run bash
```
2. If using Heroku Postgres, run the database migrations by using:
```bash
php bin/console doctrine:migrations:migrate
```
3. If you are operating in a production environment you will need to generate the doctrine proxy classes by running the following command:
```bash
php bin/console cache:warmup --env=prod
```
4. Set up developer keys according to the instructions in INSTALL_\<LMS\>.md.
5. Access the Postgres database by running the following within Heorku's bash environment:
```sql
psql <the DATABASE_URL located in your config vars under the Settings tab>
```
6. Insert your institution in to the institution table as described in INSTALL_\<LMS\>.md.  It may be something like:
```sql
INSERT INTO institution (id, title, lms_domain, lms_id, lms_account_id, created, status, vanity_url, metadata, api_client_id, api_client_secret) VALUES (0, 'Canvas', 'myinstitution.instructure.com', 'canvas', '1', '2021-10-21', true, 'vanity.example.com', '{"lang":"en"}', '123456', 'abcdefghijklmnopqrstuvwxyz');
```
### Step 4: Finish
Install the app following the instructions described in INSTALL_\<LMS\>.md.

## Manual Deployment
### Step 1: Create a new Heroku app
### Step 2: Add Buildpacks
1. Go to 'Settings' --> 'Buildpacks' --> 'Add Buildpack'.
2. Add 'php' and 'nodejs'.
### Step 3: Set up Config Vars
1. Go to 'Settings' --> 'Config Vars' --> 'Reveal Config Vars'.
2. Add the following:
  * APP_ENV = prod
  * APP_LMS = \<LMS\>
  * BASE_URL = \<Heroku app URL\>
### Step 4: Connect Database
If you intend to use your own databse, set a DATABASE_URL config var to your database's url. To use Heroku Postgresql:
  * Go to 'Resources' --> 'Add-ons' --> 'Find more add-ons'.
  * Find 'Heroku Postgres' and then install.

Continue with the steps outlined in the previous section.
