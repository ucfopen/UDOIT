## Deploy on Heroku

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
You'll need to have postgresql installed on your own system to connect to the Heroku postgresql database.

* `heroku pg:psql` will open a psql connection to the remote Heroku database
* copy and paste the postgresql table schemeas for the users and reports table into the prompt
* `\dt` will show you a list of the tables you just created
* `\q` quits the psql terminal

```sql
/* postgresql */
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  user_id integer,
  course_id integer,
  file_path text,
  date_run timestamp with time zone,
  errors integer,
  suggestions integer
);
```

### Users Table

```sql
/* postgresql */
CREATE TABLE users (
  id integer CONSTRAINT users_pk PRIMARY KEY,
  api_key varchar(255),
  date_created integer
);
```
