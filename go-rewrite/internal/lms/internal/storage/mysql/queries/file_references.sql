-- name: DeleteFileReferencesByContentItemIDs :exec
DELETE FROM file_reference
WHERE content_item_id IN (sqlc.slice('content_item_ids'));

-- name: CreateFileReference :exec
INSERT INTO file_reference (content_item_id, file_id)
VALUES (sqlc.arg('content_item_id'), sqlc.arg('file_id'));
