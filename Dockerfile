# Get php 5.6 
FROM php:5.6

RUN apt-get update && apt-get install git-core -y
RUN apt-get autoremove -y && apt-get clean

# ADD composer.phar /var/www/composer.phar
# RUN php /tmp/composer.phar self-update
# ADD composer.json /var/www/composer.json
# RUN php /tmp/composer.phar update /tmp/composer.json

ADD composer_depend.sh /composer_depend.sh 
RUN chmod +x /composer_depend.sh


WORKDIR /var/www
