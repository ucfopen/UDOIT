-- name: CreateReport :exec
INSERT INTO report (id, course_id, error_count, suggestion_count, file_count, scanned_by, content_fixed, content_resolved)
VALUES (
  sqlc.arg(id),
  sqlc.arg(course_id),
  sqlc.arg(error_count),
  sqlc.arg(suggestion_count),
  sqlc.arg(file_count),
  sqlc.arg(scanned_by),
  sqlc.arg(content_fixed),
  sqlc.arg(content_resolved)
)