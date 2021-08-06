# Heroku Deploy
## Manual Deployment
### Step 1: Create a new Heroku app
### Step 2: Add Buildpacks
1. Go to 'Settings' --> 'Buildpacks' --> 'Add Buildpack'.
2. Add 'php' and 'nodejs'.
### Step 3: Set up Config Vars
1. Go to 'Settings' --> 'Config Vars' --> 'Reveal Config Vars'.
2. Add the following:
  * APP_ENV = prod
  * APP_LMS = <LMS>
  * APP_LTI_REDIRECT_URL = <Heroku app URL>/lti/authorize/check
  * APP_OAUTH_REDIRECT_URL = <Heroku app URL>/authorize/check
  * BASE_URL = <Heroku app URL>
### Step 4: Connect Database
If you intend to use your own databse, set a DATABASE_URL config var to your database's url. To use Heroku Postgresql:
  * Go to 'Resources' --> 'Add-ons' --> 'Find more add-ons'.
  * Find 'Heroku Postgres' and then install.
### Step 5: Deploy Cloned Project
Go to 'Deploy' and follow the steps under 'Deploy using Heroku Git'.
### Step 6: Set up Database
1. From command line run:
```
heroku run bash
```
May also access this in browser from 'More' --> 'Run Console' --> 'bash'.
2. Continue with INSTALL.md
