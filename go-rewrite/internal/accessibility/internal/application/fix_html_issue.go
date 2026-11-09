package application

import (
	"context"
	"database/sql"
	"errors"

	"rewritetest/internal/accessibility/internal/domain"
	"rewritetest/internal/shared/apperr"
	"rewritetest/internal/shared/auth"
)

type HTMLContentUpdater interface {
	UpdateContentHTML(context.Context, auth.Principal, int64, string) error
}

type FixHTMLIssueUseCase struct {
	issueRepository domain.HTMLIssueRepository
	contentUpdater  HTMLContentUpdater
}

type FixHTMLIssueCommand struct {
	Principal auth.Principal
	IssueID   int64
	HTML      string
}

func NewFixHTMLIssueUseCase(issueRepository domain.HTMLIssueRepository, contentUpdater HTMLContentUpdater) *FixHTMLIssueUseCase {
	return &FixHTMLIssueUseCase{issueRepository: issueRepository, contentUpdater: contentUpdater}
}

func (u *FixHTMLIssueUseCase) Execute(ctx context.Context, cmd FixHTMLIssueCommand) error {
	issue, err := u.issueRepository.GetByID(ctx, cmd.IssueID)
	if errors.Is(err, sql.ErrNoRows) || (err == nil && issue == nil) {
		return apperr.New(apperr.CodeNotFound, "HTML issue not found")
	}
	if err != nil {
		return err
	}

	if err := u.contentUpdater.UpdateContentHTML(ctx, cmd.Principal, issue.ContentItemID(), cmd.HTML); err != nil {
		return err
	}

	issue.MarkAsReviewed(cmd.Principal.AgentID)
	return u.issueRepository.Update(ctx, issue)
}
