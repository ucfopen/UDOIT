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

-- name: GetLastCompletedCourseScan :one
SELECT completed_at
FROM course_scan
WHERE course_id = sqlc.arg(course_id)
  AND completed_at IS NOT NULL
ORDER BY completed_at DESC
LIMIT 1;

-- name: CreateCourseScan :execresult
INSERT INTO course_scan (course_id, scanned_by, started_at)
VALUES (
  sqlc.arg(course_id),
  sqlc.arg(scanned_by),
  sqlc.arg(started_at)
);

-- name: CompleteCourseScan :exec
UPDATE course_scan
SET completed_at = sqlc.arg(completed_at)
WHERE id = sqlc.arg(id);
