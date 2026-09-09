-- name: CreateRegistration :exec
INSERT INTO registration (
  issuer,
  client_id,
  tenant_id,
  login_auth_endpoint,
  jwk_endpoint,
  service_auth_endpoint,
  service_login_endpoint
)
VALUES (
  sqlc.arg(issuer),
  sqlc.arg(client_id),
  sqlc.arg(tenant_id),
  sqlc.arg(login_auth_endpoint),
  sqlc.arg(jwk_endpoint),
  sqlc.arg(service_auth_endpoint),
  sqlc.arg(service_login_endpoint)
);

-- name: UpdateRegistration :execrows
UPDATE registration
SET
  tenant_id = sqlc.arg(tenant_id),
  login_auth_endpoint = sqlc.arg(login_auth_endpoint),
  jwk_endpoint = sqlc.arg(jwk_endpoint),
  service_auth_endpoint = sqlc.arg(service_auth_endpoint),
  service_login_endpoint = sqlc.arg(service_login_endpoint)
WHERE issuer = sqlc.arg(issuer)
  AND client_id = sqlc.arg(client_id);

-- name: GetRegistrationByIssuerAndClientID :one
SELECT issuer, client_id, tenant_id, login_auth_endpoint, jwk_endpoint, service_auth_endpoint, service_login_endpoint
FROM registration
WHERE issuer = sqlc.arg(issuer)
  AND client_id = sqlc.arg(client_id)
LIMIT 1;

-- name: GetLTIUserLinkBySubAndIssuer :one
SELECT sub, issuer, user_id
FROM lti_user_link
WHERE sub = sqlc.arg(sub)
  AND issuer = sqlc.arg(issuer)
LIMIT 1;

-- name: CreateLTIUserLink :exec
INSERT INTO lti_user_link (sub, issuer, user_id)
VALUES (sqlc.arg(sub), sqlc.arg(issuer), sqlc.arg(user_id));

-- name: CreateLTICourseLink :exec
INSERT INTO lti_course_link (tenant_id, context_id, course_id)
VALUES (sqlc.arg(tenant_id), sqlc.arg(context_id), sqlc.arg(course_id));

-- name: GetLTICourseLinkByTenantAndContext :one
SELECT tenant_id, context_id, course_id
FROM lti_course_link
WHERE tenant_id = sqlc.arg(tenant_id)
  AND context_id = sqlc.arg(context_id)
LIMIT 1;
