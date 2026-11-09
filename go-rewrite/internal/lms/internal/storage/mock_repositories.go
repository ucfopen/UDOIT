package storage

import (
	"context"

	"rewritetest/internal/lms/internal/provider"
	"rewritetest/internal/lms/internal/record"
)

type MockRepositories struct {
	Credential record.LMSCredential
	Attempt    record.AuthAttempt
}

func (m *MockRepositories) ActiveCredential(_ context.Context, userID int64) (record.LMSCredential, bool, error) {
	return m.Credential, m.Credential.UserID == userID && userID != 0, nil
}

func (m *MockRepositories) SaveCredential(_ context.Context, credential record.LMSCredential) error {
	m.Credential = credential
	return nil
}

func (m *MockRepositories) Save(_ context.Context, attempt record.AuthAttempt) error {
	m.Attempt = attempt
	return nil
}

func (m *MockRepositories) Get(_ context.Context, state string) (record.AuthAttempt, bool, error) {
	return m.Attempt, m.Attempt.State == state && state != "", nil
}

var _ provider.CredentialRepository = (*MockRepositories)(nil)
var _ provider.AuthAttemptRepository = (*MockRepositories)(nil)
