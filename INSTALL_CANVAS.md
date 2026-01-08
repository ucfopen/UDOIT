# Installing UDOIT in Canvas
Once UDOIT has been installed on a public web server the following steps must be completed to add UDOIT to your Canvas LMS.
* Create an API developer key
* Create an LTI developer key
* Update the Institutions table
* Install the application

## Docker Compose Base URL
If you are setting up UDOIT for local development through `docker compose`, <YOUR_UDOIT_BASE_URL> in both the API developer key and the LTI developer key above should be set to `http://127.0.0.1:8000/udoit3`.


## Create an API Developer Key
UDOIT requires an API developer key since all course data is gathered through the Canvas API.

### Steps to Create an API Key
1. Navigate to `Developer Keys` in the root account menu.
2. Choose to add a `Developer Key` => `API Key`
3. Provide values for the following fields:
   * Key Name: i.e. UDOIT 3 API
   * Owner Email
   * Redirect URIs: <YOUR_UDOIT_BASE_URL>/authorize/check
   * Redirect URL (Legacy) : *SKIP*
   * Vendor Code : *SKIP*
   * Icon URL: <YOUR_UDOIT_BASE_URL>/build/static/udoit_logo.svg
   * Notes : *Optional*
     * These are only seen by other LMS admins
   * Client Credentials Audience: Canvas
   * Enforce Scopes
     * Check `Allow Include Parameters`
     * See the section below for a list of scopes to enable.
4. Save
5. Click `ON` to enable the newly created key

### Scopes
We strongly recommend you enforce scopes with your API key. The following scopes must be enabled for UDOIT to work.

* accounts
  * url:GET|/api/v1/accounts
  * url:GET|/api/v1/accounts/:id
  * url:GET|/api/v1/accounts/:account_id/sub_accounts
* announcements_api
  * url:GET|/api/v1/announcements
* assignments_api
  * url:GET|/api/v1/courses/:course_id/assignments
  * url:GET|/api/v1/courses/:course_id/assignments/:id
  * url:PUT|/api/v1/courses/:course_id/assignments/:id
* context_module_items_api
  * url:GET|/api/v1/courses/:course_id/modules/:module_id/items
  * url:GET|/api/v1/courses/:course_id/modules/:module_id/items/:id
  * url:PUT|/api/v1/courses/:course_id/modules/:module_id/items/:id
* context_modules_api
  * url:GET|/api/v1/courses/:course_id/modules
  * url:GET|/api/v1/courses/:course_id/modules/:id
  * url:PUT|/api/v1/courses/:course_id/modules/:id
* courses
  * url:PUT|/api/v1/courses/:id
  * url:GET|/api/v1/courses/:id
  * url:POST|/api/v1/courses/:course_id/files
  * url:GET|/api/v1/courses/:course_id/users
* discussion_topics
  * url:GET|/api/v1/courses/:course_id/discussion_topics
  * url:PUT|/api/v1/courses/:course_id/discussion_topics/:topic_id
* discussion_topics_api
  * url:GET|/api/v1/courses/:course_id/discussion_topics/:topic_id
* files
  * url:GET|/api/v1/courses/:course_id/files
  * url:GET|/api/v1/courses/:course_id/files/:id
* quizzes/quiz_questions
  * url:GET|/api/v1/courses/:course_id/quizzes/:quiz_id/questions
  * url:GET|/api/v1/courses/:course_id/quizzes/:quiz_id/questions/:id
  * url:PUT|/api/v1/courses/:course_id/quizzes/:quiz_id/questions/:id
* quizzes/quizzes_api
  * url:GET|/api/v1/courses/:course_id/quizzes
  * url:GET|/api/v1/courses/:course_id/quizzes/:id
  * url:PUT|/api/v1/courses/:course_id/quizzes/:id
* terms_api
  * url:GET|/api/v1/accounts/:account_id/terms
* users
  * url:GET|/api/v1/users/:id
