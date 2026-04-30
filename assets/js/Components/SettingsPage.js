import React, { useState, useEffect } from 'react'
import UDOITLogo from '../../mediaAssets/udoit-logo.svg'
import UDOITLogoDark from '../../mediaAssets/udoit-logo-inverse.svg'
import Combobox from './Widgets/Combobox'
import ToggleSwitch from './Widgets/ToggleSwitch'
import './SettingsPage.css'

export default function SettingsPage({
  t,
  instanceInfo,
  preferences,
  updateUserPreferences,
  textSpacing,
  setTextSpacing
}) {

  const [alertOptions, setAlertOptions] = useState([])
  const [fontSizeOptions, setFontSizeOptions] = useState([])
  const [fontFamilyOptions, setFontFamilyOptions] = useState([])
  const [languageOptions, setLanguageOptions] = useState([])

  useEffect(() => {
    // Set up alert options
    let currentAlertTimeout = preferences.alertTimeout
    setAlertOptions([
      { value: '5000', name: t('settings.option.alert_timeout.5s'), selected: currentAlertTimeout === '5000' },
      { value: '10000', name: t('settings.option.alert_timeout.10s'), selected: currentAlertTimeout === '10000' },
      { value: '20000', name: t('settings.option.alert_timeout.20s'), selected: currentAlertTimeout === '20000' },
      { value: 'none', name: t('settings.option.alert_timeout.none'), selected: currentAlertTimeout === 'none' }
    ])

    // Set up font size options
    let currentFontSize = preferences.fontSize
    setFontSizeOptions([
      { value: 'font-small', name: t('settings.label.font_size.small'), selected: currentFontSize === 'font-small' },
      { value: 'font-medium', name: t('settings.label.font_size.medium'), selected: currentFontSize === 'font-medium' },
      { value: 'font-large', name: t('settings.label.font_size.large'), selected: currentFontSize === 'font-large' },
      { value: 'font-xlarge', name: t('settings.label.font_size.xlarge'), selected: currentFontSize === 'font-xlarge' }
    ])

    // Set up font family options
    let currentFontFamily = preferences.fontFamily
    setFontFamilyOptions([
      { value: 'sans-serif', name: t('settings.label.font_family.sans_serif'), selected: currentFontFamily === 'sans-serif' },
      { value: 'serif', name: t('settings.label.font_family.serif'), selected: currentFontFamily === 'serif' },
      { value: 'readable', name: t('settings.label.font_family.readable'), selected: currentFontFamily === 'readable' },
      { value: 'hyperlegible', name: t('settings.label.font_family.hyperlegible'), selected: currentFontFamily === 'hyperlegible' }
    ])

    // Set up language options
    let currentLanguage = preferences.lang
    setLanguageOptions([
      { value: 'en', name: 'English', selected: currentLanguage === 'en' },
      { value: 'es', name: 'Español', selected: currentLanguage === 'es' }
    ])
  }, [preferences, t])

  const [darkMode, setDarkMode] = useState(preferences.darkMode)

  const handleDarkModeChange = (newValue) => {
    setDarkMode(newValue)
    updateUserPreferences({ "darkMode": newValue })
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
    if(preferences[id] === value) {
      return
    }
    updateUserPreferences({ [id]: value })
  }

  const handleTextSpacingSlider = (e) => {
    const id = e.target.id
    const value = e.target.value
    if(!id || !value) {
      return
    }
    if(preferences[id] === value) {
      return
    }
    setTextSpacing(value)
    updateUserPreferences({ [id]: value })
  }

  return (
  <div className="flex-column settings-page-container h-100">
    <h1 className="pageTitle pb-2">{t('menu.settings')}</h1>

    <div className="page-container">
      <div className="settings-column">
        <div className="callout-container flex-column settings-container">

          <h2>{t('settings.title.display')}</h2>
          
          <div className="settings-row">
            <label id='combo-label-font_size'>{t('settings.label.font_size')}</label>
            <Combobox
              handleChange={handleComboboxChange}
              id='fontSize'
              label=''
              options={fontSizeOptions}
            />
          </div>

          <div className="settings-row">
            <label id='combo-label-font_family'>{t('settings.label.font_family')}</label>
            <Combobox
              handleChange={handleComboboxChange}
              id='fontFamily'
              label=''
              options={fontFamilyOptions}
            />
          </div>

          <div className='settings-row'>
            <label id='slider-label-text_spacing'>Text Spacing</label>
            <input
              id='textSpacing'
              type='range'
              min='0'
              max='100'
              step='1'
              value={textSpacing}
              onChange={(e) => setTextSpacing(e.target.value)}
              onMouseUp={handleTextSpacingSlider}
              onTouchEnd={handleTextSpacingSlider}
              onBlur={handleTextSpacingSlider}
              onKeyUp={handleTextSpacingSlider}
            />
          </div>

          <div className="settings-row">
            <label id="label-dark-mode">{t('settings.label.dark_mode')}</label>
            <ToggleSwitch
              labelId="label-dark-mode"
              initialValue={darkMode}
              updateToggle={handleDarkModeChange} />
          </div>

          <div className='divider' />
          
          <h2>{t('settings.title.preferences')}</h2>
          
          <div className="settings-row">
            <label id='combo-label-alert_timeout'>{t('settings.label.alert_timeout')}</label>
            <Combobox
              handleChange={handleComboboxChange}
              id='alertTimeout'
              label=''
              options={alertOptions}
            />
          </div>
          
          <div className="settings-row">
            <label id='combo-label-lang'>{t('settings.label.language')}</label>
            <Combobox
              handleChange={handleComboboxChange}
              id='lang'
              label=''
              options={languageOptions}
            />
          </div>
        </div>
      </div>

      <div className="about-column">
        <div className="callout-container flex-column gap-2">
          <div>
            <h2 aria-label={t('udoit')}>
              <img src={preferences.darkMode ? UDOITLogoDark : UDOITLogo} aria-hidden="true" className="udoit-logo"/>
            </h2>
            <div className="subtext version-number">{t('welcome.version')} {instanceInfo.versionNumber}</div>
          </div>
          {/* <a href='' target='_blank' rel='noopener noreferrer'>{t('settings.label.release_notes')}</a>
          <a href='' target='_blank' rel='noopener noreferrer'>{t('settings.label.documentation')}</a> */}
          <a href='https://ucfopen.github.io/udoit.info/' target='_blank' rel='noopener noreferrer'>{t('settings.label.about_udoit')}</a>
          <a href='https://ucfopen.github.io/' target='_blank' rel='noopener noreferrer'>{t('settings.label.about_ucfopen')}</a>
        </div>

        <div className="callout-container flex-column gap-2">
          <h2 className="m-0">{t('settings.title.disclaimer')}</h2>
          <p className="m-0">{t('settings.text.disclaimer')}</p>
        </div>
      </div>
    </div>
  </div>
  )
}