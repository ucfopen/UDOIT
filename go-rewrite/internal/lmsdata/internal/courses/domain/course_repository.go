package domain

import "context"

type CourseRepository interface {
	Create(ctx context.Context, course *Course) (int64, error)
	GetByID(ctx context.Context, courseID int64) (*Course, error)
}
