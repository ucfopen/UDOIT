-- name: GetContentItemByID :one
SELECT id, course_id, content_hash, external_id, external_data, created_at, updated_at
FROM content_item
WHERE id = sqlc.arg(id);

-- name: GetContentItemsByCourseID :many
SELECT id, course_id, content_hash, external_id, external_data, created_at, updated_at
FROM content_item
WHERE course_id = sqlc.arg(course_id);

-- name: CreateContentItem :execresult
INSERT INTO content_item (course_id, content_hash, external_id, external_data)
VALUES (
  sqlc.arg(course_id),
  sqlc.arg(content_hash),
  sqlc.arg(external_id),
  sqlc.arg(external_data)
)
ON DUPLICATE KEY UPDATE content_hash = sqlc.arg(content_hash), external_data = sqlc.arg(external_data)