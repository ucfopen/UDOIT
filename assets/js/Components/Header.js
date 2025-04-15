import React from 'react'
import UDOITLogo from '../../mediaAssets/UDOIT-logo-small-gradient.png'
import './Header.css'
import HomeIcon from './Icons/HomeIcon'
import ReportIcon from './Icons/ReportIcon'
import UFIXITIcon from './Icons/UFIXITIcon'
import Classes from '../../css/header.css'

export default function Header({ t, navigation, handleNavigation }) {

  return (
    <header role="banner">
      <nav >
        <div >
          <img className='flex-column' alt="UDOIT Logo" src={UDOITLogo}></img>
        </div>
        <div>
          <ul >
            <li
              className={`flex-row ${navigation === 'summary' ? ' active-link' : ''}`}
              onClick={()=>handleNavigation('summary')}>
              <div className='flex-column justify-content-center'>
                <HomeIcon className='icon-md pr-1'/>
              </div>
              <div className='flex-column justify-content-center'>
                {t('label.summary')}
              </div></li>
            <li 
              className={`flex-row ${navigation === 'fixIssues' ? ' active-link' : ''}`}
              onClick={()=>handleNavigation('fixIssues')}>
              <div className='flex-column justify-content-center'>
                <UFIXITIcon className='icon-md pr-1'/> 
              </div>
              <div className='flex-column justify-content-center'>
                {t('label.fix.issues')}
              </div>
            </li>
            <li
              className={`flex-row ${navigation === 'reports' ? ' active-link' : ''}`}
              onClick={()=>handleNavigation('reports')}>
              <div className='flex-column justify-content-center'>
                <ReportIcon className='icon-md pr-1'/>
              </div>
              <div className='flex-column justify-content-center'>
                {t('label.reports')}
              </div>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  )
}