package application

import (
	"context"
	"errors"
	"testing"

	"rewritetest/internal/shared/apperr"
	sharedauth "rewritetest/internal/shared/auth"
	"rewritetest/internal/users/internal/domain"
	"rewritetest/internal/users/internal/infrastructure"

	"github.com/stretchr/testify/require"
)

type fakeI18NService struct {
	labels   map[string]string
	err      error
	callLang string
	called   bool
}

func (f *fakeI18NService) GetLabels(_ context.Context, lang string) (map[string]string, error) {
	f.called = true
	f.callLang = lang
	if f.err != nil {
		return nil, f.err
	}
	return f.labels, nil
}

func TestUpdatePreferencesUseCase_Unauthorized(t *testing.T) {
	repo := &infrastructure.MockUserRepository{
		UpdateFunc: func(ctx context.Context, user *domain.User) error {
			require.FailNow(t, "User repo update function should not be called")
			return nil
		},
	}
	i18n := &fakeI18NService{}
	uc := NewUpdatePreferencesUseCase(repo, i18n)

	_, err := uc.Execute(context.Background(), sharedauth.Principal{AgentID: 10}, UpdatePreferencesCommand{UserID: 11})

	require.Error(t, err)
	require.True(t, apperr.IsCode(err, apperr.CodeUnauthorized))
	require.Equal(t, 0, repo.UpdateCallCount)
	require.False(t, i18n.called)
}

func TestUpdatePreferencesUseCase_InvalidTheme(t *testing.T) {
	user := domain.RehydrateUser(10, "user", "User", domain.Preferences{})
	repo := &infrastructure.MockUserRepository{
		GetByIDFunc: func(_ context.Context, id int64) (*domain.User, error) {
			require.Equal(t, int64(10), id)
			return &user, nil
		},
	}
	i18n := &fakeI18NService{}
	uc := NewUpdatePreferencesUseCase(repo, i18n)

	invalid := "sepia"
	_, err := uc.Execute(context.Background(), sharedauth.Principal{AgentID: 10}, UpdatePreferencesCommand{UserID: 10, Theme: &invalid})

	require.Error(t, err)
	require.True(t, apperr.IsCode(err, apperr.CodeValidation))
	require.Equal(t, 0, repo.UpdateCallCount)
	require.False(t, i18n.called)
}

func TestUpdatePreferencesUseCase_NoChangesSkipsUpdate(t *testing.T) {
	theme := domain.ThemeLight
	lang := "en"
	spacing := 1
	user := domain.RehydrateUser(10, "user", "User", domain.Preferences{Theme: &theme, Language: &lang, TextSpacing: &spacing})
	repo := &infrastructure.MockUserRepository{
		GetByIDFunc: func(_ context.Context, _ int64) (*domain.User, error) { return &user, nil },
	}
	i18n := &fakeI18NService{}
	uc := NewUpdatePreferencesUseCase(repo, i18n)

	labels, err := uc.Execute(context.Background(), sharedauth.Principal{AgentID: 10}, UpdatePreferencesCommand{UserID: 10})

	require.NoError(t, err)
	require.Nil(t, labels)
	require.Equal(t, 0, repo.UpdateCallCount)
	require.False(t, i18n.called)
}

func TestUpdatePreferencesUseCase_LanguageChangeFetchesLabelsAndUpdates(t *testing.T) {
	oldLang := "en"
	theme := domain.ThemeLight
	user := domain.RehydrateUser(10, "user", "User", domain.Preferences{Theme: &theme, Language: &oldLang})
	repo := &infrastructure.MockUserRepository{
		GetByIDFunc: func(_ context.Context, _ int64) (*domain.User, error) { return &user, nil },
		UpdateFunc: func(_ context.Context, user *domain.User) error {
			return nil
		},
	}
	i18n := &fakeI18NService{labels: map[string]string{"hello": "hola"}}
	uc := NewUpdatePreferencesUseCase(repo, i18n)

	labels, err := uc.Execute(context.Background(), sharedauth.Principal{AgentID: 10}, UpdatePreferencesCommand{UserID: 10, Language: strPtr("es")})

	require.NoError(t, err)
	require.Equal(t, map[string]string{"hello": "hola"}, labels)
	require.True(t, i18n.called)
	require.Equal(t, "es", i18n.callLang)
	require.Equal(t, 1, repo.UpdateCallCount)
	require.NotNil(t, user.Preferences().Language)
	require.Equal(t, "es", *user.Preferences().Language)
}

func TestUpdatePreferencesUseCase_SaveFailureIsInternal(t *testing.T) {
	user := domain.RehydrateUser(10, "user", "User", domain.Preferences{})
	repo := &infrastructure.MockUserRepository{
		GetByIDFunc: func(_ context.Context, _ int64) (*domain.User, error) { return &user, nil },
		UpdateFunc:  func(_ context.Context, _ *domain.User) error { return errors.New("db down") },
	}
	i18n := &fakeI18NService{}
	uc := NewUpdatePreferencesUseCase(repo, i18n)

	_, err := uc.Execute(context.Background(), sharedauth.Principal{AgentID: 10}, UpdatePreferencesCommand{UserID: 10, Language: strPtr("fr")})

	require.Error(t, err)
	require.True(t, apperr.IsCode(err, apperr.CodeInternal))
	require.Equal(t, 1, repo.UpdateCallCount)
}

func strPtr(v string) *string { return &v }
func intPtr(v int) *int       { return &v }
