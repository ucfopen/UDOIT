import React from 'react'
import UDOITLogo from '../../mediaAssets/udoit-logo.svg'
import UDOITLogoDark from '../../mediaAssets/udoit-logo-inverse.svg'
import UCFOpenLogo from '../../mediaAssets/ucfopen-logo.svg'
import UCFOpenLogoDark from '../../mediaAssets/ucfopen-logo-inverse.svg'
import SummaryIcon from './Icons/SummaryIcon'
import UFIXITIcon from './Icons/UFIXITIcon'
import ReportIcon from './Icons/ReportIcon'
import ProgressIcon from './Icons/ProgressIcon'
import './WelcomePage.css'

export default function WelcomePage({ t, settings, syncComplete, setWelcomeClosed }) {

  // TODO: Once text is approved, add items to the translation file and use t to translate.
  // TODO: Add a place for the Messages component. If things don't load properly, I don't want to leave the user hanging.
  
  return (
    <main className="flex-column flex-grow-1">
      <div className="flex-column justify-content-between flex-grow-1">
        <div className="invisible-spacer"></div>
        <div className="flex-column">
          <div className="welcome-content-wrapper flex-column gap-3">
            <div className="welcome-content flex-column">
              <h1 className="primary-text text-center">{t('welcome.title')}</h1>
              <img src={settings?.user?.roles?.dark_mode ? UDOITLogoDark : UDOITLogo} alt={t('alt.UDOIT')} className="logo-large pt-3"/>
              <div className="text-center welcome-description">{t('welcome.description')}</div>
            </div>
            <div className="welcome-content-list-container">
              <div className="welcome-content-list-item">
                <div className="welcome-content-list-item-icon">
                  <SummaryIcon className="icon-lg primary-text"/>
                </div>
                <div className="summary-text flex-grow-1">
                  {t('welcome.scan')}
                </div>
              </div>
              <div className="welcome-content-list-item">
                <div className="welcome-content-list-item-icon">
                  <UFIXITIcon className="icon-lg primary-text"/>
                </div>
                <div className="summary-text flex-grow-1">
                  {t('welcome.fix')}
                </div>
              </div>
              <div className="welcome-content-list-item">
                <div className="welcome-content-list-item-icon">
                  <ReportIcon className="icon-lg primary-text"/>
                </div>
                <div className="summary-text flex-grow-1">
                  {t('welcome.report')}
                </div>
              </div>
            </div>
          </div>
          <div className="flex-row justify-content-center mt-3">
            { !syncComplete ? (
                <button className="btn-large btn-disabled flex-row" tabIndex="0">
                  <div className="flex-column justify-content-center align-self-center">
                    <ProgressIcon className="icon-md spinner" />
                  </div>
                  <div className="flex-column justify-content-center ms-3">
                    {t('welcome.button.scanning')}
                  </div>
                </button>
              ) : (
                <button className="btn-large btn-primary" tabIndex="0" onClick={() => setWelcomeClosed(true)}>{t('welcome.button.ready')}</button>
              )
            }    
          </div>
        </div>
        <div className="welcome-footer flex-row justify-content-between ps-3 pe-3 gap-3">
          <div className="flex-column justify-content-center tagline">
            {t('welcome.version')} {settings.versionNumber}
          </div>
          <a href="https://ucfopen.github.io/" target="_blank" tabIndex="0" rel="noreferrer" className="tagline ps-2">
            <div className="flex-row">
              <div className="flex-column justify-content-center">
                {t('welcome.product_tagline')}
              </div>
              <div className="flex-column justify-content-center ms-2">
                <img src={settings?.user?.roles?.dark_mode ? UCFOpenLogoDark : UCFOpenLogo} alt={t('alt.UCF_Open')} className="logo-small"/>
              </div>
            </div>
          </a>
        </div>
      </div>
    </main>
  )
}