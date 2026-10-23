-- name: UpsertLMSUserCredential :exec
INSERT INTO lms_user_credential (
  user_id,
  lms_key,
  credential_encryption_key_id,
  encrypted_credential,
  expires_at,
  is_active,
  created_at,
  updated_at
)
VALUES (
  sqlc.arg(user_id),
  sqlc.arg(lms_key),
  sqlc.arg(credential_encryption_key_id),
  sqlc.arg(encrypted_credential),
  sqlc.arg(expires_at),
  1,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  credential_encryption_key_id = VALUES(credential_encryption_key_id),
  encrypted_credential = VALUES(encrypted_credential),
  expires_at = VALUES(expires_at),
  is_active = 1,
  updated_at = NOW();

-- name: GetActiveLMSUserCredentialByUserID :one
SELECT user_id, lms_key, credential_encryption_key_id, encrypted_credential, expires_at, is_active, created_at, updated_at
FROM lms_user_credential
WHERE user_id = sqlc.arg(user_id)
  AND is_active = 1
LIMIT 1;

-- name: GetLMSProviderConfigByTenant :one
SELECT tenant_id, lms_type, encrypted_config, config_encryption_key_id, created_at, updated_at
FROM lms_provider_config
WHERE tenant_id = sqlc.arg(tenant_id)
LIMIT 1;

-- name: UpsertLMSProviderConfigByTenant :exec
INSERT INTO lms_provider_config (tenant_id, lms_type, encrypted_config, config_encryption_key_id)
VALUES (sqlc.arg(tenant_id), sqlc.arg(lms_type), sqlc.arg(encrypted_config), sqlc.arg(config_encryption_key_id))
ON DUPLICATE KEY UPDATE
  lms_type = VALUES(lms_type),
  encrypted_config = VALUES(encrypted_config),
  config_encryption_key_id = VALUES(config_encryption_key_id),
  updated_at = NOW();