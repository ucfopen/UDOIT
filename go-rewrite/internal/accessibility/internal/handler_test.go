package internal

import (
	"context"
	"encoding/json"
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

type htmlRetrieverFunc func(context.Context, auth.Principal, int64) (string, error)

func (f htmlRetrieverFunc) GetContentHTML(ctx context.Context, principal auth.Principal, contentItemID int64) (string, error) {
	return f(ctx, principal, contentItemID)
}

type scanCourseUseCaseFunc func(context.Context, auth.Principal, int64) ([]*domain.HTMLIssue, error)

func (f scanCourseUseCaseFunc) Execute(ctx context.Context, principal auth.Principal, courseID int64) ([]*domain.HTMLIssue, error) {
	return f(ctx, principal, courseID)
}

type createReportUseCaseFunc func(context.Context, application.CreateReportCommand) error

func (f createReportUseCaseFunc) Execute(ctx context.Context, command application.CreateReportCommand) error {
	return f(ctx, command)
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
	handler := NewHandler(nil, nil, nil, fixUseCase, nil, nil, nil, nil)
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

func TestScanCourseRouteReturnsAllIssuesAsJSON(t *testing.T) {
	gin.SetMode(gin.TestMode)
	fixedAt := time.Date(2026, time.November, 9, 12, 0, 0, 0, time.UTC)
	issues := []*domain.HTMLIssue{
		domain.RehydrateHTMLIssue(3, 10, "old_rule", "/html/body/p", domain.IssueStatusActive, domain.IssueSeveritySuggestion, 0, time.Time{}, map[string]any{"message": "existing"}, fixedAt, fixedAt),
		domain.RehydrateHTMLIssue(4, 11, "new_rule", "/html/body/img", domain.IssueStatusMarkedAsReviewed, domain.IssueSeverityError, 17, fixedAt, map[string]any{"message": "new"}, fixedAt, fixedAt),
	}
	principal := auth.Principal{AgentID: 17, TenantID: 7}
	var reportCommand application.CreateReportCommand
	scanUseCase := scanCourseUseCaseFunc(func(_ context.Context, gotPrincipal auth.Principal, courseID int64) ([]*domain.HTMLIssue, error) {
		if gotPrincipal != principal || courseID != 42 {
			t.Fatalf("unexpected scan request: principal=%+v courseID=%d", gotPrincipal, courseID)
		}
		return issues, nil
	})
	reportUseCase := createReportUseCaseFunc(func(_ context.Context, command application.CreateReportCommand) error {
		reportCommand = command
		return nil
	})
	handler := NewHandler(scanUseCase, reportUseCase, nil, nil, nil, nil, nil, nil)
	router := gin.New()
	router.Use(middleware.ErrorHandler())
	handler.RegisterRoutes(router.Group("/accessibility"), principalAuthenticator{principal: principal})

	request := httptest.NewRequest(http.MethodPost, "/accessibility/scan/courses/42", nil)
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("unexpected status %d: %s", response.Code, response.Body.String())
	}
	var body struct {
		Issues []htmlIssueResponse `json:"issues"`
	}
	if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if len(body.Issues) != 2 {
		t.Fatalf("expected both existing and new issues, got %+v", body.Issues)
	}
	if body.Issues[0].ID != 3 || body.Issues[0].ScanRuleID != "old_rule" || body.Issues[0].Details["message"] != "existing" {
		t.Errorf("unexpected existing issue response: %+v", body.Issues[0])
	}
	if body.Issues[1].ID != 4 || body.Issues[1].FixedBy != principal.AgentID || body.Issues[1].FixedAt != fixedAt.Format(time.RFC3339) {
		t.Errorf("unexpected reviewed issue response: %+v", body.Issues[1])
	}
	if reportCommand.UserID != principal.AgentID || reportCommand.CourseID != 42 {
		t.Fatalf("unexpected report command: %+v", reportCommand)
	}
}

func TestGetHTMLIssueContentRouteReturnsCurrentHTML(t *testing.T) {
	gin.SetMode(gin.TestMode)
	issue := domain.RehydrateHTMLIssue(5, 12, "image_alt", "/html/body/img", domain.IssueStatusActive, domain.IssueSeverityError, 0, time.Time{}, nil, time.Now(), time.Now())
	principal := auth.Principal{AgentID: 17, TenantID: 7}
	repo := &infrastructure.MockHTMLIssueRepository{
		GetByIDFunc: func(_ context.Context, id int64) (*domain.HTMLIssue, error) {
			if id != issue.ID() {
				t.Fatalf("unexpected issue ID: %d", id)
			}
			return issue, nil
		},
	}
	getUseCase := application.NewGetHTMLIssueContentUseCase(repo, htmlRetrieverFunc(func(_ context.Context, gotPrincipal auth.Principal, contentItemID int64) (string, error) {
		if gotPrincipal != principal || contentItemID != issue.ContentItemID() {
			t.Fatalf("unexpected LMS retrieval: principal=%+v contentItemID=%d", gotPrincipal, contentItemID)
		}
		return `<main><img src="image.png"></main>`, nil
	}))
	handler := NewHandler(nil, nil, nil, nil, getUseCase, nil, nil, nil)
	router := gin.New()
	router.Use(middleware.ErrorHandler())
	handler.RegisterRoutes(router.Group("/accessibility"), principalAuthenticator{principal: principal})

	request := httptest.NewRequest(http.MethodGet, "/accessibility/issues/5/html", nil)
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("unexpected status %d: %s", response.Code, response.Body.String())
	}
	var body struct {
		HTML string `json:"html"`
	}
	if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if body.HTML != `<main><img src="image.png"></main>` {
		t.Fatalf("unexpected HTML response %q", body.HTML)
	}
}
