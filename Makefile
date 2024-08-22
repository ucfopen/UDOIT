ifneq (,$(wildcard ./.ins.env))
    include .ins.env
    export
endif

start:
	docker compose -f docker-compose.nginx.yml up -d

migrate:
	docker compose -f docker-compose.nginx.yml run php php bin/console doctrine:migrations:migrate

down:
	docker compose -f docker-compose.nginx.yml down

ins-mysql:
	docker exec -it udoit3-db mysql -u root -proot udoit3 -e "INSERT INTO institution (title, lms_domain, lms_id, lms_account_id, created, status, vanity_url, metadata, api_client_id, api_client_secret) VALUES ('$(TITLE)', '$(LMS_DOMAIN)', '$(LMS_ID)', '$(LMS_ACCOUNT_ID)', '$(CREATED)', '$(STATUS)', '$(VANITY_URL)', '$(METADATA)', '$(API_CLIENT_ID)', '$(API_CLIENT_SECRET)');"

ins-psql:
	docker exec -it -e PGPASSWORD=root udoit3-db psql -U root -d udoit3 -w -c "INSERT INTO institution (title, lms_domain, lms_id, lms_account_id, created, status, vanity_url, metadata, api_client_id, api_client_secret) VALUES ('$(TITLE)', '$(LMS_DOMAIN)', '$(LMS_ID)', '$(LMS_ACCOUNT_ID)', '$(CREATED)', '$(STATUS)', '$(VANITY_URL)', '$(API_CLIENT_ID)', '$(API_CLIENT_SECRET)');"
