package application

import (
	"context"
	"fmt"

	"rewritetest/internal/accessibility/internal/domain"
	"rewritetest/internal/lms"
	"rewritetest/internal/lmsdata"
	"rewritetest/internal/shared/auth"
)

type ScanCourseIssue struct {
	ContentItemID int64
	ScanRule      string
	Status        string
	Severity      string
	ContentXPath  string
	Details       map[string]any
}

type CourseRetriever interface {
	GetCourse(ctx context.Context, courseID int64) (lmsdata.Course, error)
}

type ContentItemService interface {
	GetContentItemsByCourse(ctx context.Context, courseID int64) ([]lmsdata.ContentItem, error)
	CreateManyContentItems(ctx context.Context, contentItems []lmsdata.ContentItem) (map[string]int64, error)
}

type ExternalContentRetriever interface {
	GetContent(ctx context.Context, res lms.GetContentRequest) (lms.CourseSyncDataDTO, error)
	ResolveFileReferences(ctx context.Context, req lms.ResolveFileReferencesRequest) ([]lms.ResolvedFileReferenceDTO, error)
}

type CourseFileSyncService interface {
	SyncFilesForCourse(ctx context.Context, courseID int64, files []lmsdata.FileSyncInput) error
	GetFilesByCourse(ctx context.Context, courseID int64) ([]lmsdata.File, error)
}

type FileReferenceStore interface {
	ReplaceFileReferences(ctx context.Context, contentItemIDs []int64, fileReferences []lmsdata.FileReference) error
}

type ContentHasher interface {
	HashContent(content string) (string, error)
}

type HashedContentItem struct {
	ExternalID   string
	ExternalData map[string]any
	ContentHash  string
	Type         string
}

type ScanCourseUseCase struct {
	htmlIssueRepository      domain.HTMLIssueRepository
	fileIssueRepository      domain.FileIssueRepository
	fileReferenceStore       FileReferenceStore
	courseRetriever          CourseRetriever
	contentItemService       ContentItemService
	externalContentRetriever ExternalContentRetriever
	contentHasher            ContentHasher
	courseFileSyncService    CourseFileSyncService
	scanner                  domain.Scanner
}

func NewScanCourseUseCase(
	htmlIssueRepository domain.HTMLIssueRepository,
	fileIssueRepository domain.FileIssueRepository,
	fileReferenceStore FileReferenceStore,
	courseRetriever CourseRetriever,
	contentItemService ContentItemService,
	externalContentRetriever ExternalContentRetriever,
	contentHasher ContentHasher,
	courseFileSyncService CourseFileSyncService,
	scanner domain.Scanner,
) *ScanCourseUseCase {
	return &ScanCourseUseCase{
		htmlIssueRepository:      htmlIssueRepository,
		fileIssueRepository:      fileIssueRepository,
		fileReferenceStore:       fileReferenceStore,
		courseRetriever:          courseRetriever,
		contentItemService:       contentItemService,
		externalContentRetriever: externalContentRetriever,
		contentHasher:            contentHasher,
		courseFileSyncService:    courseFileSyncService,
		scanner:                  scanner,
	}
}

type FullContentItem struct {
	ExternalID   string
	ExternalData map[string]any
	HTML         string
	ContentHash  string
	Type         string
}

func (u *ScanCourseUseCase) Execute(ctx context.Context, principal auth.Principal, courseID int64) error {
	currentContentItems, err := u.contentItemService.GetContentItemsByCourse(ctx, courseID)
	if err != nil {
		return err
	}

	course, err := u.courseRetriever.GetCourse(ctx, courseID)
	if err != nil {
		return err
	}

	externalCourseData, err := u.externalContentRetriever.GetContent(ctx, lms.GetContentRequest{
		CourseID:           courseID,
		TenantID:           principal.TenantID,
		UserID:             principal.AgentID,
		ExternalCourseID:   course.ExternalID,
		ExternalCourseData: course.ExternalData,
	})
	if err != nil {
		return err
	}

	persistedFiles, err := u.scanAndSyncFiles(ctx, courseID, externalCourseData.Files)
	if err != nil {
		return err
	}

	err = u.scanAndSyncHTMLContent(ctx, principal, course, externalCourseData.ContentItems, currentContentItems, persistedFiles, courseID)
	if err != nil {
		return err
	}

	return nil
}

