FROM php:8.1-fpm
ARG ENVIRONMENT_TYPE

#Install dependencies and php extensions
RUN apt-get update && apt-get install -y \
        git \
        libfreetype6-dev \
        libjpeg62-turbo-dev \
        libpng-dev \
        libpq-dev \
        unzip \
        wget \
        supervisor \
        apache2 \
    && docker-php-ext-configure gd  \
    && docker-php-ext-install -j$(nproc) gd \
    && docker-php-ext-install pdo_mysql \
    && docker-php-ext-install pdo_pgsql

#Install AWS CLI v2
RUN if [ "$ENVIRONMENT_TYPE" != "local" ] ;then  \
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
        && unzip awscliv2.zip \
        && ./aws/install\
    ;fi
#Install node v14
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get update && apt-get install -y nodejs
# install yarn
RUN npm install --global yarn

RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf
RUN apachectl start

#Create user ssm-user
RUN useradd -ms /bin/bash ssm-user
RUN mkdir -p /var/www/html \
    && chown ssm-user:www-data /var/www/html

#install composer
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

#Install symfony
RUN wget https://get.symfony.com/cli/installer -O - | bash && \
    mv /root/.symfony/bin/symfony /usr/local/bin/symfony

#Copy over files
COPY --chown=ssm-user:www-data . /var/www/html/

WORKDIR /var/www/html
#run setup script
RUN chmod +x deploy/udoit-ng.sh
RUN deploy/udoit-ng.sh

CMD php-fpm
