import React from 'react'
import Logo from '../../../mediaAssets/UDOIT-logo-small-gradient.png'

export default function AdminHeader({
  t,
  settings,
  navigation,
  handleNavigation
}) {
  return (
    <header role="banner">
      <div className="flex-row justify-content-between">
        <div
          className="flex-row mt-2 mb-2"
          onClick={() => handleNavigation('courses')}
          >
          <div className="flex-column justify-content-center">
            <img alt="UDOIT logo" src={Logo} style={{width: "150px", height: "fit-content"}}></img>
          </div>
          <div className="ms-3 flex-column justify-content-center">
            <h1 className="mt-0 mb-0">Admin</h1>
          </div>
        </div>
        <nav>
          <ul>
            <li
              className={(navigation === 'courses') ? 'selected' : ''}
              onClick={() => handleNavigation('courses')}
              tabIndex="0"
            >{t('label.admin.courses')}</li>
            <li
              className={(navigation === 'users') ? 'selected' : ''}
              onClick={() => handleNavigation('users')}
              tabIndex="0"
            >{t('label.admin.users')}</li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
