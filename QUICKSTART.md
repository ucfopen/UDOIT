# Quickstart Guide

> For non-Docker configuration instructions, see [INSTALL.md](./INSTALL.md).

> For instructions to set up a development environment, see [HEROKU.md](./HEROKU.md).

This is the easiest way to get UDOIT set up for production. The sections should be followed in sequence.

You will need:

- [Git](https://git-scm.com/downloads)
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Downloading UDOIT

Verify [Git](https://git-scm.com/downloads) is installed:
```bash
git --version
```

Download the source code:
```bash
git clone https://github.com/UCFOPEN/udoit.git
```

Enter the created directory:
```bash
cd UDOIT
```

## Starting UDOIT

Bring UDOIT up with
```bash
docker-compose up --build
```

Navigate to [http://localhost/lti/config](http://localhost/lti/config). You should see a plain white page with some text, beginning with `{"title":"UDOIT 3"`.

You should type Ctrl+C to exit the Docker Compose process for further configuration.

## Configuring Canvas

Follow the instructions in [INSTALL_CANVAS.md](./INSTALL_CANVAS.md) to initialize the database and add the app to Canvas.

## Running UDOIT

UDOIT should now be fully configured! Use

```bash
docker-compose up --build -d
```

to spawn UDOIT as a daemon in the background, and

```bash
docker-compose down
```

to take UDOIT offline.

> You can also use `docker-compose up --build` as before, but many server environments will kill non-backgrounded interactive programs if you exit the session.

If you're developing UDOIT, hot-reloading for PHP files is enabled, but edits to the React side of the project require a rebuild.

## FAQ

> How can I access the the database or PHP containers directly?

```bash
# php
docker exec -it udoit-php-1 /bin/bash
# database
docker exec -it udoit-db-1 /bin/bash
```

> How can I take down UDOIT without Ctrl+C?

```bash
# if not in the UDOIT folder
cd <path to UDOIT>
docker-compose down
```

> I'm having issues related to JWK or authentication.

Try setting `JWK_BASE_URL` to the domain of your **Canvas** installation. If you haven't created `.env.local`, do so now:

```bash
cp .env.local.example .env.local
```

Then, set the `JWK_BASE_URL` variable to the base URL of your **Canvas** installation.

```bash
echo "JWK_BASE_URL=\"https://canvas.instructure.com\" >> .env.local"
```
