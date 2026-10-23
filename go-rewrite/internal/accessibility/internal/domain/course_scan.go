package domain

import "time"

type CourseScan struct {
	id          int64
	CourseID    int64
	ScannedBy   int64
	StartedAt   time.Time
	CompletedAt *time.Time
}

func NewCourseScan(courseID, scannedBy int64, startedAt time.Time) *CourseScan {
	return &CourseScan{
		CourseID:  courseID,
		ScannedBy: scannedBy,
		StartedAt: startedAt,
	}
}

func (s *CourseScan) ID() int64 { return s.id }

func (s *CourseScan) SetID(id int64) { s.id = id }

func (s *CourseScan) Complete(completedAt time.Time) {
	s.CompletedAt = &completedAt
}

func (s *CourseScan) LastCompletedAt() time.Time {
	if s.CompletedAt == nil {
		return time.Time{}
	}
	return *s.CompletedAt
}
