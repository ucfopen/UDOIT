#!/bin/bash

# change permissions to /var/www/html
chown -R ssm-user:apache /var/www/html
chmod -R 775 /var/www/html

# remove all files in /var/www/html
rm -rf /var/www/html/*
