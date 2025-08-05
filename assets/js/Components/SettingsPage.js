import React, { useState, useEffect } from 'react'
import UDOITLogo from '../../mediaAssets/udoit-logo.svg'
import UDOITLogoDark from '../../mediaAssets/udoit-logo-inverse.svg'
import ProgressIcon from './Icons/ProgressIcon'
import './SettingsPage.css'

export default function SettingsPage({
  t,
  settings,
  updateUserSettings
}) {

  const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
  ]

  /* These sizes are classes that are applied to the body element to change the font size of the entire app. See udoit4-theme.css. */
  const fontSizes = [
    { value: 'font-small', title: t('settings.label.font_size.small') },
    { value: 'font-medium', title: t('settings.label.font_size.medium') },
    { value: 'font-large', title: t('settings.label.font_size.large') },
    { value: 'font-xlarge', title: t('settings.label.font_size.xlarge') }
  ]

  const fontFamilies = [
    { value: 'sans-serif', title: t('settings.label.font_family.sans_serif') },
    { value: 'serif', title: t('settings.label.font_family.serif') },
    { value: 'readable', title: t('settings.label.font_family.readable')},
    { value: 'hyperlegible', title: t('settings.label.font_family.hyperlegible') }
  ]

  // For new users, the 'show_filters' attribute may not be set, so we need to check if it exists before using it
  const [showFilters, setShowFilters] = useState(settings?.user?.roles && ('show_filters' in settings.user.roles) ? settings.user.roles.show_filters : true)
  const [darkMode, setDarkMode] = useState(settings?.user?.roles && ('dark_mode' in settings.user.roles) ? settings.user.roles.dark_mode : false)
  const [alertTimeout, setAlertTimeout] = useState(settings?.user?.roles?.alert_timeout || 5000)
  const [selectedLanguage, setSelectedLanguage] = useState(settings?.user?.roles?.lang || 'en')

  const handleShowFiltersChange = (newValue) => {
    setShowFilters(newValue)
    updateUserSettings({ "show_filters": newValue})
  }

  const handleDarkModeChange = (newValue) => {
    setDarkMode(newValue)
    updateUserSettings({ "dark_mode": newValue })
    if (newValue) {
      document.getElementById('app-container').classList.add('dark-mode')
    } else {
      document.getElementById('app-container').classList.remove('dark-mode')
    }
  }

  const handleAlertTimeoutChange = (newValue) => {
    setAlertTimeout(newValue)
    updateUserSettings({ "alert_timeout": newValue })
  }

  const handleLanguageChange = (newValue) => {
    setSelectedLanguage(newValue)
    updateUserSettings({ "lang": newValue})
  }

  return (
  <div className="flex-column settings-page-container h-100">
    <h1 className="primary-dark flex-grow-0 flex-shrink-0">{t('menu.settings')}</h1>
    <div className="flex-row flex-grow-1 flex-shrink-1 gap-4 non-scrollable settings-row">
      <div className="flex-column flex-start flex-grow-0 flex-shrink-0">
        <div className="callout-container flex-column flex-start settings-container">
          <div className="flex-row gap-2 mb-3">
            <div className="flex-column flex-center settings-label">
              <label htmlFor="alert-timeout">{t('settings.label.alert_timeout')}</label>
            </div>
            <div className="flex-column flex-center settings-input">
              <select
                id="alert-timeout"
                value={settings?.user?.roles?.alert_timeout || 5000}
                onChange={(e) => {
                  handleAlertTimeoutChange(e.target.value)
                }}
              >
                <option key="5000" value="5000">{t('settings.option.alert_timeout.5s')}</option>
                <option key="10000" value="10000">{t('settings.option.alert_timeout.10s')}</option>
                <option key="20000" value="20000">{t('settings.option.alert_timeout.20s')}</option>
                <option key="none" value="none">{t('settings.option.alert_timeout.none')}</option>
              </select>
            </div>
          </div>
          <div className="flex-row gap-2 mb-3">
            <div className="flex-column flex-center settings-label">
              <label htmlFor="font-size-select">{t('settings.label.font_size')}</label>
            </div>
            <div className="flex-column flex-center settings-input">
              <select
                id="font-size-select"
                value={settings?.user?.roles?.font_size || 'font-normal'}
                onChange={(e) => {
                  let appElement = document.getElementById('app-container')
                  if (appElement) {
                    appElement.classList.remove('font-small', 'font-normal', 'font-large', 'font-xlarge')
                    appElement.classList.add(e.target.value)
                  }
                  updateUserSettings({ "font_size": e.target.value })
                }}
              >
                {fontSizes.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
           <div className="flex-row gap-2 mb-3">
            <div className="flex-column flex-center settings-label">
              <label htmlFor="font-size-select">{t('settings.label.font_family')}</label>
            </div>
            <div className="flex-column flex-center settings-input">
              <select
                id="font-family-select"
                value={settings?.user?.roles?.font_family || 'sans-serif'}
                onChange={(e) => {
                  let appElement = document.getElementById('app-container')
                  if (appElement) {
                    appElement.classList.remove('sans-serif', 'serif', 'readable')
                    appElement.classList.add(e.target.value)
                  }
                  updateUserSettings({ "font_family": e.target.value })
                }}
              >
                {fontFamilies.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-row gap-2 mb-3">
            <div className="flex-column flex-center settings-label">
              <label htmlFor="language-select">{t('settings.label.language')}</label>
            </div>
            <div className="flex-column flex-center settings-input">
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

          <div className="flex-row gap-2 mb-3">
            <div className="flex-column flex-center settings-label">
              <label htmlFor="dark-mode">{t('settings.label.dark_mode')}</label>
            </div>
            <div className="flex-column flex-center settings-input">
              <input
                type="checkbox"
                id="dark-mode"
                name="dark-mode"
                tabIndex="0"
                checked={darkMode}
                onChange={(e) => {
                  handleDarkModeChange(e.target.checked)
                }}
              />
            </div>
          </div>

          <div className="flex-row gap-2 mb-3">
            <div className="flex-column flex-center settings-label">
              <label htmlFor="show-filters">{t('settings.label.show_filters_default')}</label>
            </div>
            <div className="flex-column flex-center settings-input">
              <input
                type="checkbox"
                id="show-filters"
                name="show-filters"
                tabIndex="0"
                checked={showFilters}
                onChange={(e) => {
                  handleShowFiltersChange(e.target.checked)
                }}
              />
            </div>
          </div>
          
        </div>
      </div>
      <div className="about-container flex-grow-1">
        <div className="about-content flex-column ps-3 pe-3 pb-3">
          <img src={settings?.user?.roles?.dark_mode ? UDOITLogoDark : UDOITLogo} alt={t('alt.UDOIT')} className="logo-large"/>
          <div dangerouslySetInnerHTML={{__html: t('settings.text.about')}} />
          <div dangerouslySetInnerHTML={{__html: t('settings.text.tools')}} />
          <div dangerouslySetInnerHTML={{__html: t('settings.text.history')}} />
          <div dangerouslySetInnerHTML={{__html: t('settings.text.roadmap')}} />
          <div dangerouslySetInnerHTML={{__html: t('settings.text.disclaimer')}} />
        </div>
      </div>
    </div>
  </div>
  )
}