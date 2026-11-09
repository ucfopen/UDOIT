package lms

import (
	"context"
	"testing"

	"rewritetest/internal/lms/internal/record"
)

type replacementFileStore struct {
	Store
	files  []record.File
	nextID int64
}

func (s *replacementFileStore) SyncFiles(_ context.Context, courseID int64, files []record.FileSync) error {
	for _, input := range files {
		found := false
		for i := range s.files {
			if s.files[i].CourseID != courseID || s.files[i].ExternalID != input.ExternalID {
				continue
			}
			s.files[i].FileName = input.FileName
			s.files[i].FileType = input.FileType
			s.files[i].UpdatedAt = input.UpdatedAt
			s.files[i].FileSize = input.FileSize
			s.files[i].DownloadURL = input.DownloadURL
			s.files[i].ExternalData = input.ExternalData
			s.files[i].IsReplacement = s.files[i].IsReplacement || input.IsReplacement
			found = true
			break
		}
		if found {
			continue
		}
		s.nextID++
		s.files = append(s.files, record.File{
			ID: s.nextID, CourseID: courseID, IsReplacement: input.IsReplacement,
			FileName: input.FileName, FileType: input.FileType, UpdatedAt: input.UpdatedAt,
			FileSize: input.FileSize, DownloadURL: input.DownloadURL,
			ExternalID: input.ExternalID, ExternalData: input.ExternalData,
		})
	}
	return nil
}

func (s *replacementFileStore) FilesByCourse(_ context.Context, courseID int64) ([]record.File, error) {
	var files []record.File
	for _, file := range s.files {
		if file.CourseID == courseID {
			files = append(files, file)
		}
	}
	return files, nil
}

func TestCreateReplacementFileRetainsReplacementMarkerAcrossSync(t *testing.T) {
	store := &replacementFileStore{}
	service := &Service{store: store}

	replacement, err := service.CreateReplacementFile(context.Background(), 12, UploadedFile{
		FileName: "accessible.pdf", ExternalID: "file:55",
	})
	if err != nil {
		t.Fatalf("CreateReplacementFile returned error: %v", err)
	}
	if !replacement.IsReplacement {
		t.Fatalf("replacement marker was not set: %+v", replacement)
	}

	if err := service.SyncFilesForCourse(context.Background(), 12, []FileSyncInput{{
		FileName: "accessible.pdf", ExternalID: "file:55",
	}}); err != nil {
		t.Fatalf("SyncFilesForCourse returned error: %v", err)
	}
	files, err := service.GetFilesByCourse(context.Background(), 12)
	if err != nil {
		t.Fatalf("GetFilesByCourse returned error: %v", err)
	}
	if len(files) != 1 || !files[0].IsReplacement {
		t.Fatalf("replacement marker should survive LMS sync, got %+v", files)
	}
}
