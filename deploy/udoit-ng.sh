#!/bin/sh

# change to the new file location
cd /var/www/html

# copy localConfig from S3 if you are not on local
if [ "$ENVIRONMENT_TYPE" != "local" ]
then
    ##PLACEHOLDER FOR COPYING down .env.local from somewhere when it's not on local##
    # aws s3 cp s3://$S3_BUCKET/udoit/.env.local.$ENVIRONMENT_TYPE /var/www/html/.env.local

    # create .user.ini file for New Relic (PHP-FPM only)
    touch /var/www/html/public/.user.ini
    # add New Relic appname 
    echo -e "\nnewrelic.appname = \"$NEW_RELIC_APP_NAME\"" >> /var/www/html/public/.user.ini
fi

# run composer install
composer install --no-dev --no-interaction --no-progress --optimize-autoloader

# change all file and directory permissions to give apache sufficient access
sudo find /var/www/html -type f -exec chmod 664 {} + -o -type d -exec chmod 775 {} +

# compile JS
yarn install
yarn run encore dev

# start queue monitor
/usr/bin/supervisord

# restart apaches
apachectl restart

#Start PHP-FPM
php-fpm