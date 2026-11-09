ALTER TABLE content_item
    ADD COLUMN content_changed_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);

CREATE TABLE course_scan (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    course_id BIGINT UNSIGNED NOT NULL,
    scanned_by BIGINT UNSIGNED NOT NULL,
    started_at DATETIME(6) NOT NULL,
    completed_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    KEY idx_course_scan_course_completed (course_id, completed_at),
    CONSTRAINT fk_course_scan_course_id
        FOREIGN KEY (course_id) REFERENCES course (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_course_scan_scanned_by
        FOREIGN KEY (scanned_by) REFERENCES user (id)
        ON DELETE CASCADE
);
