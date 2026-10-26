package lms

import (
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func TestToProviderCourse(t *testing.T) {
	course := CourseInfo{
		ID:           12,
		ExternalID:   "course-12",
		ExternalData: map[string]any{"course_id": "42"},
	}

	got := toProviderCourse(course)

	require.Equal(t, course.ID, got.ID)
	require.Equal(t, course.ExternalID, got.ExternalID)
	require.Equal(t, course.ExternalData, got.ExternalData)
}

func TestToProviderFile(t *testing.T) {
	updatedAt := time.Date(2026, time.October, 23, 12, 0, 0, 0, time.UTC)
	file := FileInfo{
		ID:           34,
		FileName:     "original.pdf",
		FileType:     "application/pdf",
		UpdatedAt:    updatedAt,
		FileSize:     1024,
		DownloadURL:  "https://lms.example/files/34",
		ExternalID:   "file-34",
		ExternalData: map[string]any{"file_id": "34"},
	}

	got := toProviderFile(file)

	require.Equal(t, file.FileName, got.FileName)
	require.Equal(t, file.FileType, got.FileType)
	require.Equal(t, file.UpdatedAt, got.UpdatedAt)
	require.Equal(t, file.FileSize, got.FileSize)
	require.Equal(t, file.DownloadURL, got.DownloadURL)
	require.Equal(t, file.ExternalID, got.ExternalID)
	require.Equal(t, file.ExternalData, got.ExternalData)
}
