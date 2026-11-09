package application

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"rewritetest/internal/accessibility/internal/domain"
	"rewritetest/internal/shared/apperr"
)

type MarkFileAsReviewedUseCase struct {
	FileIssueRepository domain.FileIssueRepository
}

type MarkFileReviewedCommand struct {
	UserID      int64
	FileIssueID int64
}

func NewFileissueReviewedUseCase(FileIssueRepository domain.FileIssueRepository) *MarkFileAsReviewedUseCase {
	return &MarkFileAsReviewedUseCase{FileIssueRepository: FileIssueRepository}
}

func (u *MarkFileAsReviewedUseCase) Execute(ctx context.Context, cmd MarkFileReviewedCommand) error {
	issue, err := u.FileIssueRepository.GetByID(ctx, cmd.FileIssueID)

	if errors.Is(err, sql.ErrNoRows) {
		return apperr.New(apperr.CodeNotFound, "File issue not found")
	}

	if err := issue.Review(cmd.UserID, time.Now()); err != nil {
		return err
	}

	return u.FileIssueRepository.Update(ctx, issue)
}
