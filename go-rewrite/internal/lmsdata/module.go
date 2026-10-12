package lmsdata

import (
	"context"
	"database/sql"
	"time"

	contentdomain "rewritetest/internal/lmsdata/internal/content/domain"
	contentinfrastructure "rewritetest/internal/lmsdata/internal/content/infrastructure"
	coursesapplication "rewritetest/internal/lmsdata/internal/courses/application"
	coursesdomain "rewritetest/internal/lmsdata/internal/courses/domain"
	coursesinfrastructure "rewritetest/internal/lmsdata/internal/courses/infrastructure"
	fileReferencesDomain "rewritetest/internal/lmsdata/internal/file_references/domain"
	fileReferencesInfrastructure "rewritetest/internal/lmsdata/internal/file_references/infrastructure"
	filesdomain "rewritetest/internal/lmsdata/internal/files/domain"
	filesinfrastructure "rewritetest/internal/lmsdata/internal/files/infrastructure"
	"rewritetest/internal/shared/apperr"
)

type Module struct {
	contentItemRepository   contentdomain.ContentItemRepository
	createCourseUseCase     *coursesapplication.CreateCourseUseCase
	courseRepository        coursesdomain.CourseRepository
	fileRepository          filesdomain.FileRepository
	fileReferenceRepository fileReferencesDomain.FileReferenceRepository
}

type File struct {
	ID           int64
	CourseID     int64
	FileName     string
	FileType     string
	UpdatedAt    time.Time
	FileSize     int64
	DownloadURL  string
	ExternalID   string
	ExternalData map[string]any
}

type FileSyncInput struct {
	FileName     string
	FileType     string
	UpdatedAt    time.Time
	FileSize     int64
	DownloadURL  string
	ExternalID   string
	ExternalData map[string]any
}

type FileReference struct {
	ContentItemID int64
	FileID        int64
}

func New(db *sql.DB) *Module {
	contentItemRepository := contentinfrastructure.NewMySQLContentItemRepository(db)
	courseRepository := coursesinfrastructure.NewMySQLCourseRepository(db)
	fileRepository := filesinfrastructure.NewMySQLFileRepository(db)
	fileReferenceRepository := fileReferencesInfrastructure.NewMySQLFileReferenceRepository(db)
	createCourseUseCase := coursesapplication.NewCreateCourseUseCase(courseRepository)

	return &Module{
		contentItemRepository:   contentItemRepository,
		createCourseUseCase:     createCourseUseCase,
		courseRepository:        courseRepository,
		fileRepository:          fileRepository,
		fileReferenceRepository: fileReferenceRepository,
	}
}

func (m *Module) ReplaceFileReferences(ctx context.Context, contentItemIDs []int64, fileReferences []FileReference) error {
	domainReferences := make([]*fileReferencesDomain.FileReference, len(fileReferences))
	for i, fileReference := range fileReferences {
		domainReferences[i] = fileReferencesDomain.NewFileReference(fileReference.ContentItemID, fileReference.FileID)
	}

	return m.fileReferenceRepository.ReplaceForContentItems(ctx, contentItemIDs, domainReferences)
}

type ContentItem struct {
	ID           int64
	ExternalID   string
	ExternalData map[string]any
	ContentHash  string
	CourseID     int64
}

func (m *Module) GetContentItemsByCourse(ctx context.Context, courseID int64) ([]ContentItem, error) {
	contentItems, err := m.contentItemRepository.GetByCourseID(ctx, courseID)
	if err != nil {
		return nil, err
	}

	result := make([]ContentItem, len(contentItems))
	for i, item := range contentItems {
		result[i] = ContentItem{
			ID:           item.ID(),
			ExternalID:   item.ExternalID(),
			ContentHash:  item.ContentHash(),
			CourseID:     item.CourseID(),
			ExternalData: item.ExternalData(),
		}
	}
	return result, nil
}

func (m *Module) CreateContentItem(ctx context.Context, contentItem ContentItem) error {
	return m.contentItemRepository.Create(ctx, contentdomain.NewContentItem(
		contentItem.CourseID,
		contentItem.ContentHash,
		contentItem.ExternalID,
		contentItem.ExternalData,
	))
}

// CreateManyContentItems upserts content items and returns their database IDs.
func (m *Module) CreateManyContentItems(ctx context.Context, contentItems []ContentItem) (map[string]int64, error) {
	domainContentItems := make([]*contentdomain.ContentItem, len(contentItems))
	for i, item := range contentItems {
		domainContentItems[i] = contentdomain.NewContentItem(
			item.CourseID,
			item.ContentHash,
			item.ExternalID,
			item.ExternalData,
		)
	}

	return m.contentItemRepository.CreateMany(ctx, domainContentItems)
}

func (m *Module) CreateCourse(ctx context.Context, title string, tenantID int64, externalID string, externalData map[string]any) (int64, error) {
	return m.createCourseUseCase.Execute(ctx, coursesapplication.CreateCourseCommand{
		Title:        title,
		TenantID:     tenantID,
		ExternalID:   externalID,
		ExternalData: externalData,
	})
}

type Course struct {
	ID           int64
	ExternalID   string
	ExternalData map[string]any
}

func (m *Module) GetCourse(ctx context.Context, courseID int64) (Course, error) {
	course, err := m.courseRepository.GetByID(ctx, courseID)
	if err != nil {
		return Course{}, err
	}
	if course == nil {
		return Course{}, apperr.New(apperr.CodeInternal, "The requested course was not found.")
	}

	return Course{
		ID:           course.ID(),
		ExternalID:   course.ExternalID(),
		ExternalData: course.ExternalData(),
	}, nil
}

func (m *Module) SyncFilesForCourse(ctx context.Context, courseID int64, files []FileSyncInput) error {
	records := make([]filesdomain.CourseFileSyncRecord, len(files))
	for i, file := range files {
		records[i] = filesdomain.CourseFileSyncRecord{
			FileName:     file.FileName,
			FileType:     file.FileType,
			UpdatedAt:    file.UpdatedAt.Format(time.RFC3339),
			FileSize:     file.FileSize,
			DownloadURL:  file.DownloadURL,
			ExternalID:   file.ExternalID,
			ExternalData: file.ExternalData,
		}
	}

	return m.fileRepository.UpsertByCourse(ctx, courseID, records)
}

func (m *Module) GetFilesByCourse(ctx context.Context, courseID int64) ([]File, error) {
	files, err := m.fileRepository.GetByCourseID(ctx, courseID)
	if err != nil {
		return nil, err
	}

	result := make([]File, len(files))
	for i, file := range files {
		result[i] = File{
			CourseID:     file.CourseID(),
			ID:           file.ID(),
			FileName:     file.FileName(),
			FileType:     file.FileType(),
			UpdatedAt:    file.UpdatedAt(),
			FileSize:     file.FileSize(),
			DownloadURL:  file.DownloadURL(),
			ExternalID:   file.ExternalID(),
			ExternalData: file.ExternalData(),
		}
	}

	return result, nil
}
