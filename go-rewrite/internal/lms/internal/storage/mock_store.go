package storage

import (
	"context"

	"rewritetest/internal/lms/internal/record"
)

type MockStore struct {
	CreateCourseFunc              func(ctx context.Context, course record.Course) (record.Course, error)
	CourseByIDFunc                func(ctx context.Context, id int64) (record.Course, bool, error)
	ContentByIDFunc               func(ctx context.Context, id int64) (record.Content, bool, error)
	ContentByCourseFunc           func(ctx context.Context, courseID int64) ([]record.Content, error)
	UpsertContentFunc             func(ctx context.Context, content []record.Content) ([]record.Content, error)
	FileByIDFunc                  func(ctx context.Context, fileID int64) (record.File, bool, error)
	CreateFileFunc                func(ctx context.Context, file record.File) (record.File, error)
	FilesByCourseFunc             func(ctx context.Context, courseID int64) ([]record.File, error)
	UpdateFileFunc                func(ctx context.Context, file record.File) error
	SyncFilesFunc                 func(ctx context.Context, courseID int64, files []record.FileSync) error
	ReplaceFileReferencesFunc     func(ctx context.Context, contentItemIDs []int64, references []record.FileReference) error
	ActiveCredentialFunc          func(ctx context.Context, userID int64) (record.LMSCredential, bool, error)
	SaveCredentialFunc            func(ctx context.Context, credential record.LMSCredential) error
	ProviderConfigurationFunc     func(ctx context.Context, tenantID int64) (record.ProviderConfiguration, bool, error)
	SaveProviderConfigurationFunc func(ctx context.Context, configuration record.ProviderConfiguration) error
}

func (m *MockStore) CreateCourse(ctx context.Context, course record.Course) (record.Course, error) {
	if m.CreateCourseFunc != nil {
		return m.CreateCourseFunc(ctx, course)
	}
	panic("CreateCourseFunc not implemented")
}
func (m *MockStore) CourseByID(ctx context.Context, id int64) (record.Course, bool, error) {
	if m.CourseByIDFunc != nil {
		return m.CourseByIDFunc(ctx, id)
	}
	panic("CourseByIDFunc not implemented")
}
func (m *MockStore) ProviderConfiguration(ctx context.Context, tenantID int64) (record.ProviderConfiguration, bool, error) {
	if m.ProviderConfigurationFunc != nil {
		return m.ProviderConfigurationFunc(ctx, tenantID)
	}
	panic("ProviderConfigurationFunc not implemented")
}
func (m *MockStore) ContentByID(ctx context.Context, id int64) (record.Content, bool, error) {
	if m.ContentByIDFunc != nil {
		return m.ContentByIDFunc(ctx, id)
	}
	panic("ContentByIDFunc not implemented")
}
func (m *MockStore) ContentByCourse(ctx context.Context, courseID int64) ([]record.Content, error) {
	if m.ContentByCourseFunc != nil {
		return m.ContentByCourseFunc(ctx, courseID)
	}
	panic("ContentByCourseFunc not implemented")
}
func (m *MockStore) UpsertContent(ctx context.Context, content []record.Content) ([]record.Content, error) {
	if m.UpsertContentFunc != nil {
		return m.UpsertContentFunc(ctx, content)
	}
	panic("UpsertContentFunc not implemented")
}
func (m *MockStore) FileByID(ctx context.Context, fileID int64) (record.File, bool, error) {
	if m.FileByIDFunc != nil {
		return m.FileByIDFunc(ctx, fileID)
	}
	panic("FileByIDFunc not implemented")
}
func (m *MockStore) CreateFile(ctx context.Context, file record.File) (record.File, error) {
	if m.CreateFileFunc != nil {
		return m.CreateFileFunc(ctx, file)
	}
	panic("CreateFileFunc not implemented")
}
func (m *MockStore) FilesByCourse(ctx context.Context, courseID int64) ([]record.File, error) {
	if m.FilesByCourseFunc != nil {
		return m.FilesByCourseFunc(ctx, courseID)
	}
	panic("FilesByCourseFunc not implemented")
}
func (m *MockStore) UpdateFile(ctx context.Context, file record.File) error {
	if m.UpdateFileFunc != nil {
		return m.UpdateFileFunc(ctx, file)
	}
	panic("UpdateFileFunc not implemented")
}
func (m *MockStore) SyncFiles(ctx context.Context, courseID int64, files []record.FileSync) error {
	if m.SyncFilesFunc != nil {
		return m.SyncFilesFunc(ctx, courseID, files)
	}
	panic("SyncFilesFunc not implemented")
}
func (m *MockStore) ReplaceFileReferences(ctx context.Context, contentItemIDs []int64, references []record.FileReference) error {
	if m.ReplaceFileReferencesFunc != nil {
		return m.ReplaceFileReferencesFunc(ctx, contentItemIDs, references)
	}
	panic("ReplaceFileReferencesFunc not implemented")
}
func (m *MockStore) ActiveCredential(ctx context.Context, userID int64) (record.LMSCredential, bool, error) {
	if m.ActiveCredentialFunc != nil {
		return m.ActiveCredentialFunc(ctx, userID)
	}
	panic("ActiveCredentialFunc not implemented")
}
func (m *MockStore) SaveCredential(ctx context.Context, credential record.LMSCredential) error {
	if m.SaveCredentialFunc != nil {
		return m.SaveCredentialFunc(ctx, credential)
	}
	panic("SaveCredentialFunc not implemented")
}
func (m *MockStore) SaveProviderConfiguration(ctx context.Context, configuration record.ProviderConfiguration) error {
	if m.SaveProviderConfigurationFunc != nil {
		return m.SaveProviderConfigurationFunc(ctx, configuration)
	}
	panic("SaveProviderConfigurationFunc not implemented")
}

