# checks if .ins.env exists and includes it
ifneq (,$(wildcard ./.ins.env))
    include .ins.env
    export
endif

# spin up the containers
start:
	docker compose -f docker-compose.nginx.yml up


create-migrations:
	make clean-cache
	docker compose -f docker-compose.nginx.yml run --rm php php bin/console doctrine:migrations:diff

validate:
	make clean-cache
	docker compose -f docker-compose.nginx.yml run --rm php php bin/console doctrine:schema:validate

dump-sql:
	make clean-cache
	docker compose -f docker-compose.nginx.yml run --rm php php bin/console doctrine:schema:update --dump-sql

# set up the database
# usage: `make migrate` to run all pending, or `make migrate VERSION=20260311150018` for a single migration
migrate:
ifdef VERSION
	docker compose -f docker-compose.nginx.yml run --rm php php bin/console doctrine:migrations:execute --up 'DoctrineMigrations\Version$(VERSION)'
else
	docker compose -f docker-compose.nginx.yml run --rm php php bin/console doctrine:migrations:migrate
endif

# run all pending migrations up to and including a specific version
# usage: `make migrate-to VERSION=20260311150018`
migrate-to:
	docker compose -f docker-compose.nginx.yml run --rm php php bin/console doctrine:migrations:migrate 'DoctrineMigrations\Version$(VERSION)'

# migrate down to a specific version (reverts all migrations after the given version)
# usage: `make migrate-down VERSION=20260311150018` to revert down to that version.
migrate-down:
	docker compose -f docker-compose.nginx.yml run --rm php php bin/console doctrine:migrations:migrate 'DoctrineMigrations\Version$(VERSION)' --no-interaction

# Down the containers
down:
	docker compose -f docker-compose.nginx.yml down

# rebuild the containers from the ground up
build:
	docker compose -f docker-compose.nginx.yml up --build

# clear the Symfony cache
clean-cache:
	docker compose -f docker-compose.nginx.yml run --rm php bin/console cache:clear

# fill your institutions table data with the variables in your ins.env file. Use this command if you are using mysql.
ins-mysql:
	docker exec -it udoit3-db mysql -u root -proot udoit3 -e "INSERT INTO institution (title, lms_domain, lms_id, lms_account_id, created, status, vanity_url, metadata, api_client_id, api_client_secret) VALUES ('$(TITLE)', '$(LMS_DOMAIN)', '$(LMS_ID)', '$(LMS_ACCOUNT_ID)', '$(CREATED)', '$(STATUS)', '$(VANITY_URL)', '$(METADATA)', '$(API_CLIENT_ID)', '$(API_CLIENT_SECRET)');"

# fill your institutions table data with the variables in your institutions.env file. Use this command if you are using postgresql.
ins-psql:
	docker exec -it -e PGPASSWORD=root udoit3-db psql -U root -d udoit3 -w -c "INSERT INTO institution (title, lms_domain, lms_id, lms_account_id, created, status, vanity_url, metadata, api_client_id, api_client_secret) VALUES ('$(TITLE)', '$(LMS_DOMAIN)', '$(LMS_ID)', '$(LMS_ACCOUNT_ID)', '$(CREATED)', '$(STATUS)', '$(VANITY_URL)', '$(API_CLIENT_ID)', '$(API_CLIENT_SECRET)');"
