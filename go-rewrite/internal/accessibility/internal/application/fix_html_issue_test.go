package application

import (
	"context"
	"errors"
	"testing"
	"time"

	"rewritetest/internal/accessibility/internal/domain"
	"rewritetest/internal/accessibility/internal/infrastructure"
	"rewritetest/internal/shared/auth"
)

type htmlContentUpdaterFunc func(context.Context, auth.Principal, int64, string) error

func (f htmlContentUpdaterFunc) UpdateContentHTML(ctx context.Context, principal auth.Principal, contentItemID int64, html string) error {
	return f(ctx, principal, contentItemID, html)
}

func TestFixHTMLIssueUploadsHTMLAndMarksReviewer(t *testing.T) {
	issue := domain.RehydrateHTMLIssue(5, 12, "image_alt", "/html/body/img", domain.IssueStatusActive, domain.IssueSeverityError, 0, time.Time{}, nil, time.Now(), time.Now())
	principal := auth.Principal{AgentID: 17, TenantID: 7}
	pageHTML := `<main><h1>Updated page</h1></main>`
	uploaded := false
	var updatedIssue *domain.HTMLIssue
	repo := &infrastructure.MockHTMLIssueRepository{
		GetByIDFunc: func(_ context.Context, id int64) (*domain.HTMLIssue, error) {
			if id != issue.ID() {
				t.Fatalf("unexpected issue ID: %d", id)
			}
			return issue, nil
		},
		UpdateFunc: func(_ context.Context, updated *domain.HTMLIssue) error {
			updatedIssue = updated
			return nil
		},
	}
	useCase := NewFixHTMLIssueUseCase(repo, htmlContentUpdaterFunc(func(_ context.Context, gotPrincipal auth.Principal, contentItemID int64, html string) error {
		uploaded = true
		if gotPrincipal != principal || contentItemID != issue.ContentItemID() || html != pageHTML {
			t.Fatalf("unexpected LMS update: principal=%+v contentItemID=%d html=%q", gotPrincipal, contentItemID, html)
		}
		return nil
	}))

	if err := useCase.Execute(context.Background(), FixHTMLIssueCommand{Principal: principal, IssueID: issue.ID(), HTML: pageHTML}); err != nil {
		t.Fatalf("Execute returned error: %v", err)
	}
	if !uploaded {
		t.Fatal("expected HTML to be sent to LMS")
	}
	if updatedIssue != issue || updatedIssue.Status() != domain.IssueStatusMarkedAsReviewed || updatedIssue.FixedBy() != principal.AgentID || updatedIssue.FixedAt().IsZero() {
		t.Fatalf("issue was not reviewed by requester: %+v", updatedIssue)
	}
}

func TestFixHTMLIssueDoesNotReviewWhenLMSUpdateFails(t *testing.T) {
	issue := domain.RehydrateHTMLIssue(5, 12, "image_alt", "/html/body/img", domain.IssueStatusActive, domain.IssueSeverityError, 0, time.Time{}, nil, time.Now(), time.Now())
	updated := false
	repo := &infrastructure.MockHTMLIssueRepository{
		GetByIDFunc: func(context.Context, int64) (*domain.HTMLIssue, error) { return issue, nil },
		UpdateFunc:  func(context.Context, *domain.HTMLIssue) error { updated = true; return nil },
	}
	useCase := NewFixHTMLIssueUseCase(repo, htmlContentUpdaterFunc(func(context.Context, auth.Principal, int64, string) error {
		return errors.New("Canvas update failed")
	}))

	err := useCase.Execute(context.Background(), FixHTMLIssueCommand{Principal: auth.Principal{AgentID: 17}, IssueID: issue.ID(), HTML: "<p>fixed</p>"})
	if err == nil || err.Error() != "Canvas update failed" {
		t.Fatalf("expected LMS update error, got %v", err)
	}
	if updated || issue.Status() != domain.IssueStatusActive {
		t.Fatal("issue should remain active when LMS update fails")
	}
}
