package domain

import (
	"time"

	"rewritetest/internal/shared/apperr"
)

type review struct {
	reviewerID int64
	reviewedOn time.Time
}

type FileIssue struct {
	id     int64
	fileID int64
	review *review
}

func NewFileIssue(fileID, reviewerID int64, reviewedOn time.Time) *FileIssue {
	return &FileIssue{
		fileID: fileID,
		review: &review{
			reviewerID: reviewerID,
			reviewedOn: reviewedOn,
		},
	}
}

func RehydrateFileIssue(id, fileID, reviewerID int64, reviewedOn time.Time) *FileIssue {
	return &FileIssue{
		id:     id,
		fileID: fileID,
		review: &review{
			reviewerID: reviewerID,
			reviewedOn: reviewedOn,
		},
	}
}

func (f *FileIssue) IsReviewed() bool {
	return f.review != nil
}

func (f *FileIssue) Review(reviewerID int64, reviewedOn time.Time) error {
	if f.review == nil {
		f.review = &review{
			reviewerID: reviewerID,
			reviewedOn: reviewedOn,
		}
	} else {
		return apperr.New(apperr.CodeInternal, "File issue has already been reviewed")
	}
	return nil
}
