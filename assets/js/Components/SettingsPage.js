import React, { useState, useEffect } from 'react'
import UDOITLogo from '../../mediaAssets/udoit-logo.svg'
import ProgressIcon from './Icons/ProgressIcon'
import './SettingsPage.css'

export default function SettingsPage({
  t,
  settings,
  updateUserSettings,
  syncComplete,
  handleFullCourseRescan }) {

  const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
  ]

  // For new users, the 'show_filters' attribute may not be set, so we need to check if it exists before using it
  const [showFilters, setShowFilters] = useState(settings?.user?.roles && ('show_filters' in settings.user.roles) ? settings.user.roles.show_filters : true)
  const [selectedLanguage, setSelectedLanguage] = useState(settings?.user?.roles?.lang || 'en')

  const handleShowFiltersChange = (newValue) => {
    setShowFilters(newValue)
    updateUserSettings({ "show_filters": newValue})
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
        <div className="callout-container flex-column flex-start">
          <div className="flex-row gap-1 mb-3">
            <div className="flex-column flex-center">
              <input
                type="checkbox"
                id="show-filters"
                name="show-filters"
                tabindex="0"
                checked={showFilters}
                onChange={(e) => {
                  handleShowFiltersChange(e.target.checked)
                }}
              />
            </div>
            <div className="flex-column flex-center">
              <label htmlFor="show-filters">{t('settings.label.show_filters_default')}</label>
            </div>
          </div>
          {/* <div className="flex-row gap-1 mb-3">
            <div className="flex-column flex-center">
              <label htmlFor="language-select">{t('settings.label.language')}</label>
            </div> */}
            {/* <div className="flex-column flex-center">
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
            </div> */}
          {/* </div> */}
          { !syncComplete ? (
            <button className="btn btn-disabled mt-2 flex-row" tabindex="-1">
              <div className="flex-column justify-content-center align-self-center">
                <ProgressIcon className="icon-sm gray spinner" />
              </div>
              <div className="flex-column justify-content-center ms-3">
                {t('welcome.button.scanning')}
              </div>
            </button>
            ) : (
              <button onClick={() => handleFullCourseRescan()} className="btn btn-primary mt-2" tabindex="0">{t('settings.button.force_full_rescan')}</button>
            )
          }
        </div>
      </div>
      <div className="about-container flex-grow-1">
        <div className="about-content flex-column ps-3 pe-3 pb-3">
          <img src={UDOITLogo} alt={t('alt.UDOIT')} className="logo-large"/>
          <div dangerouslySetInnerHTML={{__html: t('settings.text.about')}} />
          <div dangerouslySetInnerHTML={{__html: t('settings.text.tools')}} />
          <div dangerouslySetInnerHTML={{__html: t('settings.text.history')}} />
          <div dangerouslySetInnerHTML={{__html: t('settings.text.roadmap')}} />
          <div dangerouslySetInnerHTML={{__html: t('settings.text.disclaimer')}} />
        </div>
      </div>
    </div>
  </main>
  )
}