package application

import (
	"context"
	"database/sql"
	"errors"

	"rewritetest/internal/accessibility/internal/domain"
	"rewritetest/internal/shared/apperr"
)

type MarkHtmlAsReviewedUseCase struct {
	HTMLissueRepository domain.HTMLIssueRepository
}

type MarkHTMLReviewedCommand struct {
	UserID  int64
	IssueID int64
}

func NewHtmlIssueReviewedUseCase(HTMLissueRepository domain.HTMLIssueRepository) *MarkHtmlAsReviewedUseCase {
	return &MarkHtmlAsReviewedUseCase{HTMLissueRepository: HTMLissueRepository}
}

func (u *MarkHtmlAsReviewedUseCase) Execute(ctx context.Context, cmd MarkHTMLReviewedCommand) error {
	issue, err := u.HTMLissueRepository.GetByID(ctx, cmd.IssueID)

	if errors.Is(err, sql.ErrNoRows) {
		return apperr.New(apperr.CodeNotFound, "HTML issue not found")
	}

	issue.MarkAsReviewed(cmd.UserID)

	return u.HTMLissueRepository.Update(ctx, issue)
}
