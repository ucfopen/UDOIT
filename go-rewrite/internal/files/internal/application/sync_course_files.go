package application

import (
	"context"

	"rewritetest/internal/files/internal/domain"
)

type SyncCourseFilesUseCase struct {
	fileRepository domain.FileRepository
}

func NewSyncCourseFilesUseCase(fileRepository domain.FileRepository) *SyncCourseFilesUseCase {
	return &SyncCourseFilesUseCase{
		fileRepository: fileRepository,
	}
}

func (u *SyncCourseFilesUseCase) Execute(ctx context.Context, courseID int64, files []domain.CourseFileSyncRecord) error {
	return u.fileRepository.UpsertByCourse(ctx, courseID, files)
}
