package i18n

import (
	"context"

	"rewritetest/internal/i18n/internal/application"
)

func (m *Module) GetLabels(ctx context.Context, lang string) (map[string]string, error) {
	labels, err := m.getLabelsUseCase.Execute(ctx, application.GetLabelsQuery{LanguageCode: lang})
	if err != nil {
		return nil, err
	}

	result := make(map[string]string, len(labels))
	for key, value := range labels {
		result[key] = value
	}

	return result, nil
}
