export const FILE_FILTER = {
  TYPE: {
    UTILIZATION: 'UTILIZATION',
    PUBLISHED: 'PUBLISHED',
    FILE_TYPE: 'FILE_TYPE',
    RESOLUTION: 'RESOLUTION',
    MODULE: 'MODULE',
  },
  ALL: 'ALL',
  USED: 'USED',
  UNUSED: 'UNUSED',
  PUBLISHED: 'PUBLISHED',
  UNPUBLISHED: 'UNPUBLISHED',
  FILE_PDF: 'PDF',
  FILE_WORD: 'WORD',
  FILE_POWERPOINT: 'POWERPOINT',
  FILE_EXCEL: 'EXCEL',
  FILE_VIDEO: 'VIDEO',
  FILE_AUDIO: 'AUDIO',
  FILE_UNKNOWN: 'UNKNOWN',
  ACTIVE: 'ACTIVE',
  UNREVIEWED: 'UNREVIEWED',
  REVIEWED: 'REVIEWED',
  REPLACED: 'REPLACED',
  FILE_OBJECT: 'FILE_OBJECT',
}

export const FILE_TYPES = [
  'pdf',
  'doc',
  'ppt',
  'xls',
  'audio',
  'video',
]

export const FILE_TYPE_MAP = {
  'pdf': FILE_FILTER.FILE_PDF,
  'doc': FILE_FILTER.FILE_WORD,
  'ppt': FILE_FILTER.FILE_POWERPOINT,
  'xls': FILE_FILTER.FILE_EXCEL,
  'audio': FILE_FILTER.FILE_AUDIO,
  'video': FILE_FILTER.FILE_VIDEO,
}

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