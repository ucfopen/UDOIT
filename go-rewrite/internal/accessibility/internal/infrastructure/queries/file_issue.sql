-- name: GetFileIssueByID :one
SELECT id, file_id, reviewer_id, reviewed_on, created_at, updated_at
FROM file_issue
WHERE id = sqlc.arg('id');

-- name: GetFileIssuesByCourseID :many
SELECT fi.id, fi.file_id, fi.reviewer_id, fi.reviewed_on, fi.created_at, fi.updated_at
FROM file_issue fi
JOIN file_item f ON f.id = fi.file_id
WHERE f.course_id = sqlc.arg('course_id');

-- name: GetFileIssueFileIDsByCourseID :many
SELECT fi.file_id
FROM file_issue fi
JOIN file_item f ON f.id = fi.file_id
WHERE f.course_id = sqlc.arg('course_id');

-- name: UpsertFileIssueForCourseFile :exec
INSERT INTO file_issue (file_id)
SELECT file_item.id
FROM file_item
WHERE file_item.id = sqlc.arg('file_id')
  AND file_item.course_id = sqlc.arg('course_id')
  AND file_item.is_replacement = 0
ON DUPLICATE KEY UPDATE file_id = VALUES(file_id);

-- name: DeleteReplacementFileIssuesByCourseID :exec
DELETE fi
FROM file_issue fi
JOIN file_item f ON f.id = fi.file_id
WHERE f.course_id = sqlc.arg('course_id') AND f.is_replacement = 1;

-- name: DeleteFileIssueByFileID :exec
DELETE FROM file_issue
WHERE file_id = sqlc.arg('file_id');

-- name: MarkFileReviewed :exec
UPDATE file_issue
SET
    reviewer_id = sqlc.arg('reviewer_id'),
    reviewed_on = sqlc.arg('reviewed_on'),
    updated_at = sqlc.arg('updated_at')
WHERE id = sqlc.arg('id');
