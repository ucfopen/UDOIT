package infrastructure

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"

	"rewritetest/internal/files/internal/domain"
	filessqlc "rewritetest/internal/files/internal/infrastructure/sqlc"
)

type MySQLFileRepository struct {
	queries *filessqlc.Queries
}

func NewMySQLFileRepository(db *sql.DB) *MySQLFileRepository {
	return &MySQLFileRepository{
		queries: filessqlc.New(db),
	}
}

func (r *MySQLFileRepository) GetFileByID(ctx context.Context, fileID int64) (*domain.File, error) {
	row, err := r.queries.GetFileByID(ctx, uint64(fileID))
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	externalData := make(map[string]any)
	if len(row.ExternalData) > 0 {
		if err := json.Unmarshal(row.ExternalData, &externalData); err != nil {
			return nil, err
		}
	}

	file := domain.RehydrateFile(
		int64(row.ID),
		int64(row.CourseID),
		row.FileName.String,
		row.FileType.String,
		row.UpdatedAtLms.Time,
		row.FileSize.Int64,
		row.DownloadUrl.String,
		row.ExternalID,
		externalData,
	)

	return file, nil
}

func (r *MySQLFileRepository) GetByCourseID(ctx context.Context, courseID int64) ([]*domain.File, error) {
	rows, err := r.queries.GetFilesByCourseID(ctx, uint64(courseID))
	if err != nil {
		return nil, err
	}

	files := make([]*domain.File, 0, len(rows))
	for _, row := range rows {
		externalData := make(map[string]any)
		if len(row.ExternalData) > 0 {
			if err := json.Unmarshal(row.ExternalData, &externalData); err != nil {
				return nil, err
			}
		}

		file := domain.RehydrateFile(
			int64(row.ID),
			int64(row.CourseID),
			row.FileName.String,
			row.FileType.String,
			row.UpdatedAtLms.Time,
			row.FileSize.Int64,
			row.DownloadUrl.String,
			row.ExternalID,
			externalData,
		)

		files = append(files, file)
	}

	return files, nil
}

func (r *MySQLFileRepository) UpdateFile(ctx context.Context, file *domain.File) error {
	externalDataBytes, err := json.Marshal(file.ExternalData())
	if err != nil {
		return err
	}

	return r.queries.UpdateFile(ctx, filessqlc.UpdateFileParams{
		CourseID:     uint64(file.CourseID()),
		FileName:     sql.NullString{String: file.FileName(), Valid: file.FileName() != ""},
		FileType:     sql.NullString{String: file.FileType(), Valid: file.FileType() != ""},
		UpdatedAtLms: sql.NullTime{Time: file.UpdatedAt(), Valid: !file.UpdatedAt().IsZero()},
		FileSize:     sql.NullInt64{Int64: file.FileSize(), Valid: true},
		DownloadUrl:  sql.NullString{String: file.DownloadURL(), Valid: file.DownloadURL() != ""},
		ExternalData: externalDataBytes,
		ExternalID:   file.ExternalID(),
		ID:           uint64(file.ID()),
	})
}

func (r *MySQLFileRepository) DeleteFile(ctx context.Context, fileID int64) error {
	return r.queries.DeleteFile(ctx, uint64(fileID))
}

func (r *MySQLFileRepository) UpsertByCourse(ctx context.Context, courseID int64, records []domain.CourseFileSyncRecord) error {
	for _, record := range records {
		externalDataBytes, err := json.Marshal(record.ExternalData)
		if err != nil {
			return err
		}

		updatedAt, err := time.Parse(time.RFC3339, record.UpdatedAt)
		if err != nil {
			return err
		}

		err = r.queries.UpsertFileByCourseExternalID(ctx, filessqlc.UpsertFileByCourseExternalIDParams{
			CourseID:     uint64(courseID),
			FileName:     sql.NullString{String: record.FileName, Valid: record.FileName != ""},
			FileType:     sql.NullString{String: record.FileType, Valid: record.FileType != ""},
			UpdatedAtLms: sql.NullTime{Time: updatedAt, Valid: !updatedAt.IsZero()},
			FileSize:     sql.NullInt64{Int64: record.FileSize, Valid: true},
			DownloadUrl:  sql.NullString{String: record.DownloadURL, Valid: record.DownloadURL != ""},
			ExternalData: externalDataBytes,
			ExternalID:   record.ExternalID,
		})
		if err != nil {
			return err
		}
	}

	return nil
}

var _ domain.FileRepository = (*MySQLFileRepository)(nil)
