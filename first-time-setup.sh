#!/bin/bash

docker exec udoit-php-1 sh -c\
	"php bin/console doctrine:migrations:migrate && php bin/console cache:warmup --env=prod"
