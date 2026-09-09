-- name: GetUserByID :one
SELECT id, username, name, preferences
FROM user
WHERE id = sqlc.arg(id)
LIMIT 1;

-- name: CreateUser :execresult
INSERT INTO user (username, name, preferences)
VALUES (sqlc.arg(username), sqlc.arg(name), sqlc.arg(preferences));

-- name: UpdateUser :execrows
UPDATE user
SET
  username = sqlc.arg(username),
  name = sqlc.arg(name),
  preferences = sqlc.arg(preferences)
WHERE id = sqlc.arg(id);
