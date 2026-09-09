# Register Tenant Command

Registers a tenant and its LTI registration from a YAML config file.

## Why

The rewrite currently launches through LTI. This command provides a repeatable way to seed/update tenant and registration records for environments.

## Config

Copy the example file:

- `go-rewrite/config/register-tenant.example.yaml`

Expected shape:

```yaml
tenant:
  lms_key: canvas

lti:
  issuer: https://canvas.instructure.com
  client_id: your-client-id
  login_auth_endpoint: https://canvas.instructure.com/api/lti/authorize_redirect
  jwk_endpoint: https://canvas.instructure.com/api/lti/security/jwks
  service_auth_endpoint: https://canvas.instructure.com/login/oauth2/token
  service_login_endpoint: https://canvas.instructure.com/logout
```

## Run

From `go-rewrite/`:

```bash
GO_DATABASE_URL='root:root@tcp(127.0.0.1:3307)/udoit3' go run ./cmd/register-tenant -config ./config/register-tenant.example.yaml
```

Or from the repo root using Docker Compose:

```bash
docker compose -f docker-compose.nginx.yml run --rm register-tenant
```

The compose service expects:

- `go-rewrite/config/register-tenant.yaml` to exist
- `GO_DATABASE_URL` in `.env` to point to `db-new` (for example: `root:root@tcp(db-new:3306)/udoit3`)

## Behavior

- LTI registration is upserted by `(issuer, client_id)`.
- The command prints the resolved `tenant_id`, `lms_key`, `issuer`, and `client_id`.
