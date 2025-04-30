import React, { useState, useEffect } from 'react'
import './SettingsPage.css'

export default function SettingsPage({
  t,
  settings,
  setSettings,
  updateLanguage,
  syncComplete,
  handleCourseRescan,
  handleFullCourseRescan }) {

  const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
  ]

  const [selectedLanguage, setSelectedLanguage] = useState(settings?.user?.roles?.lang || 'en')

  return (
  <main>
    <h1 className="primary-dark">{t('menu.settings')}</h1>
    <p><em>This page is a work in progress and is NOT complete. Please do not leave comments about its lack of functionality at this time. Thank you!</em></p>
    <label htmlFor="language-select">{t('settings.label.language')}</label>
    <select
      id="language-select"
      value={selectedLanguage}
      onChange={(e) => {
        setSelectedLanguage(e.target.value)
        updateLanguage(e.target.value)
      }}
      >
      {supportedLanguages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
      </select>
    <button onClick={() => handleFullCourseRescan()} disabled={!syncComplete} className="btn btn-primary mt-3">{syncComplete ? t('settings.button.force_full_rescan') : t('welcome.button.scanning')}</button>
  </main>
  )
}