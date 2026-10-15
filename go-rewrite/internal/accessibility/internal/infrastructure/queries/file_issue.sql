-- name: DeleteFileIssuesByCourseID :exec
DELETE fi
FROM file_issue fi
JOIN file_item f ON f.id = fi.file_id
WHERE f.course_id = sqlc.arg('course_id');

-- name: CreateFileIssue :exec
INSERT INTO file_issue (file_id)
VALUES (sqlc.arg('file_id'));

-- name: GetFileIssueByID :one
SELECT id, file_id, reviewer_id, reviewed_on, created_at, updated_at
FROM file_issue
WHERE id = sqlc.arg('id');

-- name: MarkFileReviewed :exec
UPDATE file_issue
SET
    reviewer_id = sqlc.arg('reviewer_id'),
    reviewed_on = sqlc.arg('reviewed_on'),
    updated_at = sqlc.arg('updated_at')
WHERE id = sqlc.arg('id');
