package domain

import "context"

type CourseRepository interface {
	Create(ctx context.Context, course *Course) (*Course, error)
	GetByID(ctx context.Context, courseID int64) (*Course, error)
}
