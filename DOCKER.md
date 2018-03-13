# UDOIT for Docker

## Installation Prerequisites

* [Docker](https://docs.docker.com/install/)
* [Docker Compose](https://docs.docker.com/compose/install/)
* [Docker Machine](https://docs.docker.com/machine/install-machine/)

## Host Configuration

### Setup Docker-Machine

Create a docker-machine for UDOIT, get the environment commands for the new machine, and connect your shell to it:

```
$ docker-machine create udoit
$ docker-machine env udoit
$ eval $(docker-machine env udoit)
```

Then, save the IP address for the newly created docker-machine (E.g. `192.168.99.100`):

```
$ docker-machine ip udoit
```

### NGINX Configuration

Configure [NGINX](docker/nginx.conf)'s server name to point to the machine's IP address by replacing both instances of

```
localhost
```

with

```
<your_ip_address>
```

Generate SSL certificates according to the naming scheme located in the nginx.conf file (`nginx.key` and `nginx.crt`) or use your own SSL certificates:

```
$ sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout docker/nginx.key -out docker/nginx.crt
```

## Start Services using Docker-Compose

Start PHP, MySQL, and NGINX:

```
$ docker-compose up -d
```

Verify everything works by navigating to

```
https://<your_ip_address>
```

The included `docker-compose.yml` automatically builds the latest images of PHP 7.1-FPM, MySQL, and NGINX.

## Development

### PHP

Execute PHP commands on the server using `docker-compose`:

```
$ docker-compose exec php bash
```

Exit by pressing `Ctrl+P` then `Ctrl+Q`

### MySQL

You may access the MySQL database using either `root` or the preconfigured `udoit` user on `<your_ip_address>` and port `3306`.

#### Root access (not advised)

```
username: root
password: udoit
```

#### User access (recommended)

```
username: udoit
password: udoit
```

## Customization

Docker-Compose allows you to change build images, exposed ports, local file linkages, MySQL user accounts, etc. inside the `docker-compose.yml` file.