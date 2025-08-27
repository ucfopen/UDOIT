# checks if .ins.env exists and includes it
ifneq (,$(wildcard ./.ins.env))
    include .ins.env
    export
endif

# spin up the containers
start:
	docker compose -f docker-compose.nginx.yml up

# set up the database
migrate:
	docker compose -f docker-compose.nginx.yml run php php bin/console doctrine:migrations:migrate

# Down the containers
down:
	docker compose -f docker-compose.nginx.yml down

# clear the Symfony cache
clean-cache:
	docker compose -f docker-compose.nginx.yml run php bin/console cache:clear

# fill your institutions table data with the variables in your ins.env file. Use this command if you are using mysql.
ins-mysql:
	docker exec -it udoit3-db mysql -u root -proot udoit3 -e "INSERT INTO institution (title, lms_domain, lms_id, lms_account_id, created, status, vanity_url, metadata, api_client_id, api_client_secret) VALUES ('$(TITLE)', '$(LMS_DOMAIN)', '$(LMS_ID)', '$(LMS_ACCOUNT_ID)', '$(CREATED)', '$(STATUS)', '$(VANITY_URL)', '$(METADATA)', '$(API_CLIENT_ID)', '$(API_CLIENT_SECRET)');"

# fill your institutions table data with the variables in your institutions.env file. Use this command if you are using postgresql.
ins-psql:
	docker exec -it -e PGPASSWORD=root udoit3-db psql -U root -d udoit3 -w -c "INSERT INTO institution (title, lms_domain, lms_id, lms_account_id, created, status, vanity_url, metadata, api_client_id, api_client_secret) VALUES ('$(TITLE)', '$(LMS_DOMAIN)', '$(LMS_ID)', '$(LMS_ACCOUNT_ID)', '$(CREATED)', '$(STATUS)', '$(VANITY_URL)', '$(API_CLIENT_ID)', '$(API_CLIENT_SECRET)');"

# run rotate keys
rotate-keys:
	docker exec -it udoit3-php php scripts/rotate-keys.php $$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' udoit3-db)