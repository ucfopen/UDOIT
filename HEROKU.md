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
2. Set `OAUTH2_ENFORCE_SCOPES` to true if have a scoped developer key
3. Fill out the `OAUTH2_ID` and `OAUTH2_KEY` fields with dummy data. (We'll fix it later.)
4. Fill out the `OAUTH2_URI` field with `https://yourapp.herokuapp.com/oauth2response.php`. (Replace 'yourapp' with the name you gave in step 2.)
5. Fill out the `CANVAS_NAV_ITEM_NAME` field with the name you would like the app to appear as in the course navigation menu.  This is useful if your instance will be use for a pilot.  The normal value to use here is ***UDOIT***.
6. (optional) Copy and paste your Google/YouTube API key into the `GOOGLE_API_KEY` field.
7. (optional) Copy and paste your Vimeo API key into the `VIMEO_API_KEY` field.
8. (optional) If you have a Google Analytics account, you can paste your site tracking code into the `GA_TRACKING_CODE` field.
9. (optional) If you would like to enable the Admin Panel, change the `ADMIN_PANEL_ENABLED` field to `true`.
8. Click the Deploy button and wait for the process to complete.

### Step 3:  Request a Developer Key
UDOIT uses Oauth2 to take actions on behalf of the user, so you'll need to ask your Canvas administrator to generate a Developer Key for you.  (If you are an admin, go to your institution's account administration page in Canvas and click on 'Developer Keys'.)  Here is the information you need to provide them:

* ***Key Name:*** Probably ***UDOIT*** or ***UDOIT Test*** for your test instance
* ***Owner Email:*** The email address of whoever is responsible for UDOIT at your institution
* ***Redirect URI:*** This is the URI of the `oauth2response.php` file in the UDOIT directory.
 * This should be `https://yourapp.herokuapp.com/oauth2response.php`. (Replace 'yourapp' with the name of your UDOIT instance on Heroku.)
* ***Icon URL:*** The URL of the UDOIT icon.  This is `https://yourapp.herokuapp.com/assets/img/udoit_icon.png`.  (Replace ***yourapp*** with the name of your UDOIT instance on Heroku.)

#### Scoped Developer Keys
If youd like to use this option youll need set these following scopes on your developer key.
* Courses
	* url:GET|/api/v1/courses/:id
	* url:POST|/api/v1/courses/:course_id/files
	* url:PUT|/api/v1/courses/:id
* Assignment
	* url:GET|/api/v1/courses/:course_id/assignments
	* url:GET|/api/v1/courses/:course_id/assignments/:id
	* url:PUT|/api/v1/courses/:course_id/assignments/:id
* Discussion Topics
	* url:GET|/api/v1/courses/:course_id/discussion_topics
	* url:GET|/api/v1/courses/:course_id/discussion_topics/:topic_id
	* url:PUT|/api/v1/courses/:course_id/discussion_topics/:topic_id
* Files
	* url:GET|/api/v1/courses/:course_id/folders/:id
	* url:GET|/api/v1/folders/:id/folders
	* url:GET|/api/v1/folders/:id/files
* Modules
	* url:GET|/api/v1/courses/:course_id/modules
* Pages
	* url:GET|/api/v1/courses/:course_id/pages
	* url:GET|/api/v1/courses/:course_id/pages/:url
	* url:PUT|/api/v1/courses/:course_id/pages/:url
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

If needed, you can manually run the table creation script: `heroku run composer dbsetup`

## Table Schema
The table schema can be found in [migrations/](migrations/)

# FAQ

## Why aren't my scans completing?
If you are using the free tier, you may need to manually turn on the worker dyno.  You can do this by going to the [Heroku Control Panel](https://dashboard.heroku.com/apps), selecting your instance of UDOIT, clicking **Configure Dynos**, clicking the pencil icon next to the **Worker** dyno, clicking the slider to the **on** position, then clicking **Confirm**.
