# Heroku Button
If you wish to install Heroku using the one-click deployment process, please click the purple "Deploy to Heroku" button in the [repository home page](https://github.com/ucfopen/UDOIT#installing-udoit).

## Installation Instructions
Installing UDOIT using the Heroku button is very easy, but still requires some setup.  If you prefer to watch a video demonstrating the process step-by-step, watch the [UDOIT Installation CanvasLIVE video](https://www.youtube.com/watch?v=g1LgnErkvsA).

Below are the written directions if you prefer to follow along that way.

### Step 1:  Create a Google/YouTube and Vimeo API keys

See the [Google/YouTube API instructions](README.md#googleyoutube-api-key) and [Vimeo API instructions](README.md#vimeo-api-key) in the README.

### Step 2:  Setting up Heroku
After clicking the Heroku button above:

1. Create an account (if you don't have one already).
2. Give the app a name.
3. Set `OAUTH2_ENFORCE_SCOPES` to true if you have a scoped developer key.
4. Fill out the `OAUTH2_ID` and `OAUTH2_KEY` fields with dummy data. (We'll fix it later.)
5. Fill out the `OAUTH2_URI` field with `https://yourapp.herokuapp.com/oauth2response.php`. (Replace 'yourapp' with the name you gave in step 2.)
6. Fill out the `CANVAS_NAV_ITEM_NAME` field with the name you would like the app to appear as in the course navigation menu.  This is useful if your instance will be use for a pilot.  The normal value to use here is ***UDOIT***.
7. (optional) Copy and paste your Google/YouTube API key into the `GOOGLE_API_KEY` field.
8. (optional) Copy and paste your Vimeo API key into the `VIMEO_API_KEY` field.
9. (optional) If you have a Google Analytics account, you can paste your site tracking code into the `GA_TRACKING_CODE` field.
10. (optional) If you would like to enable the Admin Panel, change the `ADMIN_PANEL_ENABLED` field to `true`.
11. Click the Deploy button and wait for the process to complete.

### Step 3:  Request a Developer Key
UDOIT uses Oauth2 to take actions on behalf of the user, so you'll need to ask your Canvas administrator to generate a Developer Key for you.  (If you are an admin, go to your institution's account administration page in Canvas and click on 'Developer Keys'.)  Here is the information you need to provide them:

* ***Key Name:*** Probably ***UDOIT*** or ***UDOIT Test*** for your test instance
* ***Owner Email:*** The email address of whoever is responsible for UDOIT at your institution
* ***Redirect URI:*** This is the URI of the `oauth2response.php` file in the UDOIT directory.
 * This should be `https://yourapp.herokuapp.com/oauth2response.php`. (Replace 'yourapp' with the name of your UDOIT instance on Heroku.)
* ***Icon URL:*** The URL of the UDOIT icon.  This is `https://yourapp.herokuapp.com/assets/img/udoit_icon.png`.  (Replace ***yourapp*** with the name of your UDOIT instance on Heroku.)

#### Scoped Developer Keys
If you'd like to use this option, you'll need set the following scopes for your developer key.
You also need to check "Allow Include Parameters"

* Assignments
	* url:GET|/api/v1/courses/:course_id/assignments
	* url:GET|/api/v1/courses/:course_id/assignments/:id
	* url:PUT|/api/v1/courses/:course_id/assignments/:id
* Courses
	* url:PUT|/api/v1/courses/:id
	* url:GET|/api/v1/courses/:id
	* url:POST|/api/v1/courses/:course_id/files
* Discussion Topics
	* url:GET|/api/v1/courses/:course_id/discussion_topics
	* url:GET|/api/v1/courses/:course_id/discussion_topics/:topic_id
	* url:PUT|/api/v1/courses/:course_id/discussion_topics/:topic_id
* Files
	* url:GET|/api/v1/courses/:course_id/files
	* url:GET|/api/v1/courses/:course_id/folders/:id
	* url:GET|/api/v1/folders/:id/folders
	* url:GET|/api/v1/folders/:id/files
* Modules
	* url:GET|/api/v1/courses/:course_id/modules
	* url:GET|/api/v1/courses/:course_id/modules/:module_id/items
* Pages
	* url:GET|/api/v1/courses/:course_id/pages
	* url:GET|/api/v1/courses/:course_id/pages/:url_or_id
	* url:PUT|/api/v1/courses/:course_id/pages/:url_or_id
* Users
	* url:GET|/api/v1/users/:user_id/profile

### Step 4:  Add your Developer Key to UDOIT
1. In Heroku, click the 'Manage App' button for your install of UDOIT.
2. Go to the 'Settings' tab.
3. Copy and paste the following values from the Developer Key:
 * ID into ***OAUTH2_ID***
 * Secret into ***OAUTH2_KEY***
4. Verify that your ***OAUTH2_URI*** is correct. (See above.)

### Step 5:  Install the UDOIT LTI

In Canvas, you can install UDOIT at the course or sub-account levels.

1. Click the **Settings** menu item from any course in Canvas.
2. Click the **Apps** tab.
3. Click the **View App Configurations** button.
4. Click the **Add App** button.
5. Under **Configuration Type**, choose **By URL**.
6. In the **Name** field, enter `UDOIT`.
7. In the **Consumer Key** field, copy the value from CONSUMER_KEY
8. In the **Shared Secret** field, copy the value from SHARED_SECRET
9. In the **Config URL** field, insert https://yourapp.herokuapp.com/udoit.xml.php (Replace yourapp with the name of your UDOIT instance on Heroku.)
10. Finish by clicking **Submit**.

UDOIT should now be available in the course navigation menu.

# Manual Deploy on Heroku

**Warning: Recommended for advanced users only**

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

Check your Heroku dashboard or install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) and run `heroku apps` to see if a new app shows up.  If all goes well, it should be running.


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

If needed, you can manually run the table creation script: `heroku run composer db-setup`

## Table Schema
The table schema can be found in [migrations/](migrations/)

# Upgrade an Existing Heroku Installation

When it comes time to update UDOIT to the latest version, you probably don't want to have to start over from scratch using the Heroku Button (as explained above).  Luckily, there's a procedure for upgrading an existing installation, which allows you to keep your existing database, settings, and URL.

## First Time Setup

This process takes a while to set up the first time, but is very fast after that.  On your computer:

1. Install [Git](https://git-scm.com/downloads)
2. [Configure Git](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup)
3. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) and follow the instructions to get your account set up.
4. Clone the UDOIT Git repository.  If you are using a command line interface, navigate to a directory where you would like the code to live and run this command:  `git clone git@github.com:ucfopen/UDOIT.git`.  This will create a folder called `UDOIT` that contains the latest version.
5. In your command line interface, navigate into the newly-created `UDOIT` folder.
6. Run `heroku git:remote --app your-heroku-instance`, replacing `your-heroku-instance` with your actual heroku instance name.  For example, if your UDOIT instance resides at `https://udoit-pcu.herokuapp.com`, you would run `heroku git:remote --app udoit-pcu`.  This adds your Heroku instance as a ***remote*** called `heroku` in the Git repository so that you can push updates to it in the future.

## Pushing Updates to Heroku

Now that your computer is set up, you only need to follow these steps each time you would like to update your instance of UDOIT:

1. In your command line interface, navigate to the `UDOIT` directory on your computer.
2. Run `git checkout master` to make sure we're on the master branch, which represents the latest version of UDOIT.
3. Run `git pull` to update your local copy of UDOIT from the official GitHub repository.
4. Run `git push heroku master:master` to deploy the new version to your UDOIT instance.
5. Run `heroku run --app your-heroku-instance "php composer.phar migrate"` to update the database structure for your UDOIT instance. (Remember to replace `your-heroku-instance` with your Heroku instance name.)
6. Log into the Heroku website and click on your UDOIT instance.
7. Click **Settings**
8. Under the **Config Vars** heading, click **Reveal Config Vars**.
9. Compare them to the `env` section of [app.json](app.json), and add any missing variables to Heroku.

UDOIT should now be up to date with the latest release!

## Dealing with Multiple Heroku Instances

### First Time Setup (Test Instance)

The sections above assume you only have a single Heroku instance.  However, we recommend you always have two instances:  one for testing and one for production.  That way, you can test out the deploy on your test instance without risking any downtime on your production instance.  If you don't have a test instance, just use the [Heroku Button](#heroku-button) to create one.  Assuming you set everything up for your production instance in the [First Time Setup](#first-time-setup) section above, here's how to set up your testing instance (sometimes called "staging" or "QA"):

1. In your command line interface, navigate to the `UDOIT` directory on your computer.
2. Run `heroku git:remote --remote test --app your-heroku-test-instance`, replacing `your-heroku-test-instance` with your actual heroku test instance name.  For example, if your UDOIT instance resides at `https://udoit-pcu-test.herokuapp.com`, you would run `heroku git:remote --remote test --app udoit-pcu-test`.  This adds your Heroku test instance as a ***remote*** called `test` in the Git repository so that you can push updates to it in the future.

Feel free to name the remote anything you want.  It doesn't have to be `test`; it could be `staging` or `qa` or `blah`.  It's best to make it something descriptive, though.

### Pushing Updates to the Test Instance

Now that you have the connection to the test instance set up, here's how to push an update to it:

1. In your command line interface, navigate to the `UDOIT` directory on your computer.
2. Run `git checkout master` to make sure we're on the master branch, which represents the latest version of UDOIT.
3. Run `git pull` to update your local copy of UDOIT from the official GitHub repository.
4. Run `git push test master:master` to deploy the new version to your UDOIT test instance.
5. Run `heroku run --app your-heroku-test-instance "php composer.phar migrate"` to update the database structure for your UDOIT test instance.  (Remember to replace `your-heroku-test-instance` with your Heroku test instance name.)
6. Log into the Heroku website and click on your UDOIT test instance.
7. Click **Settings**
8. Under the **Config Vars** heading, click **Reveal Config Vars**.
9. Compare them to the `env` section of [app.json](app.json), and add any missing variables to Heroku.

# FAQ

## Why aren't my scans completing?
If you are using the free tier, you may need to manually turn on the worker dyno.  You can do this by going to the [Heroku Control Panel](https://dashboard.heroku.com/apps), selecting your instance of UDOIT, clicking **Configure Dynos**, clicking the pencil icon next to the **Worker** dyno, clicking the slider to the **on** position, then clicking **Confirm**.
