ALTER TABLE lms_user_credential
  ADD COLUMN schema_name VARCHAR(64) NULL AFTER lms_key,
  ADD COLUMN credential_json JSON NULL AFTER schema_name;

UPDATE lms_user_credential
SET
  schema_name = '',
  credential_json = JSON_OBJECT()
WHERE schema_name IS NULL OR credential_json IS NULL;

ALTER TABLE lms_user_credential
  MODIFY COLUMN schema_name VARCHAR(64) NOT NULL,
  MODIFY COLUMN credential_json JSON NOT NULL,
  DROP COLUMN encrypted_credential,
  DROP COLUMN credential_encryption_key_id;

ALTER TABLE lms_provider_config
  ADD COLUMN config_json JSON NULL AFTER lms_type;

UPDATE lms_provider_config
SET config_json = JSON_OBJECT()
WHERE config_json IS NULL;

ALTER TABLE lms_provider_config
  MODIFY COLUMN config_json JSON NOT NULL,
  DROP COLUMN encrypted_config,
  DROP COLUMN config_encryption_key_id;
