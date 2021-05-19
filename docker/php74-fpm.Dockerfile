FROM php:7.4-fpm

RUN apt-get update && apt-get install -y \
    zip \
    unzip \
    autoconf \
	git \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
	libpng-dev \
	libpq-dev \
	&& docker-php-ext-configure gd --with-freetype-dir=/usr/include/ --with-jpeg-dir=/usr/include/ \
	&& docker-php-ext-install \
	gd \
	pdo \
	pdo_mysql \
	pdo_pgsql
