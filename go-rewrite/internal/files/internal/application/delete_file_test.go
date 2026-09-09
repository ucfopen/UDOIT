package application

import (
	"context"
	"testing"
	"time"

	"rewritetest/internal/files/internal/domain"
	"rewritetest/internal/files/internal/infrastructure"
	"rewritetest/internal/lms"
	"rewritetest/internal/shared/apperr"
	"rewritetest/internal/shared/auth"

	"github.com/stretchr/testify/require"
)

type mockFileDeleter struct {
	deletedFileRequests []lms.DeleteFileRequest
	err                 error
}

var _ LMSFileDeleter = (*mockFileDeleter)(nil)

func (m *mockFileDeleter) DeleteFile(ctx context.Context, principal auth.Principal, req lms.DeleteFileRequest) error {
	m.deletedFileRequests = append(m.deletedFileRequests, req)
	return m.err
}

func TestDeleteFile_Success(t *testing.T) {
	fileRepo := infrastructure.NewArrayMockFileRepository()
	mockDeleter := &mockFileDeleter{}

	file := domain.RehydrateFile(1, 1, "", "", time.Now(), 0, "", "", nil)
	fileRepo.SeedFiles(file)

	uc := NewDeleteFileUseCase(fileRepo, mockDeleter)
	err := uc.Execute(context.Background(), auth.Principal{AgentID: 1}, file.ID())
	require.NoError(t, err)
	require.Len(t, mockDeleter.deletedFileRequests, 1)
	require.Equal(t, file.ID(), mockDeleter.deletedFileRequests[0].FileID)
}

func TestDeleteFile_FileNotFoundReturnsNotFoundError(t *testing.T) {
	fileRepo := infrastructure.NewArrayMockFileRepository()
	mockDeleter := &mockFileDeleter{}

	uc := NewDeleteFileUseCase(fileRepo, mockDeleter)
	err := uc.Execute(context.Background(), auth.Principal{AgentID: 1}, 999)

	require.Error(t, err)
	require.True(t, apperr.IsCode(err, apperr.CodeNotFound))
}

func TestDeleteFile_DeletesFileFailsWhenDeleterReturnsError(t *testing.T) {
	fileRepo := infrastructure.NewArrayMockFileRepository()
	mockDeleter := &mockFileDeleter{err: apperr.New(apperr.CodeInternal, "delete failed")}

	file := domain.RehydrateFile(1, 1, "", "", time.Now(), 0, "", "", nil)
	fileRepo.SeedFiles(file)

	uc := NewDeleteFileUseCase(fileRepo, mockDeleter)
	err := uc.Execute(context.Background(), auth.Principal{AgentID: 1}, file.ID())

	require.Error(t, err)
	require.True(t, apperr.IsCode(err, apperr.CodeInternal))
	require.Len(t, mockDeleter.deletedFileRequests, 1)
	require.Equal(t, file.ID(), mockDeleter.deletedFileRequests[0].FileID)
}
