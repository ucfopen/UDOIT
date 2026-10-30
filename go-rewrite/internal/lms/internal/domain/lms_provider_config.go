package domain

type LMSProviderConfig struct {
	tenantID int64
	lmsKey   LMSType
	data     map[string]any
}

func NewLMSProviderConfig(tenantID int64, lmsKey LMSType, data map[string]any) *LMSProviderConfig {
	return &LMSProviderConfig{
		tenantID: tenantID,
		lmsKey:   lmsKey,
		data:     data,
	}
}

func (c *LMSProviderConfig) TenantID() int64 {
	return c.tenantID
}

func (c *LMSProviderConfig) LMSKey() LMSType {
	return c.lmsKey
}

func (c *LMSProviderConfig) Data() map[string]any {
	return c.data
}
