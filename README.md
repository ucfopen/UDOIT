# UDOIT NG

### Prerequisites

 - PHP 7.4
 - Symfony
 - Composer
 - Node v14,Yarn
 - MYSQL v5.7/MariaDB

## Basic setup for local
Clone repo and run 

    composer install

from inside repo. Next make sure you have a database with a user setup in your .env.local. If you want to create it with doctrine you can run php bin/console doctrine:database:create.

    php bin/console doctrine:migrations:migrate
 You may need to force them with if you are getting errors

    php bin/console doctrine:schema:update --force
    
### setup with Canvas
#### LTI Developer Key
On the canvas side you will want to go to Developer Keys under Admin. Here you will create a new LTI Key. This is where you will specify the URL that goes with your local. Here are example values
Redirect URI's:

    https://udoit.example/lti/authorize/check

Target Link URI:

    https://udoit.example/dashboard

OpenID Connect Initiation Url:

    https://udoit.example/lti/authorize

JWK Method:
Public JWK URL
Public JWK URL:

    https://canvas.instructure.com/api/lti/security/jwks

Then under Additional settings
Domain:

    udoit.example

tool id:

    lti_test

Custom Fields:

    lms_id=canvas
    lms_user_id=$Canvas.user.id
    lms_course_id=$Canvas.course.id
    lms_api_domain=$Canvas.api.domain

Switch Privacy Level to Public
Under LTI Advantage Services check everything except Can view Progress records associated with the context the tool is installed in
Then under placements make sure you have Account Navigation, Link Selection and Course Navigation or it will not show up in your course.
#### API Developer Key
Now go back to the Developer Keys and find the Cidi Labs Tools and edit it and add your Redirect URI's in there. For example I would add at the bottom:

    https://udoit.example/authorize/check
And hit save. From here you will need to locate your Key ID. This is above the Show Key button on the Developer Keys page. Copy this ID,It should be 17 digits. You can add under you sub-Account or under the course itself. It will be Settings -> Apps. On the right hand side you will see a button that says View App Configurations, click that. Click the + App button and switch Configuration Type to By Client ID and in the Client ID box put in the 17 digit ID you copied before, then hit submit.
### Local Proxy
This is where you will setup a proxy and url(https://udoit.example) for your local to go to. This is where you will want to use symfony serve -d and most likely you will need to run symfony server:ca:install to enable TLS. You will want to run symfony proxy:start however setting it up with your host system and symfony would be better with a link to their [documentation](https://symfony.com/doc/current/setup/symfony_server.html#local-domain-names). You would also want to run a yarn watch.

After having all this setup you should be able to see the UDOIT NG

### .env.local
Make sure that you have your .env.local setup with the correct variables
    
    DATABASE_URL=mysql://example:example@127.0.0.1:3306/example
    
    APP_LMS=canvas
    APP_ENV=dev
    ###> udoit ###
    APP_LMS=canvas
    APP_OAUTH_REDIRECT_URL="https://udoit.example/authorize/check"
    APP_LTI_REDIRECT_URL="https://udoit.example/lti/authorize/check"
    
    ###> base url ###
    # Base URL for client callbacks 
    BASE_URL="https://udoit.example"
    ###> base url ###