func (u *ScanCourseUseCase) scanAndSyncHTMLContent(
	ctx context.Context,
	principal auth.Principal,
	course lmsdata.Course,
	externalContentItems []lms.ContentItemDTO,
	currentContentItems []lmsdata.ContentItem,
	persistedFiles []lmsdata.File,
	courseID int64,
) error {
	changedContentItems, err := u.getChangedContentItems(currentContentItems, externalContentItems, courseID)
	if err != nil {
		return err
	}

	changedContentItemsHashed := make([]lmsdata.ContentItem, len(changedContentItems))
	for i, item := range changedContentItems {
		changedContentItemsHashed[i] = lmsdata.ContentItem{
			ID:           item.ID,
			ExternalID:   item.ExternalID,
			ExternalData: item.ExternalData,
			ContentHash:  item.ContentHash,
			CourseID:     item.CourseID,
		}
	}
	idMap, err := u.contentItemService.CreateManyContentItems(ctx, changedContentItemsHashed)
	if err != nil {
		return err
	}

	// Update the IDs of the changed content items with the upserted IDs returned
	// from the database
	for _, item := range changedContentItems {
		if id, exists := idMap[item.ExternalID]; exists {
			item.ID = id
		}
	}

	scanItems := make([]domain.ScanItem, len(changedContentItems))
	for i, item := range changedContentItems {
		scanItems[i] = domain.ScanItem{
			ContentItemID: item.ID,
			HTML:          item.HTML,
		}
	}

	scanResult, err := u.scanner.ScanContent(ctx, scanItems)
	if err != nil {
		return err
	}

	changedContentItemIDs := make([]int64, len(changedContentItems))
	for i, item := range changedContentItems {
		changedContentItemIDs[i] = item.ID
	}
	err = u.htmlIssueRepository.DeleteByContentItemIDs(ctx, changedContentItemIDs)
	if err != nil {
		return err
	}

	fileReferences, err := u.extractFileReferences(ctx, principal, course, changedContentItems, persistedFiles, scanResult.References)
	if err != nil {
		return err
	}

	err = u.fileReferenceStore.ReplaceFileReferences(ctx, changedContentItemIDs, fileReferences)
	if err != nil {
		return err
	}

	var newIssues []*domain.HTMLIssue
	for _, result := range scanResult.Issues {
		newIssues = append(newIssues, domain.NewHTMLIssue(result.ContentItemID, result.ScanRule, result.ContentXPath, domain.IssueStatusActive, result.Severity, result.Details))
	}

	err = u.htmlIssueRepository.CreateMany(ctx, newIssues)
	if err != nil {
		return err
	}

	return nil
}

func (u *ScanCourseUseCase) scanAndSyncFiles(ctx context.Context, courseID int64, externalFiles []lms.FileItemDTO) ([]lmsdata.File, error) {
	files := make([]lmsdata.FileSyncInput, len(externalFiles))
	for i, file := range externalFiles {
		files[i] = lmsdata.FileSyncInput{
			FileName:     file.FileName,
			FileType:     file.FileType,
			UpdatedAt:    file.UpdatedAt,
			FileSize:     file.FileSize,
			DownloadURL:  file.DownloadURL,
			ExternalID:   file.ExternalID,
			ExternalData: file.ExternalData,
		}
	}

	err := u.courseFileSyncService.SyncFilesForCourse(ctx, courseID, files)
	if err != nil {
		return nil, err
	}

	persistedFiles, err := u.courseFileSyncService.GetFilesByCourse(ctx, courseID)
	if err != nil {
		return nil, err
	}

	fileIDs := make([]int64, len(persistedFiles))
	for i, file := range persistedFiles {
		fileIDs[i] = file.ID
	}

	err = u.fileIssueRepository.ReplaceForCourse(ctx, courseID, fileIDs)
	if err != nil {
		return nil, err
	}

	return persistedFiles, nil
}

