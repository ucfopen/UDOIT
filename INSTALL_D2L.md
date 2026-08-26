# Installing UDOIT in D2L Brightspace
Once UDOIT has been installed on a public web server the following steps must be completed to add UDOIT to your LMS.
* Create an API developer key
* Create an LTI developer key
* Update the Institutions table
* Install the application

## Create an API Developer Key

### Steps to Create an API Key

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


---
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
- `lms_domain`: The D2L domain name of your institution (i.e. `myschool.brightspace.com`)
- `vanity_url`: Your LMS vanity URL (i.e. `d2l.myschool.edu`)
- `lms_id`: MUST be `d2l`
- `lms_account_id`: The D2L org unit ID where UDOIT will be installed.
- `lti_client_id`: The ID of the developer LTI key you created earlier
- `api_client_id`: The ID of the developer API key you created earlier
- `api_client_secret`: The secret for the API key you created earlier
- `platform`: Specify the following fields inside the platform field
  - `issuer` - The token issuer of your LMS (usually `https://<tenant>.brightspace.com`)
  - `login_auth_endpoint` - The redirect endpoint specified in your LMS (usually `https://<tenant>.brightspace.com/d2l/lti/authenticate`)
  - `service_auth_endpoint` - The OAuth token endpoint of your LMS (usually `https://auth.brightspace.com/core/connect/token`)
  - `service_login_endpoint` - The OAuth login endpoint of your LMS (usually `https://auth.brightspace.com/oauth2/auth`). This is the endpoint that the user will be redirected to during the OAuth process to request consent to use their D2L API key with the tool
  - `jwk_endpoint` - The JWK endpoint of your LMS (usually `https://<tenant>.brightspace.com/d2l/.well-known/jwks`)
- `keyset` Can be one of two options
  - Specify the following field
    - `generate`: If this field is set to `true`, a new signing keyset will be generated without exception. If it is `false`, the institution's keyset will be set to the keyset in the database with the smallest ID. If no keyset exists, a new one will be created. Use `generate: false` for every institution if you do not want different signing key sets for every institution
    - `existing_id`: The database ID of the keyset that you want to reuse
4. Run the following command in the UDOIT directory to populate the databse with your institution data
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
NEEDS WORK
