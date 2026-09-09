package files

import (
	"context"
	"database/sql"
	"time"

	"rewritetest/internal/files/internal"
	"rewritetest/internal/files/internal/application"
	"rewritetest/internal/files/internal/domain"
	"rewritetest/internal/files/internal/infrastructure"
	"rewritetest/internal/lms"

	"github.com/gin-gonic/gin"
)

type Module struct {
	handler        *internal.Handler
	fileRepository domain.FileRepository
}

func New(db *sql.DB, fileDeleter application.LMSFileDeleter) *Module {
	fileRepository := infrastructure.NewMySQLFileRepository(db)
	getFileUseCase := application.NewGetFileUseCase(fileRepository)
	deleteFileUseCase := application.NewDeleteFileUseCase(fileRepository, fileDeleter)
	handler := internal.NewHandler(getFileUseCase, deleteFileUseCase)

	return &Module{
		handler:        handler,
		fileRepository: fileRepository,
	}
}

func (m *Module) RegisterRoutes(rg *gin.RouterGroup) {
	m.handler.RegisterRoutes(rg)
}

func (m *Module) SyncCourseFiles(ctx context.Context, courseID int64, files []lms.FileItemDTO) error {
	records := make([]domain.CourseFileSyncRecord, len(files))
	for i, file := range files {
		records[i] = domain.CourseFileSyncRecord{
			FileName:     file.FileName,
			FileType:     file.FileType,
			UpdatedAt:    file.UpdatedAt.Format(time.RFC3339),
			FileSize:     file.FileSize,
			DownloadURL:  file.DownloadURL,
			ExternalID:   file.ExternalID,
			ExternalData: file.ExternalData,
		}
	}

	return m.fileRepository.UpsertByCourse(ctx, courseID, records)
}

func (m *Module) GetByCourseID(ctx context.Context, courseID int64) ([]lms.FileItemDTO, error) {
	files, err := m.fileRepository.GetByCourseID(ctx, courseID)
	if err != nil {
		return nil, err
	}

	result := make([]lms.FileItemDTO, len(files))
	for i, f := range files {
		result[i] = lms.FileItemDTO{
			ID:           f.ID(),
			FileName:     f.FileName(),
			FileType:     f.FileType(),
			UpdatedAt:    f.UpdatedAt(),
			FileSize:     f.FileSize(),
			DownloadURL:  f.DownloadURL(),
			ExternalID:   f.ExternalID(),
			ExternalData: f.ExternalData(),
		}
	}

	return result, nil
}
