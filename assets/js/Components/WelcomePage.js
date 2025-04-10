import React from 'react'
import UDOITLogo from '../../mediaAssets/UDOIT-logo-med-gradient.png'
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
            <img src={UDOITLogo} alt="UDOIT Logo" className="logo-large"/>
            <h1 className="primary-text">{t('about.title')}</h1>
            <div>{t('about.description')}</div>
          </div>
          <div className="welcome-content flex-column justify-content-start">
            <div className="flex-row mb-3">
              <div className="flex-column justify-content-start flex-shrink-0 me-3">
                <SummaryIcon className="icon-lg primary-text"/>
              </div>
              <div className="summary-text flex-column justify-content-start flex-grow-1">
                {t('about.scan')}
              </div>
            </div>
            <div className="flex-row mb-3">
              <div className="flex-column justify-content-start flex-shrink-0 me-3">
                <UFIXITIcon className="icon-lg primary-text"/>
              </div>
              <div className="summary-text flex-column justify-content-start flex-grow-1">
                {t('about.fix')}
              </div>
            </div>
            <div className="flex-row mb-3">
              <div className="flex-column justify-content-start flex-shrink-0 me-3">
                <ReportIcon className="icon-lg primary-text"/>
              </div>
              <div className="summary-text flex-column justify-content-start flex-grow-1">
                {t('about.report')}
              </div>
            </div>
          </div>
        </div>
          <div className="flex-row justify-content-center mt-3">
            { !syncComplete ? (
                <button className="btn btn-disabled flex-row">
                  <div className="flex-column justify-content-center">
                    <ProgressIcon className="icon-sm gray spinner" />
                  </div>
                  <div className="flex-column justify-content-center ms-3">
                    {t('about.scanning')}
                  </div>
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => setWelcomeClosed(true)}>{t('about.ready')}</button>
              )
            }    
          </div>
      </div>
      <div className="welcome-footer flex-row justify-content-between mt-3">
        <div className="flex-column justify-content-center tagline">
          {t('label.version')} {settings.versionNumber}
        </div>
        <div className="flex-row">
          <div className="flex-column justify-content-center tagline">
            {t('about.product_tagline')}
          </div>
          <div className="flex-column justify-content-center ms-2">
            <a href="https://ucfopen.github.io/" target="_blank" rel="noreferrer">
              <img src={UCFOpenLogo} alt="UCF Open Logo" className="logo-small"/>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}