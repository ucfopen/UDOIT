-- name: DeleteFileIssuesByCourseID :exec
DELETE fi
FROM file_issue fi
JOIN file_item f ON f.id = fi.file_id
WHERE f.course_id = sqlc.arg('course_id');

-- name: CreateFileIssue :exec
INSERT INTO file_issue (file_id)
VALUES (sqlc.arg('file_id'));
