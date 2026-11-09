package application

import (
	"context"
	"time"

	"rewritetest/internal/accessibility/internal/domain"
	"rewritetest/internal/lms"
	"rewritetest/internal/shared/apperr"
	"rewritetest/internal/shared/auth"

	"github.com/google/uuid"
)

type FileIssueReader interface {
	GetByID(context.Context, int64) (*domain.FileIssue, error)
	DeleteByFileID(context.Context, int64) error
	Update(context.Context, *domain.FileIssue) error
}

type FileDataService interface {
	GetFile(context.Context, int64) (lms.File, error)
	CreateReplacementFile(context.Context, int64, lms.UploadedFile) (lms.File, error)
}

type CourseRetriever interface {
	GetCourse(context.Context, int64) (lms.Course, error)
}

type FileUploader interface {
	BeginFileUpload(context.Context, lms.BeginFileUploadRequest) (lms.FileUploadInstruction, error)
	CompleteFileUpload(context.Context, lms.CompleteFileUploadRequest) (lms.UploadedFile, error)
}

type BeginFileReplacementCommand struct {
	Principal   auth.Principal
	FileIssueID int64
	NewFileName string
	NewFileSize int64
}

type BeginFileReplacementResult struct {
	UploadSessionID string
	Instruction     lms.FileUploadInstruction
}

type BeginFileReplacementUseCase struct {
	fileIssueReader FileIssueReader
	fileDataService FileDataService
	courseRetriever CourseRetriever
	fileUploader    FileUploader
	sessionRepo     domain.FileUploadSessionRepository
	sessionTTL      time.Duration
}

func NewBeginFileReplacementUseCase(
	fileIssueReader FileIssueReader,
	fileDataService FileDataService,
	courseRetriever CourseRetriever,
	fileUploader FileUploader,
	sessionRepo domain.FileUploadSessionRepository,
	sessionTTL time.Duration,
) *BeginFileReplacementUseCase {
	return &BeginFileReplacementUseCase{
		fileIssueReader: fileIssueReader,
		fileDataService: fileDataService,
		courseRetriever: courseRetriever,
		fileUploader:    fileUploader,
		sessionRepo:     sessionRepo,
		sessionTTL:      sessionTTL,
	}
}

func (u *BeginFileReplacementUseCase) Execute(ctx context.Context, cmd BeginFileReplacementCommand) (BeginFileReplacementResult, error) {
	file, course, _, err := loadFileContext(ctx, u.fileIssueReader, u.fileDataService, u.courseRetriever, cmd.Principal, cmd.FileIssueID)
	if err != nil {
		return BeginFileReplacementResult{}, err
	}

	instruction, err := u.fileUploader.BeginFileUpload(ctx, lms.BeginFileUploadRequest{
		Principal:   cmd.Principal,
		Course:      toLMSCourseInfo(course),
		File:        toLMSFileInfo(file),
		NewFileName: cmd.NewFileName,
		NewFileSize: cmd.NewFileSize,
	})
	if err != nil {
		return BeginFileReplacementResult{}, err
	}

	sessionID := uuid.NewString()
	expiresAt := time.Now().Add(u.sessionTTL)
	persistedSession, err := u.sessionRepo.Create(ctx, domain.FileUploadSession{
		ID:          sessionID,
		UserID:      cmd.Principal.AgentID,
		TenantID:    cmd.Principal.TenantID,
		FileIssueID: cmd.FileIssueID,
		FileID:      file.ID,
		NewFileName: cmd.NewFileName,
		NewFileSize: cmd.NewFileSize,
		ExpiresAt:   expiresAt,
	})
	if err != nil {
		return BeginFileReplacementResult{}, err
	}

	return BeginFileReplacementResult{
		UploadSessionID: persistedSession.ID,
		Instruction:     instruction,
	}, nil
}

type CompleteFileReplacementCommand struct {
	Principal       auth.Principal
	FileIssueID     int64
	UploadSessionID string
	UploadResponse  map[string]any
}

type CompleteFileReplacementUseCase struct {
	fileIssueReader FileIssueReader
	fileDataService FileDataService
	courseRetriever CourseRetriever
	fileUploader    FileUploader
	sessionRepo     domain.FileUploadSessionRepository
}

