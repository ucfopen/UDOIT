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
## Update the Institutions Table
UDOIT is built to support more than one LMS instance. For this purpose we have an `institution` table that must be populated with the LMS information. 

**Note:** This step requires knowledge of MySQL. 

The following fields need to be populated in the `institution` table.
* title
    * Your institution's name
* lms_domain
    * The D2L domain name of your institution.
    * Do not include `https://` or a trailing slash. 
    * Example: `myschool.d2l.com`
* lms_id
    * d2l
* lms_account_id
    * The D2L org unit ID where UDOIT will be installed.
* created
    * Date in this format: "2021-06-08"
* status
    * 1
* vanity_url
    * Your LMS vanity URL
    * Example: `d2l.myschool.edu`
* api_client_id
* api_client_secret
    * This key will be encrypted and stored as encrypted on the first use of the key.

---
## Install the App
NEEDS WORK
