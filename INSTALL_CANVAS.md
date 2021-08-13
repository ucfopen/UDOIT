# Installing UDOIT in Canvas
Once UDOIT has been installed on a public web server the following steps must be completed to add UDOIT to your Canvas LMS.
* Create an API developer key
* Create an LTI developer key
* Update the Institutions table
* Install the application

**Skills Required**
* Ability to insert MySQL

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
    * <YOUR_UDOIT_BASE_URL>/build/static/udoit_logo.png
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

* Accounts
    * url:GET|/api/v1/accounts
* Assignments
    * url:GET|/api/v1/courses/:course_id/assignments
* Announcements
    * url:GET|/api/v1/announcements
* Courses
    * url:GET|/api/v1/courses/:id
* Discussion Topics
    * url:GET|/api/v1/courses/:course_id/discussion_topics
* Files
    * url:GET|/api/v1/courses/:course_id/files
* Modules
    * url:GET|/api/v1/courses/:course_id/modules
* Pages
    * url:GET|/api/v1/courses/:course_id/pages

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
## Docker-Compose Base URL
If you are setting up UDOIT for local development through docker-compose, <YOUR_UDOIT_BASE_URL> in both the API developer key and the LTI developer key above should be set to `https://localhost:8000`.

---
## Update the Institutions Table
UDOIT is built to support more than one LMS instance. For this purpose we have an `institution` table that must be populated with the LMS information.

**Note:** This step requires knowledge of MySQL.

The following fields need to be populated in the `institution` table.
* title
    * Your institution's name
* lms_domain
    * The Canvas domain name of your institution.
    * Most institutions will use their `.instructure.com` domain.
    * Do not include `https://` or a trailing slash.
    * Example: `myschool.instructure.com`
* lms_id
    * canvas
* lms_account_id
    * The Canvas account ID where UDOIT will be installed.
* created
    * Date in this format: "2021-06-08"
* status
    * 1
* vanity_url
    * Your LMS vanity URL
    * Example: `canvas.myschool.edu`
* api_client_id
    * The ID of the developer API key you created earlier.
    * Client ID is found in the `Details` column on the Developer Keys page
    * Example: 1234500000000001234
* api_client_secret
    * This is also known as the API key.
    * Click `Show Key` for the API key you created earlier.
    * This key will be encrypted and stored as encrypted on the first use of the key.

---
## .ENV Setup
For cloud-hosted canvas instances the default value for the `JWK_BASE_URL` environmental variable will work out of the box. If you are not cloud-hosted, you may need to change the value of this variable in `.env.local` to match your canvas instance.

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
