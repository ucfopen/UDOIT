import React, {useState, useEffect} from 'react'
import UDOITLogo from '../../mediaAssets/udoit-logo.svg'
import UDOITLogoDark from '../../mediaAssets/udoit-logo-inverse.svg'
import BarriersIcon from './Icons/BarriersIcon'
import CloseIcon from './Icons/CloseIcon'
import ContentFileIcon from './Icons/ContentFileIcon'
import HomeIcon from './Icons/HomeIcon'
import MenuIcon from './Icons/MenuIcon'
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

  const screenThreshold = 1200;
  const [navMenuVisible, setNavMenuVisible] = useState(false);

  const links = [
    { name: t('menu.summary'), icon: HomeIcon, key: 'summary' },
    { name: t('menu.all_barriers'), icon: BarriersIcon, key: 'fixIssues' },
    { name: t('menu.review_files'), icon: ContentFileIcon, key: 'reviewFiles' },
    { name: t('menu.reports'), icon: ReportIcon, key: 'reports' },
    { name: t('menu.settings'), icon: SettingsIcon, key: 'settings' },
  ]

  const handleClick = (destination) => {
    setNavMenuVisible(false)
    handleNavigation(destination)
  }

  /* CSS-Only Responsive Mobile menu based on: https://blog.logrocket.com/create-responsive-mobile-menu-css-without-javascript/ */
  return (
    <header role="banner">
      <a className="skip-link" href="#main-content">{t('menu.nav.skip_to_main')}</a>
      <img alt={t('alt.UDOIT')} src={settings?.user?.roles?.dark_mode ? UDOITLogoDark : UDOITLogo}></img>
      <input
        id="nav-menu-toggle"
        tabIndex="-1"
        type="checkbox"
        aria-hidden="true"
        checked={navMenuVisible}
        onChange={() => {}}
      />
      <div
        aria-label={t('menu.nav.toggle_menu')}
        role="checkbox"
        aria-checked={navMenuVisible}
        className="nav-menu-toggle-icon"
        onClick={() => setNavMenuVisible(!navMenuVisible)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setNavMenuVisible(!navMenuVisible)
          }
        }}
        tabIndex="0">
        {navMenuVisible ? <CloseIcon className="icon-md text-color" /> : <MenuIcon className="icon-md text-color" />}
      </div>
      <nav aria-label={t('menu.nav.label')}>
        <ul>
          {links.map(link => (
            <li
              key={link.key}
              role="link"
              disabled={!syncComplete}
              aria-disabled={!syncComplete}
              aria-label={link.name}
              className={navigation === link.key ? 'active-link' : ''}
              onClick={()=>handleClick(link.key)}
              onKeyDown={(e) => {
                if(e.key === 'Enter' || e.key === ' ') {
                  handleClick(link.key)
                }
              }}
              tabIndex='0'>
              <link.icon className='icon-md' aria-hidden="true"/>
              <div aria-hidden="true">{link.name}</div>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}