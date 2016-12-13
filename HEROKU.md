# Heroku Button
Use the button below to quick start your deploy.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

# Manual Deploy on Heroku

You can use our configuration to launch a new Heroku app using [Heroku's app-setups api](https://devcenter.heroku.com/articles/setting-up-apps-using-the-heroku-platform-api).

You'll have to set some env settings. Peek at [app.json](app.json) for any env vars that don't have `"required": false` set. Our config vars are covered in [Configure section](#configure)


Create The App: **MAKE SURE you modify the env values**

```
curl -n -X POST https://api.heroku.com/app-setups \
-H "Content-Type:application/json" \
-H "Accept:application/vnd.heroku+json; version=3" \
-d '{"source_blob": { "url":"https://github.com/ucfopen/UDOIT/tarball/master/"}, "overrides": {"env": { \
"OAUTH2_ID":"<YOUR_ID_HERE>", \
"OAUTH2_KEY":"<YOUR_KEY_HERE>" \
}}}'
```

Read the result to make sure it returned an id, not an error.

Check your Heroku dashboard or run `heroku apps` to see if a new app shows up.  If all goes well, it should be running.


## Configure
These variables can be set in the curl post above.  You can also set them later using `heroku config:set VAR=value1`

* `CONSUMER_KEY` - LTI consumer key entered when adding UDOIT LTI to Canvas
* `SHARED_SECRET` - LTI secret entered when adding UDOIT LTI to Canvas
* `OAUTH2_ID` - from the developer api key created by your admin
* `OAUTH2_KEY` - from the developer api key created by your admin
* `OAUTH2_URI` - full url to your oauth2responce.php - EX: `https://your.herokuapp.com/oauth2response.php`
* `GOOGLE_API_KEY` - add a google api key for youtube video support
* `USE_HEROKU_CONFIG` - set to `true` to enable the Heroku configuration

# Develop using Heroku

To modify the code on your running Heroku server, you'll need to push code to it.

Set up the git repository:
```
git clone git@github.com:ucfopen/UDOIT.git
cd UDOIT
```

Link the git repository to your Heroku App
```
heroku git:remote --app <YOUR_HEROKU_APP_NAME>
```

Build and Deploy
```
git push heroku master:master
```

## Peeking at Database Tables
The Heroku install process should create the tables for you.

If you need to check that the tables exist, you can connect to Postgres using some convenient Heroku functions. You'll need to have **Postgresql installed on your own system** to do the following commands.

* `heroku pg:psql` will open a psql connection to the remote Heroku database
* `\dt` will show you a list of the tables you just created
* `\d reports` and `\d users` should describe the tables
* `Select * from users;` or `Select * from reports;` will show you their contents
* `\q` quits the psql terminal

If needed, you can manually run the table creation script: `Heroku run php lib/db_create_tables.php`

## Table Schema
The table schema can be found in [lib/db_create_tables.php](lib/db_create_tables.php)
