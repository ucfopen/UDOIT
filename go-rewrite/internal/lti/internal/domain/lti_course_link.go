package domain

type LTICourseLink struct {
	tenantID  int64
	contextID string
	courseID  int64
}

func NewLTICourseLink(tenantID int64, contextID string, courseID int64) LTICourseLink {
	return LTICourseLink{
		tenantID:  tenantID,
		contextID: contextID,
		courseID:  courseID,
	}
}

func (l LTICourseLink) TenantID() int64 {
	return l.tenantID
}

func (l LTICourseLink) ContextID() string {
	return l.contextID
}

func (l LTICourseLink) CourseID() int64 {
	return l.courseID
}
