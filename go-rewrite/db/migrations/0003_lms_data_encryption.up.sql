-- Non-production rewrite: old plaintext credential/config rows are discarded
-- because SQL migrations cannot perform application-level envelope encryption.
DELETE FROM lms_user_credential;
DELETE FROM lms_provider_config;

ALTER TABLE lms_user_credential
  DROP COLUMN credential_json,
  DROP COLUMN schema_name,
  ADD COLUMN encrypted_credential BLOB NOT NULL,
  ADD COLUMN credential_encryption_key_id VARCHAR(255) NOT NULL DEFAULT 'envelope-v1';

ALTER TABLE lms_provider_config
  DROP COLUMN config_json,
  ADD COLUMN encrypted_config BLOB NOT NULL,
  ADD COLUMN config_encryption_key_id VARCHAR(255) NOT NULL DEFAULT 'envelope-v1';
