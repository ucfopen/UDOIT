package application

import (
	"context"

	"rewritetest/internal/accessibility/internal/domain"
)

type CreateReportUseCase struct {
	reportRepository domain.ReportRepository
	issueRepository  domain.HTMLIssueRepository
}

func NewCreateReportUseCase(reportRepository domain.ReportRepository, issueRepository domain.HTMLIssueRepository) *CreateReportUseCase {
	return &CreateReportUseCase{
		reportRepository: reportRepository,
		issueRepository:  issueRepository,
	}
}

type CreateReportCommand struct {
	UserID   int64
	CourseID int64
}

func (u *CreateReportUseCase) Execute(ctx context.Context, cmd CreateReportCommand) error {
	// TODO: add user-based authoriza\ion

	issues, err := u.issueRepository.GetByCourseID(ctx, cmd.CourseID)
	if err != nil {
		return err
	}

	var errorCount, suggestionCount, fixedCount, resolvedCount, fileCount int

	for _, issue := range issues {
		switch issue.Status() {
		case domain.IssueStatusFixed:
			fixedCount++
		case domain.IssueStatusMarkedAsReviewed:
			resolvedCount++
		case domain.IssueStatusActive:
			if issue.Severity() == domain.IssueSeverityError {
				errorCount++
			} else {
				suggestionCount++
			}
		}
	}

	report := domain.NewReport(
		cmd.CourseID,
		errorCount,
		suggestionCount,
		fileCount,
		cmd.UserID,
		fixedCount,
		resolvedCount,
	)

	err = u.reportRepository.Create(ctx, report)
	if err != nil {
		return err
	}

	return nil
}
