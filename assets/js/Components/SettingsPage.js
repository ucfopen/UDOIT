import React, { useState, useEffect } from 'react'
import UDOITLogo from '../../mediaAssets/udoit-logo.svg'
import UDOITLogoDark from '../../mediaAssets/udoit-logo-inverse.svg'
import Combobox from './Widgets/Combobox'
import './SettingsPage.css'

export default function SettingsPage({
  t,
  settings,
  updateUserSettings
}) {

  const [alertOptions, setAlertOptions] = useState([])
  const [fontSizeOptions, setFontSizeOptions] = useState([])
  const [fontFamilyOptions, setFontFamilyOptions] = useState([])
  const [languageOptions, setLanguageOptions] = useState([])

  useEffect(() => {
    // Set up alert options
    let currentAlertTimeout = settings?.user?.roles?.alert_timeout || settings.DEFAULT_USER_SETTINGS.ALERT_TIMEOUT
    setAlertOptions([
      { value: '5000', name: t('settings.option.alert_timeout.5s'), selected: currentAlertTimeout === '5000' },
      { value: '10000', name: t('settings.option.alert_timeout.10s'), selected: currentAlertTimeout === '10000' },
      { value: '20000', name: t('settings.option.alert_timeout.20s'), selected: currentAlertTimeout === '20000' },
      { value: 'none', name: t('settings.option.alert_timeout.none'), selected: currentAlertTimeout === 'none' }
    ])

    // Set up font size options
    let currentFontSize = settings?.user?.roles?.font_size || settings.DEFAULT_USER_SETTINGS.FONT_SIZE
    setFontSizeOptions([
      { value: 'font-small', name: t('settings.label.font_size.small'), selected: currentFontSize === 'font-small' },
      { value: 'font-medium', name: t('settings.label.font_size.medium'), selected: currentFontSize === 'font-medium' },
      { value: 'font-large', name: t('settings.label.font_size.large'), selected: currentFontSize === 'font-large' },
      { value: 'font-xlarge', name: t('settings.label.font_size.xlarge'), selected: currentFontSize === 'font-xlarge' }
    ])

    // Set up font family options
    let currentFontFamily = settings?.user?.roles?.font_family || settings.DEFAULT_USER_SETTINGS.FONT_FAMILY
    setFontFamilyOptions([
      { value: 'sans-serif', name: t('settings.label.font_family.sans_serif'), selected: currentFontFamily === 'sans-serif' },
      { value: 'serif', name: t('settings.label.font_family.serif'), selected: currentFontFamily === 'serif' },
      { value: 'readable', name: t('settings.label.font_family.readable'), selected: currentFontFamily === 'readable' },
      { value: 'hyperlegible', name: t('settings.label.font_family.hyperlegible'), selected: currentFontFamily === 'hyperlegible' }
    ])

    // Set up language options
    let currentLanguage = settings?.user?.roles?.lang || settings.DEFAULT_USER_SETTINGS.LANGUAGE
    setLanguageOptions([
      { value: 'en', name: 'English', selected: currentLanguage === 'en' },
      { value: 'es', name: 'Español', selected: currentLanguage === 'es' }
    ])
  }, [settings])

  // For new users, the 'show_filters' attribute may not be set, so we need to check if it exists before using it
  // Because the values might be false, we need to differentiate between undefined and false
  const [showFilters, setShowFilters] = useState(settings?.user?.roles && ('show_filters' in settings.user.roles) ? settings.user.roles.show_filters : settings.DEFAULT_USER_SETTINGS.SHOW_FILTERS)
  const [darkMode, setDarkMode] = useState(settings?.user?.roles && ('dark_mode' in settings.user.roles) ? settings.user.roles.dark_mode : settings.DEFAULT_USER_SETTINGS.DARK_MODE)

  const handleShowFiltersChange = (newValue) => {
    setShowFilters(newValue)
    updateUserSettings({ "show_filters": newValue })
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

  const handleComboboxChange = (id, value) => {
    if(!id || !value) {
      return
    }
    if(settings?.user?.roles[id] === value) {
      return
    }
    updateUserSettings({ [id]: value })
  }

  return (
  <div className="flex-column settings-page-container h-100">
    <h1 className="primary-dark flex-grow-0 flex-shrink-0">{t('menu.settings')}</h1>
    <div className="flex-row flex-grow-1 flex-shrink-1 gap-4 non-scrollable settings-row">
      <div className="flex-column flex-start flex-grow-0 flex-shrink-0 scrollable">
        <div className="callout-container flex-column flex-start settings-container">
          <Combobox
            handleChange={handleComboboxChange}
            id='alert_timeout'
            label={t('settings.label.alert_timeout')}
            options={alertOptions}
            settings={settings} />
          <Combobox
            handleChange={handleComboboxChange}
            id='font_size'
            label={t('settings.label.font_size')}
            options={fontSizeOptions}
            settings={settings} />
          <Combobox
            handleChange={handleComboboxChange}
            id='font_family'
            label={t('settings.label.font_family')}
            options={fontFamilyOptions}
            settings={settings} />
          <Combobox
            handleChange={handleComboboxChange}
            id='lang'
            label={t('settings.label.language')}
            options={languageOptions}
            settings={settings} />
          <div className="flex-row gap-2 mb-3">
            <label htmlFor="dark-mode" className="subtext pe-2">{t('settings.label.dark_mode')}</label>
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
            <label htmlFor="show-filters" className="subtext pe-2">{t('settings.label.show_filters_default')}</label>
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
        <div className="about-content flex-column ps-3 pe-3">
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