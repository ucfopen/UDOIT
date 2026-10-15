package domain

import "time"

type FileReference struct {
	id            int64
	contentItemID int64
	fileID        int64
	createdAt     time.Time
	updatedAt     time.Time
}

func NewFileReference(contentItemID, fileID int64) *FileReference {
	now := time.Now()
	return &FileReference{
		contentItemID: contentItemID,
		fileID:        fileID,
		createdAt:     now,
		updatedAt:     now,
	}
}

func RehydrateFileReference(id, contentItemID, fileID int64, createdAt, updatedAt time.Time) *FileReference {
	return &FileReference{
		id:            id,
		contentItemID: contentItemID,
		fileID:        fileID,
		createdAt:     createdAt,
		updatedAt:     updatedAt,
	}
}

func (f *FileReference) ID() int64 {
	return f.id
}

func (f *FileReference) ContentItemID() int64 {
	return f.contentItemID
}

func (f *FileReference) FileID() int64 {
	return f.fileID
}

func (f *FileReference) CreatedAt() time.Time {
	return f.createdAt
}

func (f *FileReference) UpdatedAt() time.Time {
	return f.updatedAt
}
