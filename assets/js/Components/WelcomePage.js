import React from 'react'
import UDOITLogo from '../../mediaAssets/udoit-logo.svg'
import UDOITLogoDark from '../../mediaAssets/udoit-logo-inverse.svg'
import UCFOpenLogo from '../../mediaAssets/ucfopen-logo.svg'
import UCFOpenLogoDark from '../../mediaAssets/ucfopen-logo-inverse.svg'
import CheckIcon from './Icons/CheckIcon'
import './WelcomePage.css'

export default function WelcomePage({
  t,
  settings,
  syncComplete,
  setWelcomeClosed
}) {
  
  return (
    <main className="flex-column flex-grow-1">
      <div className="flex-column justify-content-between flex-grow-1">
        <div className="invisible-spacer"></div>

        <div className="callout-container welcome-container">
          <h1 className="m-0 pt-3 pb-4 flex-row justify-content-center">
            <img
              src={settings?.user?.roles?.dark_mode ? UDOITLogoDark : UDOITLogo}
              alt={t('udoit')}
              aria-label={t('udoit')}
              title={t('alt.UDOIT')}
              className="logo-large" />
          </h1>
          
          <h2 className="m-0">{t('welcome.subtitle')}</h2>

          <p>{t('welcome.description')}</p>
 
          {!syncComplete && (
            <div className="scanner-container w-100 flex-column justify-content-center gap-2">
              <div className="status-text">{t('welcome.label.scanning')}</div>
              <div className={`loader ${syncComplete ? 'complete' : ''}`} />
            </div>
          )}
          {syncComplete && (
            <div className="scanner-container w-100 flex-row justify-content-center align-items-center gap-2">
              <CheckIcon className="icon-lg udoit-success" />
              <div className="status-text">{t('welcome.label.scan_complete')}</div>
            </div>
          )}

          <button
            className="btn-large btn-primary"
            tabIndex="0"
            disabled={!syncComplete}
            onClick={() => setWelcomeClosed(syncComplete)}>
            {t('welcome.button.ready')}
          </button>
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