-- name: DeleteHTMLIssuesByContentItemIDs :exec
DELETE FROM html_issue WHERE content_item_id IN (sqlc.slice('content_item_ids'));

-- name: CreateIssue :exec
INSERT INTO html_issue (content_item_id, scan_rule, content_xpath, status, severity, fixed_by, fixed_at, details)
VALUES (
  sqlc.arg('content_item_id'),
  sqlc.arg('scan_rule'),
  sqlc.arg('content_xpath'),
  sqlc.arg('status'),
  sqlc.arg('severity'),
  sqlc.arg('fixed_by'),
  sqlc.arg('fixed_at'),
  sqlc.arg('details')
);

-- name: GetHTMLIssuesByCourseID :many
SELECT i.id, i.content_item_id, i.scan_rule, i.content_xpath, i.status, i.severity, i.fixed_by, i.fixed_at, i.details, i.created_at, i.updated_at
FROM html_issue i
JOIN content_item ci ON i.content_item_id = ci.id
WHERE ci.course_id = sqlc.arg('course_id');