package application

import (
	"context"

	"rewritetest/internal/accessibility/internal/domain"
	"rewritetest/internal/lmsdata"
	"rewritetest/internal/shared/auth"
)

type LMSDataService interface {
	GetCourseScanData(ctx context.Context, principal auth.Principal, courseID int64) (lmsdata.CourseScanData, error)
	AddFileReferences(ctx context.Context, principal auth.Principal, request lmsdata.AddFileReferencesRequest) error
}

type ScanCourseUseCase struct {
	htmlIssueRepository domain.HTMLIssueRepository
	fileIssueRepository domain.FileIssueRepository
	lmsDataService      LMSDataService
	scanner             domain.Scanner
}

func NewScanCourseUseCase(
	htmlIssueRepository domain.HTMLIssueRepository,
	fileIssueRepository domain.FileIssueRepository,
	lmsDataService LMSDataService,
	scanner domain.Scanner,
) *ScanCourseUseCase {
	return &ScanCourseUseCase{
		htmlIssueRepository: htmlIssueRepository,
		fileIssueRepository: fileIssueRepository,
		lmsDataService:      lmsDataService,
		scanner:             scanner,
	}
}

func (u *ScanCourseUseCase) Execute(ctx context.Context, principal auth.Principal, courseID int64) error {
	scanData, err := u.lmsDataService.GetCourseScanData(ctx, principal, courseID)
	if err != nil {
		return err
	}

	fileIDs := make([]int64, len(scanData.Files))
	for i, file := range scanData.Files {
		fileIDs[i] = file.ID
	}
	if err := u.fileIssueRepository.ReplaceForCourse(ctx, courseID, fileIDs); err != nil {
		return err
	}

	scanItems := make([]domain.ScanItem, len(scanData.ChangedContents))
	contentItemIDs := make([]int64, len(scanData.ChangedContents))
	for i, content := range scanData.ChangedContents {
		scanItems[i] = domain.ScanItem{
			ContentItemID: content.ID,
			HTML:          content.HTML,
		}
		contentItemIDs[i] = content.ID
	}

	scanResult, err := u.scanner.ScanContent(ctx, scanItems)
	if err != nil {
		return err
	}

	if err := u.htmlIssueRepository.DeleteByContentItemIDs(ctx, contentItemIDs); err != nil {
		return err
	}

	references := make([]lmsdata.FileReferenceInput, len(scanResult.References))
	for i, reference := range scanResult.References {
		references[i] = lmsdata.FileReferenceInput{
			ContentItemID: reference.ContentItemID,
			Kind:          reference.Kind,
			TagName:       reference.TagName,
			Attribute:     reference.Attribute,
			Value:         reference.Value,
			XPath:         reference.XPath,
		}
	}
	if err := u.lmsDataService.AddFileReferences(ctx, principal, lmsdata.AddFileReferencesRequest{
		CourseID:       courseID,
		ContentItemIDs: contentItemIDs,
		References:     references,
	}); err != nil {
		return err
	}

	newIssues := make([]*domain.HTMLIssue, 0, len(scanResult.Issues))
	for _, result := range scanResult.Issues {
		newIssues = append(newIssues, domain.NewHTMLIssue(
			result.ContentItemID,
			result.ScanRule,
			result.ContentXPath,
			domain.IssueStatusActive,
			result.Severity,
			result.Details,
		))
	}

	return u.htmlIssueRepository.CreateMany(ctx, newIssues)
}
