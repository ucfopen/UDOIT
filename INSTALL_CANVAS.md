# Installing UDOIT in Canvas
Once UDOIT has been installed on a public web server the following steps must be completed to add UDOIT to your Canvas LMS.
* Create an API developer key
* Create an LTI developer key
* Update the Institutions table
* Install the application

**Skills Required**
* Ability to insert MySQL (or edit a config file if using Docker)

## Create an API Developer Key
UDOIT requires an API developer key, since all course data is gathered through the Canvas API.

### Steps to Create an API Key
* Navigate to `Developer Keys` in the root account menu.
* Choose to add a `Developer Key` => `API Key`

Provide values for the following fields:
* Key Name
    * i.e. UDOIT 3 API
* Owner Email
* Redirect URIs
    * <YOUR_UDOIT_BASE_URL>/authorize/check
* Redirect URL (Legacy) : *SKIP*
* Vendor Code : *SKIP*
* Icon URL
    * <YOUR_UDOIT_BASE_URL>/build/static/udoit_logo.svg
* Notes : *Optional*
    * These are only seen by other LMS admins
* Test Cluster Only : *SKIP*
* Client Credentials
    * Canvas
* Enforce Scopes
    * See section below for a list of scopes to enable.
    * Check `Allow Include Parameters`
* Save
* Click `ON` to enable the newly created key

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
* courses
    * url:GET|/api/v1/courses/:id
    * url:PUT|/api/v1/courses/:id
    * url:POST|/api/v1/courses/:course_id/files
* discussion_topics
    * url:GET|/api/v1/courses/:course_id/discussion_topics
    * url:PUT|/api/v1/courses/:course_id/discussion_topics/:topic_id
* discussion_topics_api
    * url:GET|/api/v1/courses/:course_id/discussion_topics/:topic_id
* terms_api
    * url:GET|/api/v1/accounts/:account_id/terms
* files
    * url:GET|/api/v1/courses/:course_id/files
    * url:GET|/api/v1/courses/:course_id/files/:id
* context_modules_api
    * url:GET|/api/v1/courses/:course_id/modules
    * url:GET|/api/v1/courses/:course_id/modules/:id
    * url:PUT|/api/v1/courses/:course_id/modules/:id
* context_modules_items_api
    * url:GET|/api/v1/courses/:course_id/modules/:module_id/items
    * url:GET|/api/v1/courses/:course_id/modules/:module_id/items/:id
    * url:PUT|/api/v1/courses/:course_id/modules/:module_id/items/:id
* wiki_pages_api
    * url:GET|/api/v1/courses/:course_id/pages
    * url:GET|/api/v1/courses/:course_id/pages/:url
    * url:GET|/api/v1/groups/:group_id/pages/:url
    * url:PUT|/api/v1/courses/:course_id/pages/:url
* quizzes/quiz_questions
    * url:GET|/api/v1/courses/:course_id/quizzes/:quiz_id/questions
    * url:GET|/api/v1/courses/:course_id/quizzes/:quiz_id/questions/:id
    * url:PUT|/api/v1/courses/:course_id/quizzes/:quiz_id/questions/:id
* quizzes/quizzes_api
    * url:GET|/api/v1/courses/:course_id/quizzes
    * url:GET|/api/v1/courses/:course_id/quizzes/:id
    * url:PUT|/api/v1/courses/:course_id/quizzes/:id
 * users
    * url:GET|/api/v1/users/:id

---
## Create an LTI Developer Key
UDOIT uses LTI 1.3 to integrate with the LMS.

### Steps to Create an LTI Key
* Navigate to `Developer Keys` in the root account menu.
* Choose to add a `Developer Key` => `LTI Key`

Provide values for the following fields:
* Key Name
    * i.e. UDOIT 3 LTI
* Owner Email
* Redirect URIs
    * <YOUR_UDOIT_BASE_URL>/lti/authorize/check
* Notes : *Optional*
    * These are only seen by other LMS admins
* Configure method
    * Enter URL
* JSON URL
    * <YOUR_UDOIT_BASE_URL>/lti/config
* Save
* Click `ON` to enable the newly created key

---
## Update the Institutions Table
UDOIT is built to support more than one LMS instance. For this purpose we have an `institution` table that must be populated with the LMS information.

> **Note:** This step requires manual database configuration unless you're using the Docker installation.

### Manual

The following fields need to be populated in the `institution` table. This involves an `INSERT INTO` query for MySQL.
* title
    * Your institution's name
* lms_domain
    * The Canvas domain name of your institution.
    * Most institutions will use their `.instructure.com` domain.
    * Do not include `https://` or a trailing slash.
    * Example: `myschool.instructure.com`
* lms_id
    * `canvas`
* lms_account_id
    * The Canvas account ID (as a string) where UDOIT will be installed.
* created
    * Date in this format: `"2021-06-08"`
* status
    * `1` if you are using MySQL or MariaDB
    * `true` if you are using PostgreSQL
* vanity_url
    * Your LMS vanity URL
    * Example: `canvas.myschool.edu`
* metadata
    * Optional
    * Institution specific settings, such as language or excluded tests.
    * Text representation of a JSON object.
    * Example: `'{"lang":"es"}'`
    * Currently supported languages are English (en) and Spanish (es).
* api_client_id
    * The ID of the developer API key you created earlier.
    * Client ID is found in the `Details` column on the Developer Keys page
    * Example: 1234500000000001234
* api_client_secret
    * This is also known as the API key.
    * Click `Show Key` for the API key you created earlier.
    * This key will be encrypted and stored as encrypted on the first use of the key.

### Docker
You can use our bundled script to quickly set up the database without having to know MySQL.

First, create `.env.local` from the template.

```bash
cp .env.local.example .env.local
```

Finally, initialize the database and start UDOIT with:
```bash
./udoit.sh --init
```

In the future, you can use `./udoit.sh` without arguments to start UDOIT with Docker.

---
## Install the App
UDOIT now needs to be added to an account in Canvas. Follow these steps to add the LTI tool to an account:
* Copy the `Client ID` from the developer LTI key created earlier.
* Navigate to the desired account.
* Select `Settings` from the left menu.
* Choose the `Apps` tab.
* Choose the `View App Configurations` button in the top right corner.
* Click `+ App`

### Add App
* Configuration Type
    * By Client ID
* Client ID
    * Paste the `Client ID` from the developer LTI key created earlier.
* Submit
