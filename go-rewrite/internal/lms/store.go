package lms

import (
	"context"

	"rewritetest/internal/lms/internal/record"
)

type Store interface {
	CreateCourse(context.Context, record.Course) (record.Course, error)
	CourseByID(context.Context, int64) (record.Course, bool, error)
	ContentByCourse(context.Context, int64) ([]record.Content, error)
	UpsertContent(context.Context, []record.Content) ([]record.Content, error)
	FileByID(context.Context, int64) (record.File, bool, error)
	CreateFile(context.Context, record.File) (record.File, error)
	FilesByCourse(context.Context, int64) ([]record.File, error)
	UpdateFile(context.Context, record.File) error
	SyncFiles(context.Context, int64, []record.FileSync) error
	ReplaceFileReferences(context.Context, []int64, []record.FileReference) error
	ActiveCredential(context.Context, int64) (record.LMSCredential, bool, error)
	SaveCredential(context.Context, record.LMSCredential) error
	ProviderConfiguration(context.Context, int64) (record.ProviderConfiguration, bool, error)
	SaveProviderConfiguration(context.Context, record.ProviderConfiguration) error
}
