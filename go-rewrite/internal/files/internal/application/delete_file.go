package application

import (
	"context"

	"rewritetest/internal/files/internal/domain"
	"rewritetest/internal/lms"
	"rewritetest/internal/shared/apperr"
	"rewritetest/internal/shared/auth"
)

type DeleteFileUseCase struct {
	fileRepository domain.FileRepository
	fileDeleter    LMSFileDeleter
}

type LMSFileDeleter interface {
	DeleteFile(ctx context.Context, principal auth.Principal, req lms.DeleteFileRequest) error
}

func NewDeleteFileUseCase(fileRepository domain.FileRepository, fileDeleter LMSFileDeleter) *DeleteFileUseCase {
	return &DeleteFileUseCase{
		fileRepository: fileRepository,
		fileDeleter:    fileDeleter,
	}
}

func (u *DeleteFileUseCase) Execute(ctx context.Context, principal auth.Principal, fileID int64) error {
	file, err := u.fileRepository.GetFileByID(ctx, fileID)
	if err != nil {
		return err
	}

	if file == nil {
		return apperr.New(apperr.CodeNotFound, "The file could not be deleted because no file was found.")
	}

	err = u.fileDeleter.DeleteFile(ctx, principal, lms.DeleteFileRequest{
		FileID:       file.ID(),
		ExternalID:   file.ExternalID(),
		ExternalData: file.ExternalData(),
	})
	if err != nil {
		return err
	}

	return u.fileRepository.DeleteFile(ctx, file.ID())
}
