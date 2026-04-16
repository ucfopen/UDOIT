export const UFIXIT_OPTIONS = {
  ADD_EMPHASIS: 'add-emphasis',
  ADD_TEXT: 'add-text',
  DELETE_ATTRIBUTE: 'delete-attribute',
  DELETE_ELEMENT: 'delete-element',
  MARK_AS_REVIEWED: 'mark-as-reviewed',
  MARK_DECORATIVE: 'mark-decorative',
  SELECT_ATTRIBUTE_VALUE: 'select-attribute-value',
  SELECT_TAG: 'select-tag'
}

export const DEFAULT_USER_SETTINGS = {
  ALERT_TIMEOUT: '5000',
  FONT_SIZE: 'font-medium',
  FONT_FAMILY: 'sans-serif',
  TEXT_SPACING: '0',
  DARK_MODE: false,
  SHOW_FILTERS: true,
  LANGUAGE: 'en',
}

export function findEditURLWithIssue(issue, settings) {
  if (!issue || !settings || !settings.institution) {
    return ''
  }

  let lms = settings.institution.lmsId
  if (lms === 'canvas') {
    return `${issue.contentUrl}/edit`
  } else {
    return issue.contentUrl
  }
}