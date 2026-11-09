-- name: GetSessionByID :one
SELECT uuid, data
FROM user_session
WHERE uuid = sqlc.arg(uuid)
LIMIT 1;

-- name: DeleteSessionByID :exec
DELETE FROM user_session
WHERE uuid = sqlc.arg(uuid);
