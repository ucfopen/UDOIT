package accessibility

import (
	"context"
	"database/sql"
	"net/http"

	"rewritetest/internal/accessibility/internal"
	"rewritetest/internal/accessibility/internal/application"
	"rewritetest/internal/accessibility/internal/domain"
	"rewritetest/internal/accessibility/internal/infrastructure"
	"rewritetest/internal/lms"
	"rewritetest/internal/lmsdata"

	"github.com/gin-gonic/gin"
)

type ContentItemService interface {
	GetContentItemsByCourse(ctx context.Context, courseID int64) ([]lmsdata.ContentItem, error)
	CreateManyContentItems(ctx context.Context, contentItems []lmsdata.ContentItem) (map[string]int64, error)
}

type ExternalContentRetriever interface {
	GetContent(ctx context.Context, req lms.GetContentRequest) (lms.CourseSyncDataDTO, error)
	ResolveFileReferences(ctx context.Context, req lms.ResolveFileReferencesRequest) ([]lms.ResolvedFileReferenceDTO, error)
}

type CourseFileSyncService interface {
	SyncFilesForCourse(ctx context.Context, courseID int64, files []lmsdata.FileSyncInput) error
	GetFilesByCourse(ctx context.Context, courseID int64) ([]lmsdata.File, error)
}

type FileReferenceStore interface {
	ReplaceFileReferences(ctx context.Context, contentItemIDs []int64, fileReferences []lmsdata.FileReference) error
}

type Authenticator interface {
	WithAuth() gin.HandlerFunc
}

type Module struct {
	handler       *internal.Handler
	authenticator internal.Authenticator
	htmlIssueRepo domain.HTMLIssueRepository
	fileIssueRepo domain.FileIssueRepository
}

func New(
	db *sql.DB,
	courseRetriever application.CourseRetriever,
	contentItemService ContentItemService,
	externalContentRetriever ExternalContentRetriever,
	courseFileSyncService CourseFileSyncService,
	fileReferenceStore FileReferenceStore,
	authenticator Authenticator,
) *Module {
	httpClient := &http.Client{}
	baseURL := "http://udoit3-ace:3000"
	contentScanner := infrastructure.NewEqualAccessScanner(httpClient, baseURL)
	blake3Hasher := infrastructure.NewBlake3ContentHasher()
	reportRepository := infrastructure.NewMySQLReportRepository(db)
	htmlIssueRepository := infrastructure.NewMySQLIssueRepository(db)
	fileIssueRepository := infrastructure.NewMySQLFileIssueRepository(db)

	scanCourseUseCase := application.NewScanCourseUseCase(
		htmlIssueRepository,
		fileIssueRepository,
		fileReferenceStore,
		courseRetriever,
		contentItemService,
		externalContentRetriever,
		blake3Hasher,
		courseFileSyncService,
		contentScanner,
	)
	createReportUseCase := application.NewCreateReportUseCase(
		reportRepository,
		htmlIssueRepository,
	)
	markHtmlAsReviewedUseCase := application.NewHtmlIssueReviewedUseCase(
		htmlIssueRepository,
	)

	markFileAsReviewedUseCase := application.NewFileissueReviewedUseCase(
		fileIssueRepository,
	)

	handler := internal.NewHandler(scanCourseUseCase, createReportUseCase, markHtmlAsReviewedUseCase, markFileAsReviewedUseCase)

	return &Module{
		handler:       handler,
		authenticator: authenticator,
		htmlIssueRepo: htmlIssueRepository,
		fileIssueRepo: fileIssueRepository,
	}
}

func (m *Module) RegisterRoutes(rg *gin.RouterGroup) {
	m.handler.RegisterRoutes(rg, m.authenticator)
}
