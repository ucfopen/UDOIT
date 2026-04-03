import React, {useState, useEffect, use} from 'react'
import UDOITLogo from '../../mediaAssets/udoit-logo.svg'
import UDOITLogoDark from '../../mediaAssets/udoit-logo-inverse.svg'
import BarriersIcon from './Icons/BarriersIcon'
import CloseIcon from './Icons/CloseIcon'
import ContentFileIcon from './Icons/ContentFileIcon'
import HomeIcon from './Icons/HomeIcon'
import MenuIcon from './Icons/MenuIcon'
import ReportIcon from './Icons/ReportIcon'
import SettingsIcon from './Icons/SettingsIcon'
import ExpandIcon from './Icons/ExpandIcon'
import './Header.css'

export default function Header({
  t,
  settings,
  modalActive,
  navigation,
  handleNavigation,
  syncComplete
 }) {

  /*****************************************************************************************************************  
    *  Normally, a simple media query would be enough for toggling the nav to a mobile layout, however...
    *    1) We have a lot of variable font sizes (small vs x-large) that require different breakpoints.
    *    2) The nav labels can be wildly different lengths depending on the language.
    *  SOOOOOO, we have to check to see if the nav list is wider than its parent container. But this can
    *  be an issue because if we're in mobile mode, it never is. So I added a class called 'force-measurement'
    *  that undoes the mobile CSS so we can measure what the full menu bar would be without it showing for
    *  the user.
  *****************************************************************************************************************/
  const isNavOverflowing = () => {
    const navContainer = document.querySelector('#nav-container')
    const navList = document.querySelector('#nav-row')

    if(!navContainer || !navList) {
      return false
    }

    navContainer.classList.add('force-measurement')
    let navWidth = navList.clientWidth
    let containerWidth = navContainer.clientWidth
    navContainer.classList.remove('force-measurement')
    let isOverflowing = navWidth > containerWidth

    return isOverflowing
  }

  const [mobileMenuVisible, setMobileMenuVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(isNavOverflowing())

  const links = [
    { name: t('menu.summary'), icon: HomeIcon, key: 'summary' },
    { name: t('menu.all_barriers'), icon: BarriersIcon, key: 'fixIssues' },
    { name: t('menu.review_files'), icon: ContentFileIcon, key: 'reviewFiles' },
    { name: t('menu.reports'), icon: ReportIcon, key: 'reports' },
    { name: t('menu.settings'), icon: SettingsIcon, key: 'settings' },
  ]

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      try {
        document.documentElement.requestFullscreen()
      }
      catch (err) {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`)
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  const updateNavLayout = () => {
    const isOverflowing = isNavOverflowing()

    setIsMobile(isOverflowing)

    if (!isOverflowing) {
      setMobileMenuVisible(false)
    }
  }

  window.onresize = updateNavLayout

  useEffect(() => {
    updateNavLayout()
  }, [])

  useEffect(() => {
    // Wait until after the render to check if the nav is overflowing
    setTimeout(() => {
      updateNavLayout()
    }, 1)
  }, [settings])

  const handleClick = (destination) => {
    setMobileMenuVisible(false)
    handleNavigation(destination)
  }

  /* CSS-Only Responsive Mobile menu based on: https://blog.logrocket.com/create-responsive-mobile-menu-css-without-javascript/ */
  return (
    <header role="banner" inert={modalActive ? "inert" : undefined} aria-hidden={!modalActive}>
      <a className="skip-link" href="#main-content">{t('menu.nav.skip_to_main')}</a>
      <img alt={t('alt.UDOIT')} src={settings?.user?.roles?.dark_mode ? UDOITLogoDark : UDOITLogo}></img>
      <input
        id="nav-menu-toggle"
        tabIndex="-1"
        type="checkbox"
        aria-hidden="true"
        checked={mobileMenuVisible}
        onChange={() => {}}
      />
      
      <div id="nav-container" className={isMobile ? 'mobile' : ''}>
        <div className="flex-row gap-1" id="nav-row">
          <div
            id="nav-menu-toggle-icon"
            aria-label={t('menu.nav.toggle_menu')}
            role="button"
            aria-expanded={mobileMenuVisible}
            aria-controls="main-nav"
            aria-hidden={!isMobile}
            className="nav-menu-toggle-icon"
            onClick={() => setMobileMenuVisible(!mobileMenuVisible)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setMobileMenuVisible(!mobileMenuVisible)
              }
            }}
            tabIndex="0">
            {mobileMenuVisible ? <CloseIcon className="icon-md text-color" /> : <MenuIcon className="icon-md text-color" />}
          </div>
          <nav
            aria-label={t('menu.nav.label')}
            className={!mobileMenuVisible ? 'hide-mobile' : ''}>
            <ul id="main-nav">
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
          <ExpandIcon
            id="full-screen-toggle"
            className='icon-md close-icon'
            aria-label={t('menu.nav.toggle_full_screen')}
            title={t('menu.nav.toggle_full_screen')}
            onClick={toggleFullScreen}
            onKeyDown={(e) => {
              if(e.key === 'Enter' || e.key === ' ') {
                toggleFullScreen()
              }
            }}
            tabIndex='0' />
        </div>
      </div>
    </header>
  )
}