# checks if .ins.env exists and includes it
ifneq (,$(wildcard ./.ins.env))
    include .ins.env
    export
endif

# ──────────────────────────────────────────────
# Variables
# ──────────────────────────────────────────────

COMPOSE := docker compose -f docker-compose.nginx.yml

# ──────────────────────────────────────────────
# Container Management
# ──────────────────────────────────────────────

## Spin up the containers
start:
	$(COMPOSE) up

## Bring down the containers
down:
	$(COMPOSE) down

## Rebuild the containers from the ground up
build:
	$(COMPOSE) up --build

# ──────────────────────────────────────────────
# Database / Migrations
# ──────────────────────────────────────────────

## Generate a migration by diffing the current schema
create-migrations: clean-cache
	$(COMPOSE) run --rm php php bin/console doctrine:migrations:diff

## Validate the mapping files against the schema
validate: clean-cache
	$(COMPOSE) run --rm php php bin/console doctrine:schema:validate

## Dump the SQL needed to update the schema
dump-sql: clean-cache
	$(COMPOSE) run --rm php php bin/console doctrine:schema:update --dump-sql

## Run migrations
## usage: `make migrate` to run all pending, or `make migrate VERSION=20260311150018` for a single migration
migrate:
ifdef VERSION
	$(COMPOSE) run --rm php php bin/console doctrine:migrations:execute --up 'DoctrineMigrations\Version$(VERSION)'
else
	$(COMPOSE) run --rm php php bin/console doctrine:migrations:migrate
endif

## Run all pending migrations up to and including a specific version
## usage: `make migrate-to VERSION=20260311150018`
migrate-to:
	$(COMPOSE) run --rm php php bin/console doctrine:migrations:migrate 'DoctrineMigrations\Version$(VERSION)'

## Revert all migrations after the given version
## usage: `make migrate-down VERSION=20260311150018`
migrate-down:
	$(COMPOSE) run --rm php php bin/console doctrine:migrations:migrate 'DoctrineMigrations\Version$(VERSION)' --no-interaction

# ──────────────────────────────────────────────
# Utilities
# ──────────────────────────────────────────────

## Clear the Symfony cache
clean-cache:
	$(COMPOSE) run --rm php bin/console cache:clear

# ──────────────────────────────────────────────
# Institution Seeding
# ──────────────────────────────────────────────

## Insert institution row (MySQL)
## Reads variables from .ins.env
ins-mysql:
	docker exec -it udoit3-db mysql -u root -proot udoit3 \
		-e "INSERT INTO institution \
			(title, lms_domain, lms_id, lms_account_id, created, status, vanity_url, metadata, api_client_id, api_client_secret) \
			VALUES \
			('$(TITLE)', '$(LMS_DOMAIN)', '$(LMS_ID)', '$(LMS_ACCOUNT_ID)', '$(CREATED)', '$(STATUS)', '$(VANITY_URL)', '$(METADATA)', '$(API_CLIENT_ID)', '$(API_CLIENT_SECRET)');"

## Insert institution row (PostgreSQL)
## Reads variables from .ins.env
ins-psql:
	docker exec -it -e PGPASSWORD=root udoit3-db psql -U root -d udoit3 -w \
		-c "INSERT INTO institution \
			(title, lms_domain, lms_id, lms_account_id, created, status, vanity_url, metadata, api_client_id, api_client_secret) \
			VALUES \
			('$(TITLE)', '$(LMS_DOMAIN)', '$(LMS_ID)', '$(LMS_ACCOUNT_ID)', '$(CREATED)', '$(STATUS)', '$(VANITY_URL)', '$(API_CLIENT_ID)', '$(API_CLIENT_SECRET)');"
