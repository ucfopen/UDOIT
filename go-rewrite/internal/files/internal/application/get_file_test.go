package application

import (
	"context"
	"testing"
	"time"

	"rewritetest/internal/files/internal/domain"
	"rewritetest/internal/files/internal/infrastructure"

	"rewritetest/internal/shared/apperr"

	"github.com/stretchr/testify/require"
)

func TestGetFile_Success(t *testing.T) {
	fileRepo := infrastructure.NewArrayMockFileRepository()

	file := domain.RehydrateFile(1, 1, "", "", time.Now(), 0, "", "", nil)
	fileRepo.SeedFiles(file)

	uc := NewGetFileUseCase(fileRepo)
	gotFile, err := uc.Execute(context.Background(), file.ID())
	require.NoError(t, err)
	require.Equal(t, file.ID(), gotFile.ID)
}

func TestGetFile_FileNotFoundReturnsNotFoundError(t *testing.T) {
	fileRepo := infrastructure.NewArrayMockFileRepository()

	uc := NewGetFileUseCase(fileRepo)
	_, err := uc.Execute(context.Background(), 999)

	require.Error(t, err)
	require.True(t, apperr.IsCode(err, apperr.CodeNotFound))
}
