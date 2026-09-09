package domain

type Tenant struct {
	id     int64
	lmsKey string
}

func NewTenant(id int64, lmsKey string) *Tenant {
	return &Tenant{
		id:     id,
		lmsKey: lmsKey,
	}
}

func (t *Tenant) ID() int64 {
	return t.id
}

func (t *Tenant) LMSKey() string {
	return t.lmsKey
}
