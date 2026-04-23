export const DEFAULT_USER_SETTINGS = {
  ALERT_TIMEOUT: '5000',
  FONT_SIZE: 'font-medium',
  FONT_FAMILY: 'sans-serif',
  TEXT_SPACING: '0',
  DARK_MODE: false,
  SHOW_FILTERS: true,
  LANGUAGE: 'en',
}

export function findEditURLWithIssue(issue, instanceInfo) {
  if (!issue || !instanceInfo || !instanceInfo.institution) {
    return ''
  }

  let lms = instanceInfo.institution.lmsId
  if (lms === 'canvas') {
    return `${issue.contentUrl}/edit`
  } else {
    return issue.contentUrl
  }
}