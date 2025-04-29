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

    if (Object.keys(data).length > 0) {
      console.info('UDOIT initial LMS data was found and loaded!')
    } else {
      console.error('No data loaded!')
    }
  }
  return data
}