* wiki_pages_api
  * url:GET|/api/v1/courses/:course_id/pages
  * url:GET|/api/v1/courses/:course_id/pages/:url_or_id
  * url:PUT|/api/v1/courses/:course_id/pages/:url_or_id
 
* enrollments_api
  * url:GET|/api/v1/courses/:course_id/enrollments
  *   

## Create an LTI Developer Key
UDOIT uses LTI 1.3 to integrate with the LMS.

### Steps to Create an LTI Key
Follow the steps below, replacing `<YOUR_UDOIT_BASE_URL>` with the `BASE_URL` value from your `.env.local` file.

1. Navigate to `Developer Keys` in the root account menu.
2. Choose to add a `Developer Key` => `LTI Key`
3. Provide values for the following fields:
   * Key Name: i.e. UDOIT 3 LTI
   * Owner Email
   * Redirect URIs: <YOUR_UDOIT_BASE_URL>/lti/authorize/check
   * Configure methods
     * Manual entry
     * Paste JSON URL: <YOUR_UDOIT_BASE_URL>/lti/config
   * If your instance of Canvas is self-hosted, modify the URL under **JWK Method** to point to your Canvas instance.
   * Set Additional Settings
   * Domain: Your UDOIT domain
   * Tool ID: Enter a name
   * Custom Fields
      ```
      lms_id=canvas
      lms_user_id=$Canvas.user.id
      lms_course_id=$Canvas.course.id
      lms_api_domain=$Canvas.api.domain
      ```
4. Click Save.
5. Click `ON` to enable  the newly created key.

## Update the Institutions Table
UDOIT is built to support more than one LMS instance. For this purpose, we have an `institution` table that must be populated with the LMS information.

1. Inside the UDOIT directory, run `cp .ins.env.example .ins.env`
2. open `.ins.env` with a text editor (i.e. Notepad, VS Code, etc.)
3. Fill in the fields with the appropriate values
- `TITLE` = Your institution's name
- `LMS_DOMAIN` = The Canvas domain name of your institution (i.e. `myschool.instructure.com`)
- `LMS_ID` = `canvas`
- `LMS_ACCOUNT_ID` = The Canvas account ID (as a string) where UDOIT will be installed
- `CREATED` = Date in this format: `2021-06-08`
- `STATUS` = `1` if you are using MySQL or MariaDB (or Docker), `true` if you are using PostgreSQL
- `VANITY_URL` = Your LMS vanity URL (i.e. `canvas.myschool.edu`)
- `METADATA` = Optional. Institution-specific settings, such as language or excluded tests. Text representation of a JSON object. (i.e. `{"lang":"en"}`)
- `API_CLIENT_ID` = The ID of the developer API key you created earlier
- `API_CLIENT_SECRET` = The secret for the API key you created earlier

With all the values now set up, you're ready to run the command that will automate the creation of your `institutions` table! Run the following command if you have a MySQL database setup:
```
make ins-mysql
```
Or this one if you have a PostgreSQL setup:
```
make ins-psql
```
Your database should now show a new row in the `institution` table, containing all the values you input above.


## .ENV Setup
For cloud-hosted canvas instances, the default value for the `JWK_BASE_URL` environmental variable will work out of the box. If you are not cloud-hosted, you may need to change the value of this variable in `.env.local` to match your canvas instance.

---
## Install the App
UDOIT now needs to be added to an account in Canvas. Follow these steps to add the LTI tool to an account:
1. Copy the `Client ID` from the developer LTI key created earlier.
2. Navigate to the desired account.
3. Select `Settings` from the left menu.
4. Choose the `Apps` tab.
5. Choose the `View App Configurations` button in the top right corner.
6. Click `+ App`
7. In the dialog that appears, choose "Configuration Type: By Client ID".
8. Paste the `Client ID` from the developer LTI Key you created earlier.
9. Click Submit.

You're done!  "UDOIT" should now appear in the navigation menu of the course (or every course in the account) in which you installed it.  If you installed it on an account, "UDOIT Admin" will also appear in the account navigation menu.
