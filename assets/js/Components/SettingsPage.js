import React, { useState, useEffect } from 'react'
import './SettingsPage.css'

export default function SettingsPage({
  t,
  settings,
  setSettings,
  updateLanguage,
  handleCourseRescan,
  handleFullCourseRescan }) {

  const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
  ]

  const [selectedLanguage, setSelectedLanguage] = useState(settings?.user?.roles?.lang || 'en')

  return (
  <main>
    <h1>{t('menu.settings')}</h1>
    <label htmlFor="language-select">{t('menu.language')}</label>
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
    <button onClick={() => handleFullCourseRescan()} className="btn btn-primary mt-3">{t('menu.full_rescan')}</button>
  </main>
  )
}