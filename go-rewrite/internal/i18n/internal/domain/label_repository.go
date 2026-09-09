package domain

import "context"

type LabelRepository interface {
	GetLabels(ctx context.Context, languageCode string) (Labels, error)
}
