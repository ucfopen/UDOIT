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
	"rewritetest/internal/auth"
	"rewritetest/internal/lms"
	"rewritetest/internal/lmsdata"
	sharedAuth "rewritetest/internal/shared/auth"
	"rewritetest/internal/shared/http/middleware"

	"github.com/gin-gonic/gin"
)

type handlerFileIssueReader struct {
	issue *domain.FileIssue
}

func (r handlerFileIssueReader) GetByID(context.Context, int64) (*domain.FileIssue, error) {
	return r.issue, nil
}

type handlerFileDataService struct {
	file   lmsdata.File
	course lmsdata.Course
}

func (s handlerFileDataService) GetFile(context.Context, int64) (lmsdata.File, error) {
	return s.file, nil
}

func (s handlerFileDataService) UpdateFile(context.Context, lmsdata.File) error {
	return nil
}

func (s handlerFileDataService) GetCourse(context.Context, int64) (lmsdata.Course, error) {
	return s.course, nil
}

type handlerFileUploader struct{}

type handlerSessionRepository struct {
	sessions map[string]application.FileUploadSession
}

func (r *handlerSessionRepository) Create(_ context.Context, session application.FileUploadSession) error {
	r.sessions[session.ID] = session
	return nil
}

func (r *handlerSessionRepository) GetByID(_ context.Context, id string) (*application.FileUploadSession, error) {
	session, ok := r.sessions[id]
	if !ok {
		return nil, nil
	}
	return &session, nil
}

func (r *handlerSessionRepository) DeleteByID(_ context.Context, id string) error {
	delete(r.sessions, id)
	return nil
}

func (handlerFileUploader) BeginFileUpload(context.Context, lms.BeginFileUploadRequest) (lms.FileUploadInstruction, error) {
	return lms.FileUploadInstruction{
		Method:  http.MethodPost,
		URL:     "https://upload.example/target",
		Fields:  map[string]string{"policy": "value"},
		Headers: map[string]string{"Accept": "application/json"},
	}, nil
}

func (handlerFileUploader) CompleteFileUpload(context.Context, lms.CompleteFileUploadRequest) (lms.UploadedFile, error) {
	return lms.UploadedFile{}, nil
}

type handlerAuthenticator struct {
	principal sharedAuth.Principal
}

func (a handlerAuthenticator) WithAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		sharedAuth.SetPrincipal(c, a.principal)
		c.Next()
	}
}

func TestBeginFileReplacementRouteReturnsUploadInstruction(t *testing.T) {
	gin.SetMode(gin.TestMode)
	issue, err := domain.RehydrateFileIssue(9, 34, nil, nil, time.Now(), time.Now())
	if err != nil {
		t.Fatal(err)
	}

	beginUseCase := application.NewBeginFileReplacementUseCase(
		handlerFileIssueReader{issue: issue},
		handlerFileDataService{
			file:   lmsdata.File{ID: 34, CourseID: 12},
			course: lmsdata.Course{ID: 12, TenantID: 7},
		},
		handlerFileUploader{},
		&handlerSessionRepository{sessions: make(map[string]application.FileUploadSession)},
		15*time.Minute,
	)
	handler := NewHandler(nil, nil, nil, nil, beginUseCase, nil)
	router := gin.New()
	router.Use(middleware.ErrorHandler())
	handler.RegisterRoutes(router.Group("/accessibility"), handlerAuthenticator{principal: sharedAuth.Principal{AgentID: 17, TenantID: 7}})

	request := httptest.NewRequest(http.MethodPost, "/accessibility/file-issues/9/upload", strings.NewReader(`{"fileName":"accessible.pdf"}`))
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", response.Code, response.Body.String())
	}
	if !strings.Contains(response.Body.String(), `"url":"https://upload.example/target"`) {
		t.Fatalf("expected upload URL in response, got %s", response.Body.String())
	}
}

func TestBeginFileReplacementRouteRejectsMissingFilename(t *testing.T) {
	gin.SetMode(gin.TestMode)
	handler := NewHandler(nil, nil, nil, nil, nil, nil)
	router := gin.New()
	router.Use(middleware.ErrorHandler())
	handler.RegisterRoutes(router.Group("/accessibility"), handlerAuthenticator{principal: sharedAuth.Principal{AgentID: 17, TenantID: 7}})

	request := httptest.NewRequest(http.MethodPost, "/accessibility/file-issues/9/upload", strings.NewReader(`{"fileName":""}`))
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)

	if response.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", response.Code)
	}
	if !strings.Contains(response.Body.String(), "A file name is required") {
		t.Fatalf("expected validation error, got %s", response.Body.String())
	}
}

var _ auth.Authenticator = handlerAuthenticator{}
