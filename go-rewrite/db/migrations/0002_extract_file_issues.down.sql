ALTER TABLE file_item
ADD COLUMN active TINYINT(1) NOT NULL DEFAULT 1,
ADD COLUMN is_available TINYINT(1) NULL,
ADD COLUMN is_hidden TINYINT(1) NULL,
ADD COLUMN reviewed_by_id BIGINT UNSIGNED DEFAULT NULL,
ADD COLUMN reviewed_on DATETIME DEFAULT NULL,
ADD COLUMN reviewed TINYINT(1) NOT NULL DEFAULT 0,
ADD KEY idx_file_item_reviewed_by_id (reviewed_by_id),
ADD CONSTRAINT fk_file_item_reviewed_by_id
  FOREIGN KEY (reviewed_by_id) REFERENCES user(id)
  ON DELETE SET NULL;

UPDATE file_item fi
JOIN file_issue fis ON fis.file_id = fi.id
SET
  fi.reviewed = 1,
  fi.reviewed_by_id = fis.reviewer_id,
  fi.reviewed_on = fis.reviewed_on;

DROP TABLE file_issue;
RENAME TABLE html_issue TO issue;
