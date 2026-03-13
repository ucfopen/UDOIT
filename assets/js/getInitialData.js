export default async function getInitialData(settingsPath = 'api/settings') {
  try {
    const settingsUrl = new URL(settingsPath, window.location.href).toString()
    const response = await fetch(settingsUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Settings request failed: ${response.status}`)
    }

    const data = await response.json()

    if (!data || Object.keys(data).length === 0) {
      console.error('UDOIT initial LMS data failed to load. Using default settings...')
    }

    return data
  } catch (err) {
    console.error('Failed to load UDOIT settings:', err)
    return {
      messages: [
        {
          message: 'Settings failed to load.',
          severity: 'warning',
          timeout: 5000,
        },
      ],
    }
  }
}
