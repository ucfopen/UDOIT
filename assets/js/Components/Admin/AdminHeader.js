import React from 'react'
import UDOITLogo from '../../../mediaAssets/udoit-logo.svg'
import ContentAssignmentIcon from '../Icons/ContentAssignmentIcon'
import UserIcon from '../Icons/UserIcon'
import '../Header.css'

export default function AdminHeader({
  t,
  settings,
  navigation,
  handleNavigation
}) {
  return (
    <header role="banner">
      <nav aria-label={t('menu.nav.label')}>
        <div className="flex-row justify-content-start gap-2" onClick={() => handleNavigation('courses')}>
          <div className="flex-column justify-content-center" style={{ width: 'min-content' }}>
            <img alt={t('alt.UDOIT')} src={UDOITLogo}></img>
          </div>
          <div className="flex-column justify-content-center">
            <h1 className="mt-0 mb-0">{t('menu.admin')}</h1>
          </div>
        </div>
        <div>
          <ul>
            <li
              className={`flex-row ${navigation === 'courses' ? ' active-link' : ''}`}
              onClick={() => handleNavigation('courses')}
              onKeyDown={(e) => {
                if(e.key === 'Enter' || e.key === ' ') {
                  handleNavigation('courses')
                }
              }}
              tabIndex="0">
              <div className='flex-column justify-content-center'>
                <ContentAssignmentIcon className='icon-md pr-1'/>
              </div>
              <div className='flex-column justify-content-center'>
                {t('menu.admin.courses')}
              </div>
            </li>
            <li
              className={`flex-row ${navigation === 'users' ? ' active-link' : ''}`}
              onClick={() => handleNavigation('users')}
              onKeyDown={(e) => {
                if(e.key === 'Enter' || e.key === ' ') {
                  handleNavigation('users')
                }
              }}
              tabIndex="0">
              <div className='flex-column justify-content-center'>
                <UserIcon className='icon-md pr-1'/>
              </div>
              <div className='flex-column justify-content-center'>
                {t('menu.admin.users')}
              </div>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  )
}
