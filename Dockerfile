FROM php:8.1-fpm
ARG ENVIRONMENT_TYPE
ARG LIBRE_INSTALL

#Install dependencies and php extensions
RUN apt-get update && apt-get install -y \
        libfreetype6-dev \
        libjpeg62-turbo-dev \
        libpng-dev \
        unzip \
        wget \
        supervisor \
        nano vim \
        less \
        apache2 \
        git \
        cron \
    && docker-php-ext-configure gd  \
    && docker-php-ext-install -j$(nproc) gd \
    && docker-php-ext-install pdo_mysql \
    && docker-php-ext-install pdo_pgsql

#Install Libre Office
RUN if [ "$LIBRE_INSTALL" = "TRUE" ];then apt install -y libreoffice ;else echo "Libre Office was not installed"; fi

#Install node v14
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get update && apt-get install -y nodejs
# install yarn
RUN npm install --global yarn

#Install Apache
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf
RUN apachectl start

#Create user www-data
RUN chsh -s /bin/bash www-data
RUN mkdir -p /var/www/html \
    && chown www-data:www-data /var/www/html \
    && chown www-data:www-data /var/www

#install composer
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

COPY deploy/supervisor/messenger-worker.conf /etc/supervisor/conf.d/messenger-worker.conf

#Install symfony
RUN wget https://get.symfony.com/cli/installer -O - | bash && \
    mv /root/.symfony/bin/symfony /usr/local/bin/symfony

#Copy over files
COPY --chown=www-data:www-data . /var/www/html/

WORKDIR /var/www/html

ENTRYPOINT [ "sh" ,"deploy/udoit-ng.sh"]