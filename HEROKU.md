## Heroku Button
Use the button below to quick start your deploy.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Manual Deploy on Heroku
1. `git clone git@github.com:ucfcdl/UDOIT.git` to grab a copy of the git repo
2. `heroku create` will set up a Heroku project
3. `heroku addons:create heroku-postgresql:hobby-dev` add a database addon
4. `heroku buildpacks:set https://github.com/heroku/heroku-buildpack-multi` may be required
5. `git push heroku master:master` will build build the server using our master branch
6. set up the Heroku config variables below

## Configure
Set Heroku config variables using `heroku config:set VAR=value1`

* `CONSUMER_KEY` - LTI consumer key entered when adding UDOIT LTI to Canvas
* `SHARED_SECRET` - LTI secret entered when adding UDOIT LTI to Canvas
* `OAUTH2_ID` - from the developer api key created by your admin
* `OAUTH2_KEY` - from the developer api key created by your admin
* `OAUTH2_URI` - full url to your oauth2responce.php - EX: `https://your.herokuapp.com/oauth2response.php`
* `GOOGLE_API_KEY` - add a google api key for youtube video support
* `USE_HEROKU_CONFIG` - set to `true` to enable the Heroku configuration

## Create Database Tables
The Heroku install process should create the tables for you.

If you need to check that the tables exist, you can connect to postgres using some convenient heroku functions. You'll need to have **postgresql installed on your own system** to do the following commands.

* `heroku pg:psql` will open a psql connection to the remote Heroku database
* `\dt` will show you a list of the tables you just created
* `\d reports` and `\d users` should describe the tables
* `Select * from users;` or `Select * from reports;` will show you their contents
* `\q` quits the psql terminal

If needed, you can manually run the table creation script: `heroku run php lib/db_create_tables.php`

## Table Schema
The table schema can be found in [lib/db_create_tables.php](lib/db_create_tables.php)
