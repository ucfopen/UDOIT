package application

import (
	"context"
	"database/sql"
	"errors"

	"rewritetest/internal/accessibility/internal/domain"
	"rewritetest/internal/shared/apperr"
	"rewritetest/internal/shared/auth"
)


type HTMLContentRetriever interface {
	GetContentHTML(context.Context, auth.Principal, int64) (string, error)
}

type GetHTMLIssueContentUseCase struct {
	issueRepository  domain.HTMLIssueRepository
	contentRetriever HTMLContentRetriever
}

type GetHTMLIssueContentCommand struct {
	Principal auth.Principal
	IssueID   int64
}

func NewGetHTMLIssueContentUseCase(issueRepository domain.HTMLIssueRepository, contentRetriever HTMLContentRetriever) *GetHTMLIssueContentUseCase {
	return &GetHTMLIssueContentUseCase{issueRepository: issueRepository, contentRetriever: contentRetriever}
}

func (u *GetHTMLIssueContentUseCase) Execute(ctx context.Context, cmd GetHTMLIssueContentCommand) (string, error) {
	issue, err := u.issueRepository.GetByID(ctx, cmd.IssueID)
	if errors.Is(err, sql.ErrNoRows) || (err == nil && issue == nil) {
		return "", apperr.New(apperr.CodeNotFound, "HTML issue not found")
	}
	if err != nil {
		return "", err
	}
	return u.contentRetriever.GetContentHTML(ctx, cmd.Principal, issue.ContentItemID())
}
