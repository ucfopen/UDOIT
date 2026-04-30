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