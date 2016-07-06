# Get php 5.6 
FROM php:5.6-alpine

RUN apk update && apk add git

WORKDIR /var/www
