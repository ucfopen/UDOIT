package domain

type ScanRule string

// Eventually, implement actual enum of valid scan rules, for now
// the type serves as a placeholder

func (s ScanRule) String() string {
	return string(s)
}

func (s ScanRule) IsValid() bool {
	return true
}

func ParseScanRule(s string) (ScanRule, error) {
	return ScanRule(s), nil
}
