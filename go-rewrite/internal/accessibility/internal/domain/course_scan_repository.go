package domain

import (
	"context"
	"time"
)

type CourseScanRepository interface {
	LastCompletedAt(ctx context.Context, courseID int64) (time.Time, error)
	Start(ctx context.Context, scan *CourseScan) error
	Complete(ctx context.Context, scan *CourseScan) error
}
