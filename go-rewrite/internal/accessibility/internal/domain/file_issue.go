package domain

import (
	"fmt"
	"time"

	"rewritetest/internal/shared/apperr"
)

type review struct {
	reviewerID int64
	reviewedOn time.Time
}

type FileIssue struct {
	id        int64
	fileID    int64
	review    *review
	createdAt time.Time
	updatedAt time.Time
}

func NewFileIssue(fileID, reviewerID int64, reviewedOn time.Time) *FileIssue {
	return &FileIssue{
		fileID: fileID,
		review: &review{
			reviewerID: reviewerID,
			reviewedOn: reviewedOn,
		},
		createdAt: time.Now(),
		updatedAt: time.Now(),
	}
}

func RehydrateFileIssue(
	id int64,
	fileID int64,
	reviewerID *int64,
	reviewedOn *time.Time,
	createdAt time.Time,
	updatedAt time.Time,
) (*FileIssue, error) {
	fileIssue := &FileIssue{
		id:        id,
		fileID:    fileID,
		createdAt: createdAt,
		updatedAt: updatedAt,
	}

	if (reviewerID == nil) != (reviewedOn == nil) {
		return nil, apperr.Internal("ReviewerID and reviewedOn must either both be set or both be nil")
	}

	if reviewedOn != nil && reviewerID != nil {
		fileIssue.review = &review{
			reviewerID: *reviewerID,
			reviewedOn: *reviewedOn,
		}
	}

	return fileIssue, nil
}

func (f *FileIssue) IsReviewed() bool {
	return f.review != nil
}

func (f *FileIssue) Review(reviewerID int64, reviewedOn time.Time) error {
	if f.IsReviewed() == true {
		return apperr.New(apperr.CodeInternal, "File issue has already been reviewed")
	} else {
		f.review = &review{
			reviewerID: reviewerID,
			reviewedOn: reviewedOn,
		}
		f.updatedAt = reviewedOn
	}
	return nil
}

func (f *FileIssue) ReviewedOn() (time.Time, error) {
	if f.review == nil {
		return time.Time{}, fmt.Errorf("Review is nil")
	}
	return f.review.reviewedOn, nil
}

func (f *FileIssue) ReviewerID() (int64, error) {
	if f.review == nil {
		return 0, fmt.Errorf("Review is nil")
	}
	return f.review.reviewerID, nil
}

func (f *FileIssue) UpdatedAt() time.Time {
	return f.updatedAt
}

func (f *FileIssue) CreatedAt() time.Time {
	return f.createdAt
}

func (f *FileIssue) ID() int64 {
	return f.id
}