func (u *ScanCourseUseCase) extractFileReferences(
	ctx context.Context,
	principal auth.Principal,
	course lmsdata.Course,
	changedContentItems []*ChangedContentItem,
	persistedFiles []lmsdata.File,
	references []domain.ExtractedReference,
) ([]lmsdata.FileReference, error) {
	if len(changedContentItems) == 0 || len(references) == 0 || len(persistedFiles) == 0 {
		return []lmsdata.FileReference{}, nil
	}

	contentExternalIDByInternalID := make(map[int64]string, len(changedContentItems))
	for _, item := range changedContentItems {
		contentExternalIDByInternalID[item.ID] = item.ExternalID
	}

	refDTOs := make([]lms.ContentReferenceDTO, 0, len(references))
	for _, reference := range references {
		contentExternalID, ok := contentExternalIDByInternalID[reference.ContentItemID]
		if !ok || contentExternalID == "" {
			continue
		}

		refDTOs = append(refDTOs, lms.ContentReferenceDTO{
			ContentExternalID: contentExternalID,
			Kind:              reference.Kind,
			TagName:           reference.TagName,
			Attribute:         reference.Attribute,
			Value:             reference.Value,
			XPath:             reference.XPath,
		})
	}

	if len(refDTOs) == 0 {
		return []lmsdata.FileReference{}, nil
	}

	externalFiles := make([]lms.FileItemDTO, len(persistedFiles))
	for i, file := range persistedFiles {
		externalFiles[i] = lms.FileItemDTO{
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

	resolvedRefs, err := u.externalContentRetriever.ResolveFileReferences(ctx, lms.ResolveFileReferencesRequest{
		CourseID:           course.ID,
		ExternalCourseID:   course.ExternalID,
		ExternalCourseData: course.ExternalData,
		TenantID:           principal.TenantID,
		References:         refDTOs,
		Files:              externalFiles,
	})
	if err != nil {
		return nil, err
	}

	if len(resolvedRefs) == 0 {
		return []lmsdata.FileReference{}, nil
	}

	contentIDByExternalID := make(map[string]int64, len(changedContentItems))
	for _, item := range changedContentItems {
		contentIDByExternalID[item.ExternalID] = item.ID
	}

	fileIDByExternalID := make(map[string]int64, len(persistedFiles))
	for _, file := range persistedFiles {
		fileIDByExternalID[file.ExternalID] = file.ID
	}

	fileReferences := make([]lmsdata.FileReference, 0, len(resolvedRefs))
	seen := make(map[string]struct{}, len(resolvedRefs))
	for _, resolved := range resolvedRefs {
		contentItemID, contentExists := contentIDByExternalID[resolved.ContentExternalID]
		fileID, fileExists := fileIDByExternalID[resolved.FileExternalID]
		if !contentExists || !fileExists {
			continue
		}

		key := fmt.Sprintf("%d:%d", contentItemID, fileID)
		if _, exists := seen[key]; exists {
			continue
		}
		seen[key] = struct{}{}

		fileReferences = append(fileReferences, lmsdata.FileReference{
			ContentItemID: contentItemID,
			FileID:        fileID,
		})
	}

	return fileReferences, nil
}

type ChangedContentItem struct {
	ID           int64
	CourseID     int64
	ExternalID   string
	ExternalData map[string]any
	ContentHash  string
	Type         string
	HTML         string
}

// getChangedContentItems compares the current content items with the external
// content items and returns a list of content items that have a different hash
// (i.e., have changed)
func (u *ScanCourseUseCase) getChangedContentItems(
	currentContentItems []lmsdata.ContentItem,
	externalContentItems []lms.ContentItemDTO,
	courseID int64,
) ([]*ChangedContentItem, error) {
	currentContentItemMap := make(map[string]lmsdata.ContentItem)
	for _, item := range currentContentItems {
		currentContentItemMap[item.ExternalID] = item
	}

	changedContentItems := []*ChangedContentItem{}
	for _, item := range externalContentItems {
		contentHash, err := u.contentHasher.HashContent(item.HTML)
		if err != nil {
			return nil, err
		}
		if currentItem, exists := currentContentItemMap[item.ExternalID]; !exists || currentItem.ContentHash != contentHash {
			var id int64
			if exists {
				id = currentItem.ID
			}
			changedContentItems = append(changedContentItems, &ChangedContentItem{
				ID:           id,
				CourseID:     courseID,
				ExternalID:   item.ExternalID,
				ExternalData: item.ExternalData,
				ContentHash:  contentHash,
				HTML:         item.HTML,
			})
		}
	}

	return changedContentItems, nil
}
