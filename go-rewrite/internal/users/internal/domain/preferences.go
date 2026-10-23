package domain

type Preferences struct {
	Theme        *Theme  `json:"theme,omitempty"`
	TextSpacing  *int    `json:"text_spacing,omitempty"`
	FontSize     *string `json:"font_size,omitempty"`
	FontFamily   *string `json:"font_family,omitempty"`
	AlertTimeout *int    `json:"alert_timeout,omitempty"`
	Language     *string `json:"language,omitempty"`
}

type PreferencesUpdate struct {
	Theme        *Theme
	TextSpacing  *int
	FontSize     *string
	FontFamily   *string
	AlertTimeout *int
	Language     *string
}

type ResolvedPreferences struct {
	theme        Theme
	textSpacing  int
	fontSize     string
	fontFamily   string
	alertTimeout int
	language     string
}

func (p Preferences) ApplyChanges(input PreferencesUpdate) Preferences {
	if input.Theme != nil {
		p.Theme = input.Theme
	}

	if input.TextSpacing != nil {
		p.TextSpacing = input.TextSpacing
	}

	if input.FontSize != nil {
		p.FontSize = input.FontSize
	}

	if input.FontFamily != nil {
		p.FontFamily = input.FontFamily
	}

	if input.AlertTimeout != nil {
		p.AlertTimeout = input.AlertTimeout
	}

	if input.Language != nil {
		p.Language = input.Language
	}

	return p
}

func (p Preferences) Resolve(defaults ResolvedPreferences) ResolvedPreferences {
	result := defaults

	if p.Theme != nil {
		result.theme = *p.Theme
	}

	if p.TextSpacing != nil {
		result.textSpacing = *p.TextSpacing
	}

	if p.FontSize != nil {
		result.fontSize = *p.FontSize
	}

	if p.FontFamily != nil {
		result.fontFamily = *p.FontFamily
	}

	if p.AlertTimeout != nil {
		result.alertTimeout = *p.AlertTimeout
	}

	if p.Language != nil {
		result.language = *p.Language
	}

	return result
}
