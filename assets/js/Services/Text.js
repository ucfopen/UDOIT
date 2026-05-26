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

export function getReadableFileSize(fileSize) {
  // Convert string to number if necessary
  if (typeof fileSize === 'string') {
    fileSize = parseInt(fileSize, 10)
  }
  if (isNaN(fileSize) || fileSize < 0) {
    return '0 bytes'
  }

  if (fileSize < 1024) {
    return fileSize + ' bytes'
  }
  else if (fileSize < 1048576) {
    return (fileSize / 1024).toFixed(1) + ' KB'  // A kilobyte is 1024 bytes
  }
  else {
    return (fileSize / 1048576).toFixed(1) + ' MB'  // A megabyte is 1024 kilobytes (1024^2 bytes)
  }
}

export function getReadableDateTime(dateString) {
  let date = new Date(dateString)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const day = String(date.getDate()).padStart(2, '0');

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}