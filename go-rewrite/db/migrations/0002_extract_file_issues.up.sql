RENAME TABLE issue TO html_issue;

CREATE TABLE file_issue (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  file_id BIGINT UNSIGNED NOT NULL,
  reviewer_id BIGINT UNSIGNED DEFAULT NULL,
  reviewed_on DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_file_issue_file_id (file_id),
  KEY idx_file_issue_reviewer_id (reviewer_id),
  CONSTRAINT fk_file_issue_file_id
    FOREIGN KEY (file_id) REFERENCES file_item(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_file_issue_reviewer_id
    FOREIGN KEY (reviewer_id) REFERENCES user(id)
    ON DELETE SET NULL
);

INSERT INTO file_issue (file_id, reviewer_id, reviewed_on)
SELECT id, reviewed_by_id, reviewed_on
FROM file_item;

ALTER TABLE file_item
DROP FOREIGN KEY fk_file_item_reviewed_by_id,
DROP INDEX idx_file_item_reviewed_by_id,
DROP COLUMN active,
DROP COLUMN is_available,
DROP COLUMN is_hidden,
DROP COLUMN reviewed_by_id,
DROP COLUMN reviewed_on,
DROP COLUMN reviewed;
