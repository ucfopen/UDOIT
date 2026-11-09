package internal

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"rewritetest/internal/accessibility/internal/application"
	"rewritetest/internal/accessibility/internal/domain"
	"rewritetest/internal/accessibility/internal/infrastructure"
	"rewritetest/internal/shared/auth"
	sharedAuth "rewritetest/internal/shared/auth"
	"rewritetest/internal/shared/http/middleware"

	"github.com/gin-gonic/gin"
)

type principalAuthenticator struct{ principal auth.Principal }

func (a principalAuthenticator) WithAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		sharedAuth.SetPrincipal(c, a.principal)
		c.Next()
	}
}

type htmlUpdaterFunc func(context.Context, auth.Principal, int64, string) error

func (f htmlUpdaterFunc) UpdateContentHTML(ctx context.Context, principal auth.Principal, contentItemID int64, html string) error {
	return f(ctx, principal, contentItemID, html)
}

func TestFixHTMLIssueRouteSendsHTMLAndReviewsIssue(t *testing.T) {
	gin.SetMode(gin.TestMode)
	issue := domain.RehydrateHTMLIssue(5, 12, "image_alt", "/html/body/img", domain.IssueStatusActive, domain.IssueSeverityError, 0, time.Time{}, nil, time.Now(), time.Now())
	principal := auth.Principal{AgentID: 17, TenantID: 7}
	var gotHTML string
	var updatedIssue *domain.HTMLIssue
	repo := &infrastructure.MockHTMLIssueRepository{
		GetByIDFunc: func(context.Context, int64) (*domain.HTMLIssue, error) { return issue, nil },
		UpdateFunc:  func(_ context.Context, issue *domain.HTMLIssue) error { updatedIssue = issue; return nil },
	}
	fixUseCase := application.NewFixHTMLIssueUseCase(repo, htmlUpdaterFunc(func(_ context.Context, _ auth.Principal, _ int64, html string) error {
		gotHTML = html
		return nil
	}))
	handler := NewHandler(nil, nil, nil, fixUseCase, nil, nil, nil)
	router := gin.New()
	router.Use(middleware.ErrorHandler())
	handler.RegisterRoutes(router.Group("/accessibility"), principalAuthenticator{principal: principal})

	const pageHTML = `<main><h1>Updated page</h1></main>`
	request := httptest.NewRequest(http.MethodPost, "/accessibility/issues/5/html", strings.NewReader(`{"html":"<main><h1>Updated page</h1></main>"}`))
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("unexpected route status %d: %s", response.Code, response.Body.String())
	}
	if gotHTML != pageHTML {
		t.Fatalf("route sent HTML %q, want %q", gotHTML, pageHTML)
	}
	if updatedIssue != issue || updatedIssue.Status() != domain.IssueStatusMarkedAsReviewed || updatedIssue.FixedBy() != principal.AgentID || updatedIssue.FixedAt().IsZero() {
		t.Fatalf("route did not record review: %+v", updatedIssue)
	}
}
