export default function getInitialData() {
  const settingsElement = document.querySelector(
    'body > script#toolSettings[type="application/json"]'
  )

  let data = {
    messages: [
      {
        message: 'Settings failed to load.',
        severity: 'warning',
        timeout: 5000,
      },
    ],
  }
  if (settingsElement !== null) {
    data = JSON.parse(settingsElement.textContent)

    if (Object.keys(data).length === 0) {
      console.error('UDOIT initial LMS data failed to load. Using default settings...')
    }
  }
  return data
}
