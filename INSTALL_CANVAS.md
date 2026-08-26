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

## Add institution data to the database

UDOIT is built to support more than one LMS instance. There are two supported methods to populating the database with institution data.

### Method 1 (recommended): Create a configuration file

1. Inside the UDOIT directory, run
   ```bash
   cp institution.example.yaml institution.secret.yaml
   ```
2. Open `institution.secret.yaml` in a text editor (i.e. Notepad, VS Code, etc.)
3. Fill in the fields with the appropriate values

- `title`: Your institution's name
- `lms_domain`: The Canvas domain name of your institution (i.e. `myschool.instructure.com`)
- `vanity_url`: Your LMS vanity URL (i.e. `canvas.myschool.edu`)
- `lms_id`: MUST be `canvas`
- `lms_account_id`: The Canvas account ID (as a string) where UDOIT will be installed
- `lti_client_id`: The ID of the developer LTI key you created earlier
- `api_client_id`: The ID of the developer API key you created earlier
- `api_client_secret`: The secret for the API key you created earlier
- `platform`: Can be one of two options
  - Manual entry; specify the following fields
    - `issuer` - The token issuer of your LMS (usually `https://canvas.instructure.com` unless in a test or beta environment)
    - `login_auth_endpoint` - The redirect endpoint specified in your LMS (usually `https://sso.canvaslms.com/api/lti/authorize_redirect` if hosted by Canvas)
    - `service_auth_endpoint` - The OAuth token endpoint of your LMS (usually `https://sso.canvaslms.com/login/oauth2/token` if hosted by Canvas)
    - `service_login_endpoint` - The OAuth login endpoint of your LMS (usually `https://sso.canvaslms.com/login/oauth2/auth` if hosted by Canvas). This is the endpoint that the user will be redirected to during the OAuth process to request consent to use their Canvas API key with the tool
    - `jwk_endpoint` - The JWK endpoint of your LMS (usually `https://sso.canvaslms.com/api/lti/security/jwks` if hosted by Canvas)
  - Use a preset
    - Add a single field called `preset` and populate it with one of the following supported preset options: `Production Canvas`, `Test Canvas`, `Beta Canvas`
    - For example, your `platform` field may look like:
      ```yaml
      platform:
        preset: Test Canvas
      ```
- `keyset` Can be one of two options
  - Specify the following field
    - `generate`: If this field is set to `true`, a new signing keyset will be generated without exception. If it is `false`, the institution's keyset will be set to the keyset in the database with the smallest ID. If no keyset exists, a new one will be created. Use `generate: false` for every institution if you do not want different signing key sets for every institution
    - `existing_id`: The database ID of the keyset that you want to reuse
1. Run the following command in the UDOIT directory to populate the databse with your institution data
   ```bash
   make create-registration FILE="institution.secret.yaml"
   ```

### Method 2: Manual entry through the CLI

1. Inside the UDOIT directory, run

```bash
make create-registration
```
2. Follow the prompts and input required information. You will have to input the same information as required in the file-based initialization but will not have easy access to previously entered information both during and after the process, so using this option is not recommended. It remains an option for temporary or testing purposes.

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
