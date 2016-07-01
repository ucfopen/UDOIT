#! /usr/bin/env bash
#  This script is intended to update our projects composer dependencies.

echo Hello udoit

php composer.phar self-update

php composer.phar update