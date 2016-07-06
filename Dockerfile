# Get php 5.6 
FROM php:5.6

RUN apt-get update && apt-get install git-core -y
RUN apt-get autoremove -y && apt-get clean

# build a dev environment

ADD composer_depend.sh /composer_depend.sh 
RUN chmod +x /composer_depend.sh

WORKDIR /var/www
