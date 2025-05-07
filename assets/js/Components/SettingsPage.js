import React, { useState, useEffect } from 'react'
import UDOITLogo from '../../mediaAssets/udoit-logo.svg'
import './SettingsPage.css'

export default function SettingsPage({
  t,
  settings,
  updateUserSettings,
  syncComplete,
  handleCourseRescan,
  handleFullCourseRescan }) {

  const supportedLanguages = [
    { code: 'en', name: 'English' },
    // { code: 'es', name: 'Español' },
  ]

  const [selectedLanguage, setSelectedLanguage] = useState(settings?.user?.roles?.lang || 'en')
  const [viewOnlyPublished, setViewOnlyPublished] = useState(settings?.user?.roles?.view_only_published || false)

  const handleViewPublishedChange = (newValue) => {
    setViewOnlyPublished(newValue)
    updateUserSettings({ "view_only_published": newValue})
  }

  const handleLanguageChange = (newValue) => {
    setSelectedLanguage(newValue)
    updateUserSettings({ "lang": newValue})
  }

  return (
  <main>
    <h1 className="primary-dark">{t('menu.settings')}</h1>
    <div className="flex-row gap-4 mb-3">
      <div className="flex-column flex-start flex-grow-0 flex-shrink-0">
        <div className="settings-container flex-column flex-start">
          <div className="flex-row gap-1 mb-3">
            <div className="flex-column flex-center">
              <input
                type="checkbox"
                id="view-only-published"
                checked={viewOnlyPublished}
                onChange={(e) => {
                  handleViewPublishedChange(e.target.checked)
                }}
              />
            </div>
            <div className="flex-column flex-center">
              <label htmlFor="view-only-published">{t('settings.label.view_only_published')}</label>
            </div>
          </div>
          <div className="flex-row gap-1 mb-3">
            <div className="flex-column flex-center">
              <label htmlFor="language-select">{t('settings.label.language')}</label>
            </div>
            <div className="flex-column flex-center">
              <select
                id="language-select"
                value={selectedLanguage}
                onChange={(e) => {
                  handleLanguageChange(e.target.value)
                }}
                >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={() => handleFullCourseRescan()} disabled={!syncComplete} className="btn btn-primary mt-2">{syncComplete ? t('settings.button.force_full_rescan') : t('welcome.button.scanning')}</button>
        </div>
      </div>
      <div className="about-container flex-column flex-start flex-grow-1 ps-3 pe-3 pb-3">
        <img src={UDOITLogo} alt={t('alt.UDOIT')} className="logo-large"/>
        <div dangerouslySetInnerHTML={{__html: t('settings.text.about')}} />
        <div dangerouslySetInnerHTML={{__html: t('settings.text.tools')}} />
        <div dangerouslySetInnerHTML={{__html: t('settings.text.history')}} />
        <div dangerouslySetInnerHTML={{__html: t('settings.text.roadmap')}} />
        <div dangerouslySetInnerHTML={{__html: t('settings.text.disclaimer')}} />
      </div>
    </div>
  </main>
  )
}