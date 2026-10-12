package accessibility

import (
	"database/sql"
	"net/http"

	"rewritetest/internal/accessibility/internal"
	"rewritetest/internal/accessibility/internal/application"
	"rewritetest/internal/accessibility/internal/domain"
	"rewritetest/internal/accessibility/internal/infrastructure"

	"github.com/gin-gonic/gin"
)

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
	lmsDataService application.LMSDataService,
	authenticator Authenticator,
) *Module {
	httpClient := &http.Client{}
	baseURL := "http://udoit3-ace:3000"
	contentScanner := infrastructure.NewEqualAccessScanner(httpClient, baseURL)
	reportRepository := infrastructure.NewMySQLReportRepository(db)
	htmlIssueRepository := infrastructure.NewMySQLIssueRepository(db)
	fileIssueRepository := infrastructure.NewMySQLFileIssueRepository(db)

	scanCourseUseCase := application.NewScanCourseUseCase(
		htmlIssueRepository,
		fileIssueRepository,
		lmsDataService,
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
