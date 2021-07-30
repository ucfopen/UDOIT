FROM php:8.0-alpine

RUN apk upgrade --update && apk add --no-cache \
	autoconf \
	build-base \
	freetype-dev \
	git \
	libjpeg-turbo-dev \
	libpng-dev \
	postgresql-dev \
	&& docker-php-ext-configure gd --with-freetype=/usr/include/ --with-jpeg=/usr/include/ \
	&& docker-php-ext-install \
	gd \
	pdo_mysql \
	pdo_pgsql

RUN pecl install xdebug && \
	docker-php-ext-enable xdebug

WORKDIR /var/www
