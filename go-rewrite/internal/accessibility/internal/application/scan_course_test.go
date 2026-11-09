package application

import (
	"context"
	"testing"
	"time"

	"rewritetest/internal/accessibility/internal/domain"
	"rewritetest/internal/accessibility/internal/infrastructure"
	"rewritetest/internal/lms"
	"rewritetest/internal/shared/auth"
)

type scanCourseDataServiceFunc func(context.Context, auth.Principal, int64, time.Time) (lms.CourseSynchronization, error)

func (f scanCourseDataServiceFunc) SynchronizeCourse(ctx context.Context, principal auth.Principal, courseID int64, changedSince time.Time) (lms.CourseSynchronization, error) {
	return f(ctx, principal, courseID, changedSince)
}

type scanCourseReferenceServiceFunc func(context.Context, auth.Principal, lms.AddFileReferencesRequest) error

func (f scanCourseReferenceServiceFunc) AddFileReferences(ctx context.Context, principal auth.Principal, request lms.AddFileReferencesRequest) error {
	return f(ctx, principal, request)
}

type scanCourseScannerFunc func(context.Context, []domain.ScanItem) (domain.ScanContentResult, error)

func (f scanCourseScannerFunc) ScanContent(ctx context.Context, items []domain.ScanItem) (domain.ScanContentResult, error) {
	return f(ctx, items)
}

type scanCourseFileIssueRepository struct{}

func (scanCourseFileIssueRepository) SyncForCourse(context.Context, int64, []int64) error { return nil }
func (scanCourseFileIssueRepository) DeleteByFileID(context.Context, int64) error         { return nil }
func (scanCourseFileIssueRepository) GetByID(context.Context, int64) (*domain.FileIssue, error) {
	return nil, nil
}
func (scanCourseFileIssueRepository) Update(context.Context, *domain.FileIssue) error { return nil }

type scanCourseRepository struct{}

func (scanCourseRepository) LastCompletedAt(context.Context, int64) (time.Time, error) {
	return time.Time{}, nil
}
func (scanCourseRepository) Start(_ context.Context, scan *domain.CourseScan) (*domain.CourseScan, error) {
	return scan, nil
}
func (scanCourseRepository) Complete(context.Context, *domain.CourseScan) error { return nil }

func TestScanCourseReturnsAllPersistedIssues(t *testing.T) {
	oldIssue := domain.RehydrateHTMLIssue(3, 10, "old_rule", "/html/body/p", domain.IssueStatusActive, domain.IssueSeveritySuggestion, 0, time.Time{}, map[string]any{"message": "existing"}, time.Now(), time.Now())
	newIssue := domain.RehydrateHTMLIssue(4, 11, "new_rule", "/html/body/img", domain.IssueStatusActive, domain.IssueSeverityError, 0, time.Time{}, map[string]any{"message": "new"}, time.Now(), time.Now())
	repository := &infrastructure.MockHTMLIssueRepository{
		DeleteByIDsFunc: func(context.Context, []int64) error { return nil },
		CreateManyFunc: func(context.Context, []*domain.HTMLIssue) ([]*domain.HTMLIssue, error) {
			return []*domain.HTMLIssue{newIssue}, nil
		},
		GetByCourseFunc: func(_ context.Context, courseID int64) ([]*domain.HTMLIssue, error) {
			if courseID != 42 {
				t.Fatalf("unexpected course ID: %d", courseID)
			}
			return []*domain.HTMLIssue{oldIssue, newIssue}, nil
		},
	}
	useCase := NewScanCourseUseCase(
		repository,
		scanCourseFileIssueRepository{},
		scanCourseDataServiceFunc(func(context.Context, auth.Principal, int64, time.Time) (lms.CourseSynchronization, error) {
			return lms.CourseSynchronization{ChangedContents: []lms.ScannableContent{{ID: 11, HTML: "<img>"}}}, nil
		}),
		scanCourseReferenceServiceFunc(func(context.Context, auth.Principal, lms.AddFileReferencesRequest) error { return nil }),
		scanCourseScannerFunc(func(context.Context, []domain.ScanItem) (domain.ScanContentResult, error) {
			return domain.ScanContentResult{Issues: []domain.ScanResult{{
				ContentItemID: 11, ScanRule: "new_rule", ContentXPath: "/html/body/img",
				Severity: domain.IssueSeverityError, Details: map[string]any{"message": "new"},
			}}}, nil
		}),
		scanCourseRepository{},
	)

	issues, err := useCase.Execute(context.Background(), auth.Principal{AgentID: 17}, 42)
	if err != nil {
		t.Fatalf("Execute returned error: %v", err)
	}
	if len(issues) != 2 || issues[0] != oldIssue || issues[1] != newIssue {
		t.Fatalf("expected existing and newly scanned issues, got %+v", issues)
	}
}
