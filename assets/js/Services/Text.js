const maxTextLength = 150

export function isTextEmpty(text) {

  if (text === undefined || text === null) {
    return true
  }

  // Check for and replace U+200E (invisible LTR character) with an empty string
  text = text.replaceAll(/\u200e/g, "")
  // Trim leading and trailing whitespace from the text
  text = text.trim()

  return text === '' || text.length === 0
}

export function isTextDescriptive(text) {
  if (isTextEmpty(text)) {
    return false
  }

  const lowerCaseText = text.trim().toLowerCase()
  const badOptions = [
    'click',
    'click here',
    'details',
    'more details',
    'here',
    'learn',
    'learn more',
    'more',
    'more info',
    'more information',
    'read',
    'read more',
    'visit',
    'visit here',
  ]

  return !badOptions.includes(lowerCaseText)
}

export function isTextTooLong(text, maxLength = maxTextLength) {
  if (isTextEmpty(text)) {
    return false
  }

  const trimmedText = text.trim()
  return trimmedText.length > maxLength
}