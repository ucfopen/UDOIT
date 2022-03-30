#!/bin/bash

set -e

source .env.local

echo "Starting Docker Containers..."
docker-compose up --build -d
if [ "$1" = "--init" ]; then
	echo "Performing database migration..."
	docker exec udoit-php-1 sh -c "php bin/console doctrine:migrations:migrate"
	echo "Database migration complete!"
	echo "Performing one-time database initialization..."
	docker exec udoit-db-1 sh -c\
		"mysql -u udoit -pudoit -Bse 'USE udoit3;INSERT INTO institution (title, lms_domain, lms_id, lms_account_id, created, status, vanity_url, metadata, api_client_id, api_client_secret) VALUES (\"$title\", \"$lms_domain\", \"$lms_id\", \"$lms_account_id\", \"$created\", $status, \"$vanity_url\", \"$metadata\", \"$api_client_id\", \"$api_client_secret\")'"
	echo "One-time database initialization complete!"
fi
if [ "$APP_ENV" = "prod" ]; then
	docker exec udoit-php-1 sh -c "php bin/console cache:warmup --env=prod"
fi
echo 'UDOIT is now running in the background; you can use "docker-compose down" to take UDOIT down.'
