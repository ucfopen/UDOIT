CREATE TABLE user (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    preferences JSON DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE tenant (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    lms_key VARCHAR(64) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE course (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    tenant_id BIGINT UNSIGNED NOT NULL,
    CONSTRAINT fk_course_tenant_id
        FOREIGN KEY (tenant_id) REFERENCES tenant (id)
        ON DELETE CASCADE,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    is_dirty TINYINT(1) NOT NULL DEFAULT 0,
    external_id VARCHAR(64) NOT NULL,
    external_data JSON DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_course_tenant_id (tenant_id)

);

CREATE TABLE file_item (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    course_id BIGINT UNSIGNED NOT NULL,
    file_name VARCHAR(255) NULL,
    file_type VARCHAR(64) NULL,
    updated_at_lms DATETIME NULL,
    is_available TINYINT(1) NULL,
    is_hidden TINYINT(1) NULL,
    file_size BIGINT NULL,
    download_url TEXT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    reviewed_by_id BIGINT UNSIGNED DEFAULT NULL,
    reviewed_on DATETIME DEFAULT NULL,
    reviewed TINYINT(1) NOT NULL DEFAULT 0,
    external_data JSON DEFAULT NULL,
    external_id VARCHAR(64) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_file_item_course_id (course_id),
    KEY idx_file_item_reviewed_by_id (reviewed_by_id),
    CONSTRAINT fk_file_item_reviewed_by_id
        FOREIGN KEY (reviewed_by_id) REFERENCES user (id)
        ON DELETE SET NULL,
    CONSTRAINT fk_file_item_course_id
        FOREIGN KEY (course_id) REFERENCES course (id)
        ON DELETE CASCADE,
    CONSTRAINT uniq_file_item_course_external
        UNIQUE (course_id, external_id)
);

CREATE TABLE user_session (
    uuid VARCHAR(255) NOT NULL,
    data JSON DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at DATETIME DEFAULT NULL,
    PRIMARY KEY (uuid),
    KEY idx_user_session_expires_at (expires_at)
);

CREATE TABLE registration (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    issuer VARCHAR(255) NOT NULL,
    client_id VARCHAR(255) NOT NULL,
    tenant_id BIGINT UNSIGNED NOT NULL,
    login_auth_endpoint VARCHAR(1024) NOT NULL,
    jwk_endpoint VARCHAR(1024) NOT NULL,
    service_auth_endpoint VARCHAR(1024) NOT NULL,
    service_login_endpoint VARCHAR(1024) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_registration_tenant_id (tenant_id),
    CONSTRAINT fk_registration_tenant_id
        FOREIGN KEY (tenant_id) REFERENCES tenant (id)
        ON DELETE CASCADE,
    UNIQUE KEY uniq_registration_issuer_client (issuer, client_id)
);

CREATE TABLE lti_user_link (
    sub VARCHAR(191) NOT NULL,
    issuer VARCHAR(191) NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (sub, issuer),
    KEY idx_lti_user_link_user_id (user_id),
    CONSTRAINT fk_lti_user_link_user_id
        FOREIGN KEY (user_id) REFERENCES user (id)
        ON DELETE CASCADE
);

CREATE TABLE lti_course_link (
    tenant_id BIGINT UNSIGNED NOT NULL,
    context_id VARCHAR(191) NOT NULL,
    course_id BIGINT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (tenant_id, context_id),
    KEY idx_lti_course_link_course_id (course_id),
    CONSTRAINT fk_lti_course_link_tenant_id
        FOREIGN KEY (tenant_id) REFERENCES tenant (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_lti_course_link_course_id
        FOREIGN KEY (course_id) REFERENCES course (id)
        ON DELETE CASCADE
);

CREATE TABLE lms_user_credential (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    lms_key VARCHAR(64) NOT NULL,
    schema_name VARCHAR(64) NOT NULL,
    credential_json JSON NOT NULL,
    expires_at DATETIME DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_lms_user_credential_user_lms (user_id, lms_key),
    KEY idx_lms_user_credential_user_active (user_id, is_active),
    CONSTRAINT fk_lms_user_credential_user_id
        FOREIGN KEY (user_id) REFERENCES user (id)
        ON DELETE CASCADE
);

CREATE TABLE lms_provider_config (
    tenant_id BIGINT UNSIGNED NOT NULL,
    lms_type VARCHAR(64) NOT NULL,
    config_json JSON NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (tenant_id),
    CONSTRAINT fk_lms_provider_config_tenant_id
        FOREIGN KEY (tenant_id) REFERENCES tenant (id)
        ON DELETE CASCADE
);

CREATE TABLE content_item (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    course_id BIGINT UNSIGNED NOT NULL,
    content_hash VARCHAR(255) NOT NULL,
    external_id VARCHAR(64) NOT NULL,
    external_data JSON NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_content_item_course_id (course_id),
    CONSTRAINT fk_content_item_course_id
        FOREIGN KEY (course_id) REFERENCES course (id)
        ON DELETE CASCADE,
    CONSTRAINT uniq_content_item_course_external
        UNIQUE (course_id, external_id)
);

CREATE TABLE issue (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    content_item_id BIGINT UNSIGNED NOT NULL,
    scan_rule VARCHAR(255) NOT NULL,
    content_xpath VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    severity VARCHAR(255) NOT NULL,
    fixed_by BIGINT UNSIGNED DEFAULT NULL,
    fixed_at DATETIME DEFAULT NULL,
    details JSON NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_issue_content_item_id (content_item_id),
    KEY idx_issue_fixed_by (fixed_by),
    CONSTRAINT fk_issue_content_item_id
        FOREIGN KEY (content_item_id) REFERENCES content_item (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_issue_fixed_by
        FOREIGN KEY (fixed_by) REFERENCES user (id)
        ON DELETE SET NULL
);

CREATE TABLE report (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    course_id BIGINT UNSIGNED NOT NULL,
    error_count INT UNSIGNED NOT NULL,
    suggestion_count INT UNSIGNED NOT NULL,
    file_count INT UNSIGNED NOT NULL,
    scanned_by BIGINT UNSIGNED NOT NULL,
    content_fixed BIGINT UNSIGNED NOT NULL,
    content_resolved BIGINT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_report_course_id (course_id),
    KEY idx_report_scanned_by (scanned_by),
    CONSTRAINT fk_report_course_id
        FOREIGN KEY (course_id) REFERENCES course (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_report_scanned_by
        FOREIGN KEY (scanned_by) REFERENCES user (id)
        ON DELETE CASCADE
);
