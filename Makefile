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
rebuild:
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

# Show migrations 
# usage: `make migration-list` to show all migrations
migration-list:
	$(COMPOSE) run --rm php php bin/console doctrine:migrations:list

## Run all pending migrations up to and including a specific version
## usage: `make migrate-to VERSION=20260311150018`
migrate-to:
	$(COMPOSE) run --rm php php bin/console doctrine:migrations:migrate 'DoctrineMigrations\Version$(VERSION)'

## Revert the changes of a single migration
## usage: `make migrate-down VERSION=20260311150018`
migrate-down:
	$(COMPOSE) run --rm php php bin/console doctrine:migrations:execute 'DoctrineMigrations\Version$(VERSION)' --down

# ──────────────────────────────────────────────
# Utilities
# ──────────────────────────────────────────────

.PHONY: clean-cache purge-symfony

## Clear the Symfony cache
clean-cache:
	$(COMPOSE) run --rm php bin/console cache:clear
	rm -rf ./var/cache/prod/

purge-symfony:
	rm -rf vendor ./var/cache

frontend-install:
	$(COMPOSE) run --rm yarn yarn install

backend-install:
	$(COMPOSE) run --rm composer composer install --no-interaction --no-progress --optimize-autoloader

install-deps: frontend-install backend-install


.PHONY: admin-panel-retrieve-data

VALID_TABLES := accounts terms courses

admin-panel-retrieve-data: clean-cache
	@if [ -n "$(TABLES)" ] && [ -z "$(filter $(TABLES),$(VALID_TABLES))" ]; then \
		echo "Error: Invalid table(s): '$(TABLES)'"; \
		echo "Usage: make admin-panel-retrieve-data TABLES=\"accounts terms courses\""; \
		echo "Valid tables: $(VALID_TABLES)"; \
		exit 1; \
	fi
	$(COMPOSE) run --rm php php bin/console app:admin-panel-retrieval $(foreach table,$(TABLES),--tables=$(table))

# ──────────────────────────────────────────────
# Formatting and Linting
# ──────────────────────────────────────────────

# All of these commands require dev dependencies to be installed
# Make sure your APP_ENV is "dev" when you install dependencies

# To run these two commands, ensure your node_modules is up to date.
# If it isn't, run frontend-install
frontend-fmt:
	$(COMPOSE) run --rm yarn yarn pretty

frontend-lint:
	$(COMPOSE) run --rm yarn yarn lint

# To run these two commands, ensure your vendor folder is up to date.
# If it isn't, run backend-install
backend-fmt:
	@composer run-script --list | grep -q ''
	$(COMPOSE) run --rm composer composer format

backend-lint:
	$(COMPOSE) run --rm composer composer lint


format: frontend-fmt backend-fmt

lint:
	@frontend_rc=0; backend_rc=0; \
	$(MAKE) frontend-lint || frontend_rc=$$?; \
	$(MAKE) backend-lint || backend_rc=$$?; \
	[ $$frontend_rc -eq 0 ] && [ $$backend_rc -eq 0 ]

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
