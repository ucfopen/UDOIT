export const ISSUE_STATE = {
  UNCHANGED: 0,
  SAVING: 1,
  RESOLVING: 2,
  SAVED: 3,
  RESOLVED: 4,
  ERROR: 5,
}

export const WIDGET_STATE = {
  LOADING: 0,
  FIXIT: 1,
  LEARN: 2,
  LIST: 3,
  NO_RESULTS: 4,
}

// Define the kinds of issue filters that will be available to the user
export const ISSUE_FILTER = {
  TYPE: {
    SEVERITY: 'SEVERITY',
    CONTENT_TYPE: 'CONTENT_TYPE',
    RESOLUTION: 'RESOLUTION',
    MODULE: 'MODULE',
    PUBLISHED: 'PUBLISHED',
  },
  ALL: 'ALL',
  ISSUE: 'ISSUE',
  POTENTIAL: 'POTENTIAL',
  SUGGESTION: 'SUGGESTION',
  PAGE: 'PAGE',
  ASSIGNMENT: 'ASSIGNMENT',
  ANNOUNCEMENT: 'ANNOUNCEMENT',
  DISCUSSION_TOPIC: 'DISCUSSION_TOPIC',
  DISCUSSION_FORUM: 'DISCUSSION_FORUM',
  FILE: 'FILE',
  QUIZ: 'QUIZ',
  SYLLABUS: 'SYLLABUS',
  MODULE: 'MODULE',
  FILE_OBJECT: 'FILE_OBJECT',
  ACTIVE: 'ACTIVE',
  FIXED: 'FIXED',
  RESOLVED: 'RESOLVED',
  FIXEDANDRESOLVED: 'FIXEDANDRESOLVED', // Doesn't appear in any dropdowns, but is used in the code
  PUBLISHED: 'PUBLISHED',
  UNPUBLISHED: 'UNPUBLISHED',
}

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