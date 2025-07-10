import React from 'react'
import UDOITLogo from '../../mediaAssets/udoit-logo.svg'
import UCFOpenLogo from '../../mediaAssets/ucfopen-logo.svg'
import SummaryIcon from './Icons/SummaryIcon'
import UFIXITIcon from './Icons/UFIXITIcon'
import ReportIcon from './Icons/ReportIcon'
import ProgressIcon from './Icons/ProgressIcon'
import './WelcomePage.css'

export default function WelcomePage({ t, settings, syncComplete, setWelcomeClosed }) {

  // TODO: Once text is approved, add items to the translation file and use t to translate.
  // TODO: Add a place for the Messages component. If things don't load properly, I don't want to leave the user hanging.
  
  return (
    <div className="flex-column flex-grow-1">
      <div className="flex-column justify-content-center flex-grow-1">
        <div className="welcome-content-wrapper gap-3">
          <div className="welcome-content flex-column justify-content-start">
            <img src={UDOITLogo} alt={t('alt.UDOIT')} className="logo-large"/>
            <h1 className="primary-text">{t('welcome.title')}</h1>
            <div>{t('welcome.description')}</div>
          </div>
          <div className="welcome-content flex-column justify-content-start">
            <div className="flex-row mb-3">
              <div className="flex-column justify-content-start flex-shrink-0 me-3">
                <SummaryIcon className="icon-lg primary-text"/>
              </div>
              <div className="summary-text flex-column justify-content-start flex-grow-1">
                {t('welcome.scan')}
              </div>
            </div>
            <div className="flex-row mb-3">
              <div className="flex-column justify-content-start flex-shrink-0 me-3">
                <UFIXITIcon className="icon-lg primary-text"/>
              </div>
              <div className="summary-text flex-column justify-content-start flex-grow-1">
                {t('welcome.fix')}
              </div>
            </div>
            <div className="flex-row mb-3">
              <div className="flex-column justify-content-start flex-shrink-0 me-3">
                <ReportIcon className="icon-lg primary-text"/>
              </div>
              <div className="summary-text flex-column justify-content-start flex-grow-1">
                {t('welcome.report')}
              </div>
            </div>
          </div>
        </div>
        <div className="flex-row justify-content-center mt-3">
          { !syncComplete ? (
              <button className="btn btn-disabled flex-row" tabindex="0">
                <div className="flex-column justify-content-center align-self-center">
                  <ProgressIcon className="icon-sm spinner" />
                </div>
                <div className="flex-column justify-content-center ms-3">
                  {t('welcome.button.scanning')}
                </div>
              </button>
            ) : (
              <button className="btn btn-primary" tabindex="0" onClick={() => setWelcomeClosed(true)}>{t('welcome.button.ready')}</button>
            )
          }    
        </div>
      </div>
      <div className="welcome-footer flex-row justify-content-between mt-3">
        <div className="flex-column justify-content-center tagline">
          {t('welcome.version')} {settings.versionNumber}
        </div>
        <a href="https://ucfopen.github.io/" target="_blank" tabindex="0" rel="noreferrer" className="tagline ps-2">
          <div className="flex-row">
            <div className="flex-column justify-content-center">
              {t('welcome.product_tagline')}
            </div>
            <div className="flex-column justify-content-center ms-2">
              <img src={UCFOpenLogo} alt={t('alt.UCF_Open')} className="logo-small"/>
            </div>
          </div>
        </a>
      </div>
    </div>
  )
}