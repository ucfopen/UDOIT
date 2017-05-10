# Heroku Button
If you wish to install Heroku using the one-click deployment process, please click the purple "Deploy to Heroku" button in the [repositories main README](https://github.com/ucfopen/UDOIT).

## Installation Instructions
Installing UDOIT using the Heroku button is very easy, but still requires some setup.  If you prefer to watch a video demonstrating the process step-by-step, watch the [UDOIT Installation CanvasLIVE video](https://www.youtube.com/watch?v=g1LgnErkvsA).

Below are the written directions if you prefer to follow along that way.

### Step 1:  Create a Google/YouTube API key

See the [Google/YouTube API instructions](README.md#googleyoutube-api-key) in the README.

### Step 2:  Setting up Heroku
After clicking the Heroku button above:

1. Create an account (if you don't have one already).
2. Give the app a name.
3. Fill out the `OAUTH2_ID` and `OAUTH2_KEY` fields with dummy data.  (We'll fix it later.)
4. Fill out the `OAUTH2_URI` field with `https://yourapp.herokuapp.com/oauth2response.php`. (Replace 'yourapp' with the name you gave in step 2.)
5. Fill out the `CANVAS_NAV_ITEM_NAME` field with the name you would like the app to appear as in the course navigation menu.  This is useful if your instance will be use for a pilot.  The normal value to use here is ***UDOIT***.
5. Copy and paste your Google/YouTube API key.
5. Click the Deploy button and wait for the process to complete.

### Step 3:  Request a Developer Key
UDOIT uses Oauth2 to take actions on behalf of the user, so you'll need to ask your Canvas administrator to generate a Developer Key for you.  (If you are an admin, go to your institution's account administration page in Canvas and click on 'Developer Keys'.)  Here is the information you need to provide them:

* ***Key Name:*** Probably ***UDOIT*** or ***UDOIT Test*** for your test instance
* ***Owner Email:*** The email address of whoever is responsible for UDOIT at your institution
* ***Redirect URI:*** This is the URI of the `oauth2response.php` file in the UDOIT directory.
 * This should be `https://yourapp.herokuapp.com/oauth2response.php`. (Replace 'yourapp' with the name of your UDOIT instance on Heroku.)
* ***Icon URL:*** The URL of the UDOIT icon.  This is `https://yourapp.herokuapp.com/assets/img/udoit_icon.png`.  (Replace ***yourapp*** with the name of your UDOIT instance on Heroku.)

### Step 4:  Add your Developer Key to UDOIT
1. In Heroku, click the 'Manage App' button for your install of UDOIT.
2. Go to the 'Settings' tab.
3. Copy and paste the following values from the Developer Key:
 * ID into ***OAUTH2_ID***
 * Secret into ***OAUTH2_KEY***
4. Verify that your ***OAUTH2_URI*** is correct. (See above.)

### Step 5:  Install the UDOIT LTI

1. You can install UDOIT at the sub-account level or the course level.  Either way, start by going to the **settings** area.
2. Click the **Apps** tab.
3. Click the **View App Configurations** button.
4. Click the **Add App** button.
5. Under **Configuration Type**, choose **By URL**.
6. In the **Name** field, enter `UDOIT`.
7. In the **Consumer Key** field, copy the value from CONSUMER_KEY
8. In the **Shared Secret** field, copy the value from SHARED_SECRET
9.In the **Config URL** field, insert https://yourapp.herokuapp.com/udoit.xml.php (Replace yourapp with the name of your UDOIT instance on Heroku.)
10. Finish by clicking **Submit**.

UDOIT should now be available in the course navigation menu.

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
* `OAUTH2_URI` - full url to your oauth2response.php - EX: `https://your.herokuapp.com/oauth2response.php`
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
