FROM php:8.1-fpm

# PHP extensions
RUN apt-get update && apt-get install -y libpq-dev libpng-dev zlib1g-dev git unzip
RUN docker-php-ext-install gd pgsql pdo pdo_pgsql