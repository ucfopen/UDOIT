#! /usr/bin/env bash
#  This script is intended to update our projects composer dependencies.
#  This also runs phpunit tests.

echo Starting composer_depend.sh script...

php composer.phar self-update

php composer.phar update --no-scripts

vendor/phpunit/phpunit/phpunit

echo Finished composer_depend.sh script...