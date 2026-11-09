package application

import (
	"context"

	"rewritetest/internal/i18n/internal/domain"
)

type GetLabelsUseCase struct {
	labelRepository domain.LabelRepository
}

type GetLabelsQuery struct {
	LanguageCode string
}

func NewGetLabelsUseCase(labelRepository domain.LabelRepository) *GetLabelsUseCase {
	return &GetLabelsUseCase{labelRepository: labelRepository}
}

func (u *GetLabelsUseCase) Execute(ctx context.Context, query GetLabelsQuery) (domain.Labels, error) {
	return u.labelRepository.GetLabels(ctx, query.LanguageCode)
}