func NewCompleteFileReplacementUseCase(
	fileIssueReader FileIssueReader,
	fileDataService FileDataService,
	courseRetriever CourseRetriever,
	fileUploader FileUploader,
	sessionRepo domain.FileUploadSessionRepository,
) *CompleteFileReplacementUseCase {
	return &CompleteFileReplacementUseCase{
		fileIssueReader: fileIssueReader,
		fileDataService: fileDataService,
		courseRetriever: courseRetriever,
		fileUploader:    fileUploader,
		sessionRepo:     sessionRepo,
	}
}

func (u *CompleteFileReplacementUseCase) Execute(ctx context.Context, cmd CompleteFileReplacementCommand) (lms.File, error) {
	session, err := u.sessionRepo.GetByID(ctx, cmd.UploadSessionID)
	if err != nil {
		return lms.File{}, err
	}
	if session == nil || session.UserID != cmd.Principal.AgentID || session.TenantID != cmd.Principal.TenantID || session.FileIssueID != cmd.FileIssueID {
		return lms.File{}, apperr.New(apperr.CodeNotFound, "Upload session not found")
	}
	file, course, issue, err := loadFileContext(ctx, u.fileIssueReader, u.fileDataService, u.courseRetriever, cmd.Principal, cmd.FileIssueID)
	if err != nil {
		return lms.File{}, err
	}
	if file.ID != session.FileID {
		return lms.File{}, apperr.New(apperr.CodeNotFound, "Upload session not found")
	}

	uploadedFile, err := u.fileUploader.CompleteFileUpload(ctx, lms.CompleteFileUploadRequest{
		Principal:      cmd.Principal,
		Course:         toLMSCourseInfo(course),
		File:           toLMSFileInfo(file),
		NewFileName:    session.NewFileName,
		UploadResponse: cmd.UploadResponse,
	})
	if err != nil {
		return lms.File{}, err
	}
	newFile, err := u.fileDataService.CreateReplacementFile(ctx, course.ID, uploadedFile)
	if err != nil {
		return lms.File{}, err
	}
	
	issue.Review(session.UserID, time.Now())
	if err := u.fileIssueReader.Update(ctx, issue); err != nil {
		return lms.File{}, err
	}

	if err := u.sessionRepo.DeleteByID(ctx, cmd.UploadSessionID); err != nil {
		return lms.File{}, err
	}
	return newFile, nil
}

func loadFileContext(
	ctx context.Context,
	fileIssueReader FileIssueReader,
	fileDataService FileDataService,
	courseRetriever CourseRetriever,
	principal auth.Principal,
	fileIssueID int64,
) (lms.File, lms.Course, *domain.FileIssue, error) {
	issue, err := fileIssueReader.GetByID(ctx, fileIssueID)
	if err != nil {
		return lms.File{}, lms.Course{}, nil, err
	}
	if issue == nil {
		return lms.File{}, lms.Course{}, nil, apperr.New(apperr.CodeNotFound, "File issue not found")
	}

	file, err := fileDataService.GetFile(ctx, issue.FileID())
	if err != nil {
		return lms.File{}, lms.Course{}, nil, err
	}

	course, err := courseRetriever.GetCourse(ctx, file.CourseID)
	if err != nil {
		return lms.File{}, lms.Course{}, nil, err
	}
	if course.TenantID != principal.TenantID {
		return lms.File{}, lms.Course{}, nil, apperr.New(apperr.CodeNotFound, "Course not found")
	}
	return file, course, issue, nil
}

func toLMSFileInfo(file lms.File) lms.FileInfo {
	return lms.FileInfo{
		ID:           file.ID,
		FileName:     file.FileName,
		FileType:     file.FileType,
		UpdatedAt:    file.UpdatedAt,
		FileSize:     file.FileSize,
		DownloadURL:  file.DownloadURL,
		ExternalID:   file.ExternalID,
		ExternalData: file.ExternalData,
	}
}

func toLMSCourseInfo(course lms.Course) lms.CourseInfo {
	return lms.CourseInfo{
		ID:           course.ID,
		ExternalID:   course.ExternalID,
		ExternalData: course.ExternalData,
	}
}