func NewMapMockStore() *MockStore {
	files := make(map[int64]record.File)
	contentByID := make(map[int64]record.Content)
	courses := make(map[int64]record.Course)
	providerConfigurations := make(map[int64]record.ProviderConfiguration)
	var nextID int64
	var nextContentID int64
	var nextCourseID int64
	return &MockStore{
		ContentByIDFunc: func(_ context.Context, id int64) (record.Content, bool, error) {
			content, ok := contentByID[id]
			return content, ok, nil
		},
		UpsertContentFunc: func(_ context.Context, contents []record.Content) ([]record.Content, error) {
			persisted := make([]record.Content, len(contents))
			for i, content := range contents {
				if content.ID == 0 {
					nextContentID++
					content.ID = nextContentID
				}
				contentByID[content.ID] = content
				persisted[i] = content
			}
			return persisted, nil
		},
		SyncFilesFunc: func(_ context.Context, courseID int64, inputs []record.FileSync) error {
			for _, input := range inputs {
				key := int64(0)
				for id, existing := range files {
					if existing.CourseID == courseID && existing.ExternalID == input.ExternalID {
						key = id
						break
					}
				}
				if key == 0 {
					nextID++
					key = nextID
				}
				existing := files[key]
				files[key] = record.File{
					ID: key, CourseID: courseID, IsReplacement: existing.IsReplacement || input.IsReplacement,
					FileName: input.FileName, FileType: input.FileType, UpdatedAt: input.UpdatedAt,
					FileSize: input.FileSize, DownloadURL: input.DownloadURL,
					ExternalID: input.ExternalID, ExternalData: input.ExternalData,
				}
			}
			return nil
		},
		FilesByCourseFunc: func(_ context.Context, courseID int64) ([]record.File, error) {
			result := make([]record.File, 0)
			for _, file := range files {
				if file.CourseID == courseID {
					result = append(result, file)
				}
			}
			return result, nil
		},
		CourseByIDFunc: func(_ context.Context, id int64) (record.Course, bool, error) {
			course, ok := courses[id]
			return course, ok, nil
		},
		ProviderConfigurationFunc: func(_ context.Context, tenantID int64) (record.ProviderConfiguration, bool, error) {
			configuration, ok := providerConfigurations[tenantID]
			return configuration, ok, nil
		},
		SaveProviderConfigurationFunc: func(_ context.Context, configuration record.ProviderConfiguration) error {
			providerConfigurations[configuration.TenantID] = configuration
			return nil
		},
		CreateCourseFunc: func(_ context.Context, course record.Course) (record.Course, error) {
			if course.ID == 0 {
				nextCourseID++
				course.ID = nextCourseID
			}
			courses[course.ID] = course
			return course, nil
		},
	}
}
