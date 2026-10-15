export const ISSUE_STATE = {
  UNCHANGED: 0,
  SAVING: 1,
  RESOLVING: 2,
  SAVED: 3,
  RESOLVED: 4,
  ERROR: 5,
};

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

export const MEDIA_FILE_TYPES = [
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
  REVIEW_CONTENT: 'review-content',
  SELECT_ATTRIBUTE_VALUE: 'select-attribute-value',
  SELECT_TAG: 'select-tag'
}

export const DEFAULT_USER_SETTINGS = {
  ALERT_TIMEOUT: '10000',
  DARK_MODE: 'false',
  FONT_FAMILY: 'sans-serif',
  FONT_SIZE: 'font-medium',
  LANGUAGE: 'en'
}

/* Derived from https://github.com/IBMa/equal-access/blob/1ea7a8a7d739bb0f57f1d025215c8a6adec0f258/accessibility-checker-engine/src/v2/aria/ARIADefinitions.ts#L1755
             and https://github.com/IBMa/equal-access/blob/1ea7a8a7d739bb0f57f1d025215c8a6adec0f258/accessibility-checker-engine/src/v2/aria/ARIADefinitions.ts#L2276 */
  
export const TAG_IMPLICIT_ROLE= {
  "a": "link",
  "address": "group",
  "area": "link",
  "article": "article",
  "aside": "complementary",
  "b": "generic",
  "bdi": "generic",
  "bdo": "generic",
  "blockquote": "blockquote",       
  "body": "generic",
  "button": "button",
  "caption": "caption",
  "code": "code",
  "data": "generic",
  "datalist": "listbox",
  "del": "deletion",
  "details": "group",
  "dfn": "term",
  "dialog": "dialog",
  "div": "generic",
  "dt": "term",
  "fieldset": "group",
  "figure": "figure",
  "footer": "contentinfo",
  "form": "form",
  "header": "banner",
  "hgroup": "group",
  "h1": "heading",
  "h2": "heading",
  "h3": "heading",
  "h4": "heading",
  "h5": "heading",
  "h6": "heading",
  "hr": "separator",
  "html": "document",
  "i": "generic",
  "img": "img",
  "ins": "insertion",
  "li": "listitem",
  "main": "main",
  "math": "math",
  "menu": "list",
  "meter": "meter",
  "nav": "navigation",
  "ol": "list",
  "optgroup": "group",
  "option": "option",
  "output": "status",
  "p": "paragraph",
  "pre": "generic",
  "progress": "progressbar",
  "q": "generic",
  "s": "deletion",
  "samp": "generic",
  "search": "search",
  "section": "region",
  "select": "listbox",
  "small": "generic",
  "span": "generic",
  "strong": "strong",
  "sub": "subscript",
  "sup": "superscript",
  "svg": "graphics-document",
  "table": "table",
  "tbody": "rowgroup",
  "td": "cell",
  "textarea": "textbox",
  "tfoot": "rowgroup",
  "th": "cell",
  "thead": "rowgroup",
  "time": "time",
  "tr": "row",
  "u": "generic",
  "ul": "list"
}

export const VALID_IMAGE_TAGS = [
  'canvas',
  'img',
  'map',
  'picture',
  'source',
  'svg',
]

/* From https://github.com/IBMa/equal-access/blob/1ea7a8a7d739bb0f57f1d025215c8a6adec0f258/accessibility-checker-engine/src/v4/rules/widget_tabbable_exists.ts#L24. */
export const WIDGET_ROLES = [
  "button",
  "checkbox",
  "combobox",
  "grid",
  "link",
  "listbox",
  "menu",
  "menubar",
  "radiogroup",
  "scrollbar",
  "slider",
  "spinbutton",
  "tablist",
  "textbox",
  "tree",
  "treegrid",
]