package domain

import "context"

type ReportRepository interface {
	Create(ctx context.Context, report *Report) error
}
