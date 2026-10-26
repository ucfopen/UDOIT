package accessibility

import (
	"database/sql"
	"net/http"
	"time"

	"rewritetest/internal/accessibility/internal"
	"rewritetest/internal/accessibility/internal/application"
	"rewritetest/internal/accessibility/internal/infrastructure"
	"rewritetest/internal/auth"
	"rewritetest/internal/lms"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type Module struct {
	handler                 *internal.Handler
	authenticator           auth.Authenticator
	uploadSessionRepository application.FileUploadSessionRepository
}

func New(
	db *sql.DB,
	redisClient *redis.Client,
	lmsDataService application.AccessibilityDataService,
	fileUploader lms.FileUploader,
	authenticator auth.Authenticator,
) *Module {
	httpClient := &http.Client{}
	baseURL := "http://udoit3-ace:3000"
	contentScanner := infrastructure.NewEqualAccessScanner(httpClient, baseURL)
	reportRepository := infrastructure.NewMySQLReportRepository(db)
	htmlIssueRepository := infrastructure.NewMySQLIssueRepository(db)
	fileIssueRepository := infrastructure.NewMySQLFileIssueRepository(db)
	fileUploadSessionRepository := infrastructure.NewRedisFileUploadSessionRepository(redisClient, 15*time.Minute, "file_upload_session:")
	scanRepository := infrastructure.NewMySQLCourseScanRepository(db)

	scanCourseUseCase := application.NewScanCourseUseCase(
		htmlIssueRepository,
		fileIssueRepository,
		lmsDataService,
		contentScanner,
		scanRepository,
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
	beginFileReplacementUseCase := application.NewBeginFileReplacementUseCase(
		fileIssueRepository,
		lmsDataService,
		fileUploader,
		fileUploadSessionRepository,
		15*time.Minute,
	)
	completeFileReplacementUseCase := application.NewCompleteFileReplacementUseCase(
		fileIssueRepository,
		lmsDataService,
		fileUploader,
		fileUploadSessionRepository,
	)

	handler := internal.NewHandler(
		scanCourseUseCase,
		createReportUseCase,
		markHtmlAsReviewedUseCase,
		markFileAsReviewedUseCase,
		beginFileReplacementUseCase,
		completeFileReplacementUseCase,
	)

	return &Module{
		handler:                 handler,
		authenticator:           authenticator,
		uploadSessionRepository: fileUploadSessionRepository,
	}
}

func (m *Module) RegisterRoutes(rg *gin.RouterGroup) {
	m.handler.RegisterRoutes(rg, m.authenticator)
}
