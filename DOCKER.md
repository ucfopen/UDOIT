# UDOIT for Docker

## Installation Prerequisites
* [Docker](https://docs.docker.com/install/)
* [Docker Compose](https://docs.docker.com/compose/install/)
* [Docker Machine](https://docs.docker.com/machine/install-machine/)

## Create and configure docker-machine
1. Create a docker-machine for UDOIT `docker-machine create udoit`
2. Set your environment to the newly created machine `docker-machine env udoit`
3. Configure your shell `eval $(docker-machine env test)`
4. Save your docker-machine's IP address `docker-machine ip udoit` (E.g. 192.168.99.100)

## Configure the web-server
1. Open [docker/nginx.conf](docker/nginx.conf) and replace both instances of `localhost` with the saved docker-machine IP address
2. Generate a self-signed SSL certificate and place the components `domain.crt` and `domain.key` within the [docker](docker) folder

## Start the docker-compose containers
1. Navigate to the root of the local version of this repository and type `docker-compose up -d` in order to start all the services (nginx, MySQL, and PHP 7.1) required in detached mode.
2. Navigate to `https://<ip_address>` using the previously saved IP address to verify everything works correctly.

### More information on docker-compose
* The included docker-compose.yml exposes ports 80 and 443 for HTTP and HTTPS requests. 
* Port 3306 is also exposed to allow for easy debugging of the included MySQL server (you can disable this in the docker-compose file). You may access the MySQL server on that port using the following information:
#### Root access (not advised)
username: `root`
password: `root`
#### User access
username: `udoit`
password: `udoit`