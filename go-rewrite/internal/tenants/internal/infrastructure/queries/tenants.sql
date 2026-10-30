-- name: CreateTenant :execresult
INSERT INTO tenant (lms_key)
VALUES (sqlc.arg(lms_key));

-- name: GetByID :one
SELECT id, lms_key
FROM tenant
WHERE id = sqlc.arg(id);