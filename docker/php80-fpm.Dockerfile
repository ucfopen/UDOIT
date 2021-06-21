FROM php:8.0-fpm

RUN apt-get update && apt-get install -y \
    zip \
    unzip \
    autoconf \
	git \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
	libpng-dev \
	libpq-dev \
	&& docker-php-ext-configure gd --with-freetype=/usr/include/ --with-jpeg=/usr/include/ \
	&& docker-php-ext-install \
	gd \
	pdo \
	pdo_mysql \
	pdo_pgsql
