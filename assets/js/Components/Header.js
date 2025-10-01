import React from 'react'
import UDOITLogo from '../../mediaAssets/udoit-logo.svg'
import UDOITLogoDark from '../../mediaAssets/udoit-logo-inverse.svg'
import HomeIcon from './Icons/HomeIcon'
import BarriersIcon from './Icons/BarriersIcon'
import ReportIcon from './Icons/ReportIcon'
import SettingsIcon from './Icons/SettingsIcon'
import './Header.css'

export default function Header({
  t,
  settings,
  navigation,
  handleNavigation,
  syncComplete
}) {

  return (
    <header role="banner">
      <nav aria-label={t('menu.nav.label')}>
        <div>
          <img className='flex-column' alt={t('alt.UDOIT')} src={settings?.user?.roles?.dark_mode ? UDOITLogoDark : UDOITLogo}></img>
        </div>
        <div>
          <ul>
            <li
              className={`flex-row ${!syncComplete ? 'disabled' : ''} ${navigation === 'summary' ? ' active-link' : ''}`}
              onClick={() => handleNavigation('summary')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleNavigation('summary')
                }
              }}
              tabIndex='0'>
              <div className='flex-column justify-content-center'>
                <HomeIcon className='icon-md pr-1' />
              </div>
              <div className='flex-column justify-content-center'>
                {t('menu.summary')}
              </div></li>
            <li
              className={`flex-row ${!syncComplete ? 'disabled' : ''} ${navigation === 'fixIssues' ? ' active-link' : ''}`}
              onClick={() => handleNavigation('fixIssues')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleNavigation('fixIssues')
                }
              }}
              tabIndex='0'>
              <div className='flex-column justify-content-center'>
                <BarriersIcon className='icon-md pr-1' />
              </div>
              <div className='flex-column justify-content-center'>
                {t('menu.all_barriers')}
              </div>
            </li>
            <li
              className={`flex-row ${!syncComplete ? 'disabled' : ''} ${navigation === 'reports' ? ' active-link' : ''}`}
              onClick={() => handleNavigation('reports')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleNavigation('reports')
                }
              }}
              tabIndex='0'>
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleNavigation('settings')
                }
              }}
              tabIndex='0'>
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
