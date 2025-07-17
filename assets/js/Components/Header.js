import React from 'react'
import UDOITLogo from '../../mediaAssets/udoit-logo.svg'
import HomeIcon from './Icons/HomeIcon'
import UFIXITIcon from './Icons/UFIXITIcon'
import ReportIcon from './Icons/ReportIcon'
import SettingsIcon from './Icons/SettingsIcon'
import './Header.css'

export default function Header({
  t,
  navigation,
  handleNavigation,
  syncComplete
}) {

  return (
    <header role="banner">
      <nav>
        <div>
          <img className='flex-column' alt={t('alt.UDOIT')} src={UDOITLogo}></img>
        </div>
        <div>
          <ul>
            <li
              className={`flex-row ${!syncComplete ? 'disabled' : ''} ${navigation === 'summary' ? ' active-link' : ''}`}
              onClick={() => handleNavigation('summary')}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleNavigation('summary')
                }
              }}
              tabindex='0'>
              <div className='flex-column justify-content-center'>
                <HomeIcon className='icon-md pr-1' />
              </div>
              <div className='flex-column justify-content-center'>
                {t('menu.summary')}
              </div></li>
            <li
              className={`flex-row ${!syncComplete ? 'disabled' : ''} ${navigation === 'fixIssues' ? ' active-link' : ''}`}
              onClick={() => handleNavigation('fixIssues')}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleNavigation('fixIssues')
                }
              }}
              tabindex='0'>
              <div className='flex-column justify-content-center'>
                <UFIXITIcon className='icon-md pr-1' />
              </div>
              <div className='flex-column justify-content-center'>
                {t('menu.fix_issues')}
              </div>
            </li>
            <li
              className={`flex-row ${!syncComplete ? 'disabled' : ''} ${navigation === 'reports' ? ' active-link' : ''}`}
              onClick={() => handleNavigation('reports')}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleNavigation('reports')
                }
              }}
              tabindex='0'>
              <div className='flex-column justify-content-center'>
                <ReportIcon className='icon-md pr-1' />
              </div>
              <div className='flex-column justify-content-center'>
                {t('menu.reports')}
              </div>
            </li>
            <li
              className={`flex-row ${!syncComplete ? 'disabled' : ''} ${navigation === 'settings' ? ' active-link' : ''}`}
              onClick={() => handleNavigation('settings')}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleNavigation('settings')
                }
              }}
              tabindex='0'>
              <div className='flex-column justify-content-center'>
                <SettingsIcon className='icon-md pr-1' />
              </div>
              <div className='flex-column justify-content-center'>
                {t('menu.settings')}
              </div>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  )
}
