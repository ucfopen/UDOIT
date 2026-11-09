package mysql

import (
	"context"
	"database/sql"
	"encoding/json"

	"rewritetest/internal/lms/internal/record"
	lmssqlc "rewritetest/internal/lms/internal/storage/mysql/sqlc"
)

func (r *Store) FileByID(ctx context.Context, fileID int64) (record.File, bool, error) {
	row, err := r.queries.GetFileByID(ctx, uint64(fileID))
	if err != nil {
		if err == sql.ErrNoRows {
			return record.File{}, false, nil
		}
		return record.File{}, false, err
	}
	file, err := fileFromRow(row.ID, row.CourseID, row.IsReplacement, row.FileName, row.FileType, row.UpdatedAtLms, row.FileSize, row.DownloadUrl, row.ExternalData, row.ExternalID)
	return file, err == nil, err
}

func (r *Store) CreateFile(ctx context.Context, file record.File) (record.File, error) {
	externalData, err := json.Marshal(file.ExternalData)
	if err != nil {
		return record.File{}, err
	}
	result, err := r.db.ExecContext(ctx, `
		INSERT INTO file_item (course_id, is_replacement, file_name, file_type, updated_at_lms, file_size, download_url, external_data, external_id)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		uint64(file.CourseID),
		file.IsReplacement,
		sql.NullString{String: file.FileName, Valid: file.FileName != ""},
		sql.NullString{String: file.FileType, Valid: file.FileType != ""},
		sql.NullTime{Time: file.UpdatedAt, Valid: !file.UpdatedAt.IsZero()},
		sql.NullInt64{Int64: file.FileSize, Valid: true},
		sql.NullString{String: file.DownloadURL, Valid: file.DownloadURL != ""},
		externalData,
		file.ExternalID,
	)
	if err != nil {
		return record.File{}, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return record.File{}, err
	}
	persisted, found, err := r.FileByID(ctx, id)
	if err != nil {
		return record.File{}, err
	}
	if !found {
		return record.File{}, sql.ErrNoRows
	}
	return persisted, nil
}

func (r *Store) FilesByCourse(ctx context.Context, courseID int64) ([]record.File, error) {
	rows, err := r.queries.GetFilesByCourseID(ctx, uint64(courseID))
	return r.filesFromRows(rows, err)
}

func (r *Store) filesFromRows(rows []lmssqlc.GetFilesByCourseIDRow, err error) ([]record.File, error) {
	if err != nil {
		return nil, err
	}
	files := make([]record.File, 0, len(rows))
	for _, row := range rows {
		file, err := fileFromRow(row.ID, row.CourseID, row.IsReplacement, row.FileName, row.FileType, row.UpdatedAtLms, row.FileSize, row.DownloadUrl, row.ExternalData, row.ExternalID)
		if err != nil {
			return nil, err
		}
		files = append(files, file)
	}
	return files, nil
}

func fileFromRow(id, courseID uint64, isReplacement bool, fileName, fileType sql.NullString, updatedAt sql.NullTime, fileSize sql.NullInt64, downloadURL sql.NullString, rawExternalData []byte, externalID string) (record.File, error) {
	externalData := make(map[string]any)
	if len(rawExternalData) > 0 {
		if err := json.Unmarshal(rawExternalData, &externalData); err != nil {
			return record.File{}, err
		}
	}
	return record.File{ID: int64(id), CourseID: int64(courseID), IsReplacement: isReplacement, FileName: fileName.String, FileType: fileType.String, UpdatedAt: updatedAt.Time, FileSize: fileSize.Int64, DownloadURL: downloadURL.String, ExternalID: externalID, ExternalData: externalData}, nil
}

func (r *Store) UpdateFile(ctx context.Context, file record.File) error {
	externalData, err := json.Marshal(file.ExternalData)
	if err != nil {
		return err
	}
	return r.queries.UpdateFile(ctx, lmssqlc.UpdateFileParams{
		CourseID:      uint64(file.CourseID),
		IsReplacement: file.IsReplacement,
		FileName:      sql.NullString{String: file.FileName, Valid: file.FileName != ""},
		FileType:      sql.NullString{String: file.FileType, Valid: file.FileType != ""},
		UpdatedAtLms:  sql.NullTime{Time: file.UpdatedAt, Valid: !file.UpdatedAt.IsZero()},
		FileSize:      sql.NullInt64{Int64: file.FileSize, Valid: true},
		DownloadUrl:   sql.NullString{String: file.DownloadURL, Valid: file.DownloadURL != ""},
		ExternalData:  externalData, ExternalID: file.ExternalID, ID: uint64(file.ID),
	})
}

func (r *Store) DeleteFile(ctx context.Context, fileID int64) error {
	return r.queries.DeleteFile(ctx, uint64(fileID))
}

func (r *Store) SyncFiles(ctx context.Context, courseID int64, records []record.FileSync) error {
	for _, record := range records {
		externalData, err := json.Marshal(record.ExternalData)
		if err != nil {
			return err
		}
		updatedAt := record.UpdatedAt
		if err := r.queries.UpsertFileByCourseExternalID(ctx, lmssqlc.UpsertFileByCourseExternalIDParams{
			CourseID:      uint64(courseID),
			IsReplacement: record.IsReplacement,
			FileName:      sql.NullString{String: record.FileName, Valid: record.FileName != ""},
			FileType:      sql.NullString{String: record.FileType, Valid: record.FileType != ""},
			UpdatedAtLms:  sql.NullTime{Time: updatedAt, Valid: !updatedAt.IsZero()},
			FileSize:      sql.NullInt64{Int64: record.FileSize, Valid: true},
			DownloadUrl:   sql.NullString{String: record.DownloadURL, Valid: record.DownloadURL != ""},
			ExternalData:  externalData, ExternalID: record.ExternalID,
		}); err != nil {
			return err
		}
	}
	return nil
}
