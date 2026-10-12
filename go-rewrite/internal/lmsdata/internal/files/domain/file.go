package domain

import "time"

type File struct {
	id           int64
	courseID     int64
	fileName     string
	fileType     string
	updatedAt    time.Time
	fileSize     int64
	downloadURL  string
	externalID   string
	externalData map[string]any
}

func NewFile(courseID int64, fileName, fileType string, updatedAt time.Time, fileSize int64, downloadURL string, externalID string, externalData map[string]any) *File {
	return &File{
		courseID:     courseID,
		fileName:     fileName,
		fileType:     fileType,
		updatedAt:    updatedAt,
		fileSize:     fileSize,
		downloadURL:  downloadURL,
		externalID:   externalID,
		externalData: externalData,
	}
}

func RehydrateFile(id, courseID int64, fileName, fileType string, updatedAt time.Time, fileSize int64, downloadURL string, externalID string, externalData map[string]any) *File {
	return &File{
		id:           id,
		courseID:     courseID,
		fileName:     fileName,
		fileType:     fileType,
		updatedAt:    updatedAt,
		fileSize:     fileSize,
		downloadURL:  downloadURL,
		externalID:   externalID,
		externalData: externalData,
	}
}

func (f *File) ID() int64 {
	return f.id
}

func (f *File) CourseID() int64 {
	return f.courseID
}

func (f *File) FileName() string {
	return f.fileName
}

func (f *File) FileType() string {
	return f.fileType
}

func (f *File) UpdatedAt() time.Time {
	return f.updatedAt
}

func (f *File) FileSize() int64 {
	return f.fileSize
}

func (f *File) DownloadURL() string {
	return f.downloadURL
}

func (f *File) ExternalID() string {
	return f.externalID
}

func (f *File) ExternalData() map[string]any {
	return f.externalData
}
