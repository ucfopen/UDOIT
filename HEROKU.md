# Heroku Deploy
## Heroku Button
If you wish to install Heroku using the one-click deployment process, please click the purple "Deploy to Heroku" button in the [repository home page](https://github.com/ucfopen/UDOIT/tree/issue/570-heroku).

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
1. Follow the instruction under the ['Source Code' section of INSTALL.md](https://github.com/ucfopen/UDOIT/blob/issue/570-heroku/INSTALL.md#source-code).
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
Before proceeding, please note that you can access your Heroku's command line by running the following from your machine:
```
heroku run bash
```
Furthermore, you can access the Heroku Postgres database by running the following within that environment to execute SQL:
```
psql <the DATABASE_URL from your config vars>
```
Next we need to set up the database and insert our institution in to the appropriate table.
1. Proceed with [setting up the database](https://github.com/ucfopen/UDOIT/blob/issue/570-heroku/INSTALL.md#database-setup).
  Important Note: Before setting up the database and if using Postgres, ensure that the table name in 'UDOIT/src/Entity/User.php' at line 14 is set to 'users'.
  This change must be contained in a commit and be pushed to the Heroku remote.
2. Now is a good time to set up developer keys according to the instructions in INSTALL_\<LMS\>.md.
3. Insert your institution in to the institution table as described in INSTALL_\<LMS\>.md.
### Step 4: Finish
Finish up the Heroku setup by [installing the yarn dependencies and building the project](https://github.com/ucfopen/UDOIT/blob/issue/570-heroku/INSTALL.md#javascript).

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
