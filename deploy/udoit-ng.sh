#!/bin/bash

# change to the new file location
cd /var/www/html

# copy localConfig from S3 if you are not on local
if [ "$ENVIORNMENT_TYPE" != "local" ]
then
    aws s3 cp s3://cidilabs-devops/udoit3/.env.local.$ENVIORNMENT_TYPE /var/www/html/.env.local
fi

# run composer install
composer install --no-dev --no-interaction --no-progress --optimize-autoloader

# change all file and directory permissions to give apache sufficient access
sudo find /var/www/html -type f -exec chmod 664 {} + -o -type d -exec chmod 775 {} +

# only setup newrelic if not on local.
if [ "$ENVIORNMENT_TYPE" != "local" ]
then
    # create .user.ini file for New Relic (PHP-FPM only)
    touch /var/www/html/public/.user.ini
    # add New Relic appname 
    echo -e "\nnewrelic.appname = \"$NEW_RELIC_APP_NAME\"" >> /var/www/html/public/.user.ini
fi

# compile JS
yarn install
yarn run encore dev

# start queue monitor
/usr/bin/supervisord

# restart apaches
# apachectl restart
