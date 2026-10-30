CREATE TABLE file_reference (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  content_item_id BIGINT UNSIGNED NOT NULL,
  file_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT uniq_file_reference_content_file UNIQUE (content_item_id, file_id),
  KEY idx_file_reference_content_item_id (content_item_id),
  KEY idx_file_reference_file_id (file_id),
  CONSTRAINT fk_file_reference_content_item_id
    FOREIGN KEY (content_item_id) REFERENCES content_item(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_file_reference_file_id
    FOREIGN KEY (file_id) REFERENCES file_item(id)
    ON DELETE CASCADE
);
