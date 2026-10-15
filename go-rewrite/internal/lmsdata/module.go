package lmsdata

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	contentdomain "rewritetest/internal/lmsdata/internal/content/domain"
	contentinfrastructure "rewritetest/internal/lmsdata/internal/content/infrastructure"
	coursesapplication "rewritetest/internal/lmsdata/internal/courses/application"
	coursesdomain "rewritetest/internal/lmsdata/internal/courses/domain"
	coursesinfrastructure "rewritetest/internal/lmsdata/internal/courses/infrastructure"
	lmsdatadomain "rewritetest/internal/lmsdata/internal/domain"
	fileReferencesDomain "rewritetest/internal/lmsdata/internal/file_references/domain"
	fileReferencesInfrastructure "rewritetest/internal/lmsdata/internal/file_references/infrastructure"
	filesdomain "rewritetest/internal/lmsdata/internal/files/domain"
	filesinfrastructure "rewritetest/internal/lmsdata/internal/files/infrastructure"
	lmsdatainfrastructure "rewritetest/internal/lmsdata/internal/infrastructure"
	"rewritetest/internal/shared/apperr"
	"rewritetest/internal/shared/auth"
)

type Module struct {
	contentItemRepository   contentdomain.ContentItemRepository
	createCourseUseCase     *coursesapplication.CreateCourseUseCase
	courseRepository        coursesdomain.CourseRepository
	fileRepository          filesdomain.FileRepository
	fileReferenceRepository fileReferencesDomain.FileReferenceRepository
	integration             LMSIntegration
	contentHasher           lmsdatadomain.ContentHasher
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

type CourseSynchronization struct {
	Course          Course
	ChangedContents []ScannableContent
	Files           []File
}

func New(db *sql.DB, integration LMSIntegration) *Module {
	contentItemRepository := contentinfrastructure.NewMySQLContentItemRepository(db)
	courseRepository := coursesinfrastructure.NewMySQLCourseRepository(db)
	fileRepository := filesinfrastructure.NewMySQLFileRepository(db)
	fileReferenceRepository := fileReferencesInfrastructure.NewMySQLFileReferenceRepository(db)
	createCourseUseCase := coursesapplication.NewCreateCourseUseCase(courseRepository)
	contentHasher := lmsdatainfrastructure.NewBlake3ContentHasher()

	return &Module{
		contentItemRepository:   contentItemRepository,
		createCourseUseCase:     createCourseUseCase,
		courseRepository:        courseRepository,
		fileRepository:          fileRepository,
		fileReferenceRepository: fileReferenceRepository,
		integration:             integration,
		contentHasher:           contentHasher,
	}
}

func (m *Module) replaceFileReferences(ctx context.Context, contentItemIDs []int64, fileReferences []FileReference) error {
	domainReferences := make([]*fileReferencesDomain.FileReference, len(fileReferences))
	for i, fileReference := range fileReferences {
		domainReferences[i] = fileReferencesDomain.NewFileReference(fileReference.ContentItemID, fileReference.FileID)
	}

	return m.fileReferenceRepository.ReplaceForContentItems(ctx, contentItemIDs, domainReferences)
}

func (m *Module) SynchronizeCourse(ctx context.Context, principal auth.Principal, courseID int64, changedSince time.Time) (CourseSynchronization, error) {
	course, err := m.GetCourse(ctx, courseID)
	if err != nil {
		return CourseSynchronization{}, err
	}

	currentContentItems, err := m.GetContentItemsByCourse(ctx, courseID)
	if err != nil {
		return CourseSynchronization{}, err
	}

	externalContent, err := m.integration.GetCourseContent(ctx, GetCourseContentRequest{
		CourseID:           courseID,
		ExternalCourseID:   course.ExternalID,
		ExternalCourseData: course.ExternalData,
		TenantID:           principal.TenantID,
		UserID:             principal.AgentID,
		CurrentContent:     currentContentItems,
	})
	if err != nil {
		return CourseSynchronization{}, err
	}

	currentByExternalID := make(map[string]ContentItem, len(currentContentItems))
	for _, item := range currentContentItems {
		currentByExternalID[item.ExternalID] = item
	}

	changedContent := make([]ScannableContent, 0, len(externalContent.ContentItems))
	contentToPersist := make([]ContentItem, 0, len(externalContent.ContentItems))
	for _, item := range externalContent.ContentItems {
		hash, err := m.contentHasher.HashContent(item.HTML)
		if err != nil {
			return CourseSynchronization{}, err
		}
		current, exists := currentByExternalID[item.ExternalID]
		contentChangedAt := current.ContentChangedAt
		if !exists || current.ContentHash != hash {
			contentChangedAt = time.Now()
		}
		content := ContentItem{
			ID:               current.ID,
			CourseID:         courseID,
			ExternalID:       item.ExternalID,
			ExternalData:     item.ExternalData,
			ContentHash:      hash,
			ContentChangedAt: contentChangedAt,
		}
		contentToPersist = append(contentToPersist, content)
		if !contentChangedAt.After(changedSince) {
			continue
		}
		changedContent = append(changedContent, ScannableContent{
			ID:           current.ID,
			CourseID:     courseID,
			ExternalID:   item.ExternalID,
			ExternalData: item.ExternalData,
			ContentHash:  hash,
			HTML:         item.HTML,
		})
	}

	if len(contentToPersist) > 0 {
		idMap, err := m.CreateManyContentItems(ctx, contentToPersist)
		if err != nil {
			return CourseSynchronization{}, err
		}
		for i := range changedContent {
			if id, ok := idMap[changedContent[i].ExternalID]; ok {
				changedContent[i].ID = id
			}
		}
	}

	filesToSync := make([]FileSyncInput, len(externalContent.Files))
	for i, file := range externalContent.Files {
		filesToSync[i] = FileSyncInput{
			FileName:     file.FileName,
			FileType:     file.FileType,
			UpdatedAt:    file.UpdatedAt,
			FileSize:     file.FileSize,
			DownloadURL:  file.DownloadURL,
			ExternalID:   file.ExternalID,
			ExternalData: file.ExternalData,
		}
	}
	if err := m.SyncFilesForCourse(ctx, courseID, filesToSync); err != nil {
		return CourseSynchronization{}, err
	}

	files, err := m.GetFilesByCourse(ctx, courseID)
	if err != nil {
		return CourseSynchronization{}, err
	}

	return CourseSynchronization{
		Course:          course,
		ChangedContents: changedContent,
		Files:           files,
	}, nil
}

func (m *Module) AddFileReferences(ctx context.Context, principal auth.Principal, request AddFileReferencesRequest) error {
	course, err := m.GetCourse(ctx, request.CourseID)
	if err != nil {
		return err
	}

	contentItems, err := m.GetContentItemsByCourse(ctx, request.CourseID)
	if err != nil {
		return err
	}
	contentExternalIDs := make(map[int64]string, len(contentItems))
	for _, item := range contentItems {
		contentExternalIDs[item.ID] = item.ExternalID
	}

	externalReferences := make([]ExternalContentReference, 0, len(request.References))
	for _, reference := range request.References {
		externalID, ok := contentExternalIDs[reference.ContentItemID]
		if !ok || externalID == "" {
			continue
		}
		externalReferences = append(externalReferences, ExternalContentReference{
			ContentExternalID: externalID,
			Kind:              reference.Kind,
			TagName:           reference.TagName,
			Attribute:         reference.Attribute,
			Value:             reference.Value,
			XPath:             reference.XPath,
		})
	}

	files, err := m.GetFilesByCourse(ctx, request.CourseID)
	if err != nil {
		return err
	}
	resolved, err := m.integration.ResolveFileReferences(ctx, ResolveFileReferencesRequest{
		Course:         course,
		References:     externalReferences,
		PersistedFiles: files,
		TenantID:       principal.TenantID,
	})
	if err != nil {
		return err
	}

	contentIDsByExternalID := make(map[string]int64, len(contentItems))
	for _, item := range contentItems {
		contentIDsByExternalID[item.ExternalID] = item.ID
	}
	fileIDsByExternalID := make(map[string]int64, len(files))
	for _, file := range files {
		fileIDsByExternalID[file.ExternalID] = file.ID
	}

	fileReferences := make([]FileReference, 0, len(resolved))
	seen := make(map[string]struct{}, len(resolved))
	for _, reference := range resolved {
		contentID, contentOK := contentIDsByExternalID[reference.ContentExternalID]
		fileID, fileOK := fileIDsByExternalID[reference.FileExternalID]
		if !contentOK || !fileOK {
			continue
		}
		key := fmt.Sprintf("%d:%d", contentID, fileID)
		if _, ok := seen[key]; ok {
			continue
		}
		seen[key] = struct{}{}
		fileReferences = append(fileReferences, FileReference{ContentItemID: contentID, FileID: fileID})
	}

	return m.replaceFileReferences(ctx, request.ContentItemIDs, fileReferences)
}

type ContentItem struct {
	ID               int64
	ExternalID       string
	ExternalData     map[string]any
	ContentHash      string
	ContentChangedAt time.Time
	CourseID         int64
}

func (m *Module) GetContentItemsByCourse(ctx context.Context, courseID int64) ([]ContentItem, error) {
	contentItems, err := m.contentItemRepository.GetByCourseID(ctx, courseID)
	if err != nil {
		return nil, err
	}

	result := make([]ContentItem, len(contentItems))
	for i, item := range contentItems {
		result[i] = ContentItem{
			ID:               item.ID(),
			ExternalID:       item.ExternalID(),
			ContentHash:      item.ContentHash(),
			CourseID:         item.CourseID(),
			ExternalData:     item.ExternalData(),
			ContentChangedAt: item.ContentChangedAt(),
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
		contentItem.ContentChangedAt,
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
			item.ContentChangedAt,
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
