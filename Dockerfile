FROM php:5.6-alpine

RUN apk upgrade --update && apk add --no-cache \
	git \
	freetype-dev \
	libjpeg-turbo-dev \
	libpng-dev \
	&& docker-php-ext-configure gd --with-freetype-dir=/usr/include/ --with-jpeg-dir=/usr/include/ \
	&& docker-php-ext-install gd

WORKDIR /var/www
