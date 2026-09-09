package domain

import "time"

type Report struct {
	id              int64
	courseID        int64
	errorCount      int
	suggestionCount int
	fileCount       int
	scannedBy       int64
	contentFixed    int
	contentResolved int
	createdAt       time.Time
	updatedAt       time.Time
}

func NewReport(
	courseID int64,
	errorCount int,
	suggestionCount int,
	fileCount int,
	scannedBy int64,
	contentFixed int,
	contentResolved int,
) *Report {
	return &Report{
		courseID:        courseID,
		errorCount:      errorCount,
		suggestionCount: suggestionCount,
		fileCount:       fileCount,
		createdAt:       time.Now(),
		updatedAt:       time.Now(),
		scannedBy:       scannedBy,
		contentFixed:    contentFixed,
		contentResolved: contentResolved,
	}
}

func RehydrateReport(
	id int64,
	courseID int64,
	errorCount int,
	suggestionCount int,
	fileCount int,
	scannedBy int64,
	contentFixed int,
	contentResolved int,
) *Report {
	return &Report{
		id:              id,
		courseID:        courseID,
		errorCount:      errorCount,
		suggestionCount: suggestionCount,
		fileCount:       fileCount,
		scannedBy:       scannedBy,
		contentFixed:    contentFixed,
		contentResolved: contentResolved,
	}
}

func (r *Report) ID() int64 {
	return r.id
}

func (r *Report) CourseID() int64 {
	return r.courseID
}

func (r *Report) ErrorCount() int {
	return r.errorCount
}

func (r *Report) SuggestionCount() int {
	return r.suggestionCount
}

func (r *Report) FileCount() int {
	return r.fileCount
}

func (r *Report) ScannedBy() int64 {
	return r.scannedBy
}

func (r *Report) ContentFixed() int {
	return r.contentFixed
}

func (r *Report) ContentResolved() int {
	return r.contentResolved
}

func (r *Report) SetID(id int64) {
	r.id = id
}

func (r *Report) CreatedAt() time.Time {
	return r.createdAt
}

func (r *Report) UpdatedAt() time.Time {
	return r.updatedAt
}
