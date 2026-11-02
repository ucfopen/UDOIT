package infrastructure

import (
	"context"
	"database/sql"
	"encoding/json"
	"time"

	"rewritetest/internal/lms/internal/domain"
	lmssqlc "rewritetest/internal/lms/internal/infrastructure/sqlc"
)

type MySQLFileRepository struct {
	queries *lmssqlc.Queries
}

func NewMySQLFileRepository(db *sql.DB) *MySQLFileRepository {
	return &MySQLFileRepository{queries: lmssqlc.New(db)}
}

func (r *MySQLFileRepository) GetFileByID(ctx context.Context, fileID int64) (*domain.File, error) {
	row, err := r.queries.GetFileByID(ctx, uint64(fileID))
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return fileFromRow(row.ID, row.CourseID, row.FileName, row.FileType, row.UpdatedAtLms, row.FileSize, row.DownloadUrl, row.ExternalData, row.ExternalID)
}

func (r *MySQLFileRepository) GetByCourseID(ctx context.Context, courseID int64) ([]*domain.File, error) {
	rows, err := r.queries.GetFilesByCourseID(ctx, uint64(courseID))
	if err != nil {
		return nil, err
	}
	files := make([]*domain.File, 0, len(rows))
	for _, row := range rows {
		file, err := fileFromRow(row.ID, row.CourseID, row.FileName, row.FileType, row.UpdatedAtLms, row.FileSize, row.DownloadUrl, row.ExternalData, row.ExternalID)
		if err != nil {
			return nil, err
		}
		files = append(files, file)
	}
	return files, nil
}

func fileFromRow(id, courseID uint64, fileName, fileType sql.NullString, updatedAt sql.NullTime, fileSize sql.NullInt64, downloadURL sql.NullString, rawExternalData []byte, externalID string) (*domain.File, error) {
	externalData := make(map[string]any)
	if len(rawExternalData) > 0 {
		if err := json.Unmarshal(rawExternalData, &externalData); err != nil {
			return nil, err
		}
	}
	return domain.RehydrateFile(int64(id), int64(courseID), fileName.String, fileType.String, updatedAt.Time, fileSize.Int64, downloadURL.String, externalID, externalData), nil
}

func (r *MySQLFileRepository) UpdateFile(ctx context.Context, file *domain.File) error {
	externalData, err := json.Marshal(file.ExternalData())
	if err != nil {
		return err
	}
	return r.queries.UpdateFile(ctx, lmssqlc.UpdateFileParams{
		CourseID:     uint64(file.CourseID()),
		FileName:     sql.NullString{String: file.FileName(), Valid: file.FileName() != ""},
		FileType:     sql.NullString{String: file.FileType(), Valid: file.FileType() != ""},
		UpdatedAtLms: sql.NullTime{Time: file.UpdatedAt(), Valid: !file.UpdatedAt().IsZero()},
		FileSize:     sql.NullInt64{Int64: file.FileSize(), Valid: true},
		DownloadUrl:  sql.NullString{String: file.DownloadURL(), Valid: file.DownloadURL() != ""},
		ExternalData: externalData, ExternalID: file.ExternalID(), ID: uint64(file.ID()),
	})
}

func (r *MySQLFileRepository) DeleteFile(ctx context.Context, fileID int64) error {
	return r.queries.DeleteFile(ctx, uint64(fileID))
}

func (r *MySQLFileRepository) UpsertByCourse(ctx context.Context, courseID int64, records []domain.CourseFileSyncRecord) error {
	for _, record := range records {
		externalData, err := json.Marshal(record.ExternalData)
		if err != nil {
			return err
		}
		updatedAt, err := time.Parse(time.RFC3339, record.UpdatedAt)
		if err != nil {
			return err
		}
		if err := r.queries.UpsertFileByCourseExternalID(ctx, lmssqlc.UpsertFileByCourseExternalIDParams{
			CourseID:     uint64(courseID),
			FileName:     sql.NullString{String: record.FileName, Valid: record.FileName != ""},
			FileType:     sql.NullString{String: record.FileType, Valid: record.FileType != ""},
			UpdatedAtLms: sql.NullTime{Time: updatedAt, Valid: !updatedAt.IsZero()},
			FileSize:     sql.NullInt64{Int64: record.FileSize, Valid: true},
			DownloadUrl:  sql.NullString{String: record.DownloadURL, Valid: record.DownloadURL != ""},
			ExternalData: externalData, ExternalID: record.ExternalID,
		}); err != nil {
			return err
		}
	}
	return nil
}

var _ domain.FileRepository = (*MySQLFileRepository)(nil)
