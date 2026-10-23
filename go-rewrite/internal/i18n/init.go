package i18n

import (
	"rewritetest/internal/i18n/internal/application"
	"rewritetest/internal/i18n/internal/infrastructure"
)

type Module struct {
	getLabelsUseCase *application.GetLabelsUseCase
}

func New() *Module {
	labelRepository := infrastructure.NewFileLabelRepository("./translations")
	getLabelsUseCase := application.NewGetLabelsUseCase(labelRepository)

	return &Module{
		getLabelsUseCase: getLabelsUseCase,
	}
}

