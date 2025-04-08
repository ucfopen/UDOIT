// jadan
import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom';
import Logo from '../../mediaAssets/udoit_logo.svg'
import UDOITLogo from '../../mediaAssets/UDOIT-logo-gradient.png'
import './NewHeader.css'
import HomeIcon from './Icons/HomeIcon'
import ReportIcon from './Icons/ReportIcon'
import ContentPageIcon from './Icons/ContentPageIcon'

import Classes from '../../css/header.css'
import { View } from '@instructure/ui-view'
import { IconButton } from '@instructure/ui-buttons'
import { IconMoreSolid } from '@instructure/ui-icons'
import { Menu } from '@instructure/ui-menu'
import { AppNav } from '@instructure/ui-navigation'
import Api from '../Services/Api'
import SeverityIcon from './Icons/SeverityIcon';

export default function NewHeader({ t, settings, hasNewReport, navigation, handleNavigation, handleCourseRescan, handleFullCourseRescan, handleModal }) {
  // const [pdfUrl, setPdfUrl] = useState('')
  // const getPdfUrl = () => {
  //   let api = new Api(settings)
  //   return api.getPdfUrl()
  // }

  // useEffect(() => {
  //   setPdfUrl(getPdfUrl())
  // }, [])

  // const handleSelect= () => {
  //   setIsActive(!isActive);
  // }

  // const buttonStyle = {
  //   color: isSelected ? '#48a3ff' : 'black', 
  //   bordertop: isSelected ? 'solid #48a3ff' : 'none',
  //   borderTopWidth: 'medium',
  //   padding: '14px'
  // }

  return (
    <header role="banner">
      <nav >
        <div >
          <img className={`${Classes.logo}`} alt="UDOIT" src={UDOITLogo}></img>
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
            className={`flex-row ${navigation === 'content' ? ' active-link' : ''}`}
            onClick={()=>handleNavigation('content')}>
            <div className='flex-column justify-content-center'>
            <ContentPageIcon className='icon-md pr-1'/> 
            </div>
            <div className='flex-column justify-content-center'>
            {t('label.fix.issues')}
            </div></li>
            <li
            className={`flex-row ${navigation === 'reports' ? ' active-link' : ''}`}
            onClick={()=>handleNavigation('reports')}>
            <div className='flex-column justify-content-center'>
            <ReportIcon className='icon-md pr-1'/>
            </div>
            <div className='flex-column justify-content-center'>
            {t('label.reports')}
            </div></li>
          </ul>
        </div>
      </nav>
      {/* <AppNav
        screenReaderLabel={t('menu.main')}
        margin="none"
        renderBeforeItems={
          <View as="h1" margin="0" padding="0 medium 0 0">
            <img className={`${Classes.logo}`} alt="UDOIT" src={UDOITLogo}></img>
          </View>
        }
        visibleItemsCount={3}
        renderAfterItems={
          <Menu
            placement="bottom"
            trigger={<IconButton withBackground={false} withBorder={false} color="secondary" screenReaderLabel={t('label.menu')}><IconMoreSolid /></IconButton>}
          >
            <Menu.Item onClick={() => handleModal('about')}>{t('menu.about')}</Menu.Item>
            <Menu.Item onClick={() => handleNavigation('reports')}>{t('menu.reports')}</Menu.Item>

            <Menu.Separator />
            <Menu.Item onClick={handleCourseRescan}>{t('menu.scan_course')}</Menu.Item>
            <Menu.Item onClick={handleFullCourseRescan}>{t('menu.full_rescan')}</Menu.Item>
            <Menu.Separator />
            <Menu.Item href={pdfUrl}>{t('menu.download_pdf')}</Menu.Item>
          </Menu>
        }
        >
        <AppNav.Item
          renderLabel={t('label.home')}
          isDisabled={('welcome' === navigation) && !hasNewReport}
          isSelected={('summary' === navigation)}
          onClick={() => handleNavigation('summary')} />
        <AppNav.Item
          renderLabel={t('label.ufixit')}
          isDisabled={('welcome' === navigation) && !hasNewReport}
          isSelected={('content' === navigation)}
          onClick={() => handleNavigation('content')} />
        <AppNav.Item
          renderLabel={t('label.review_files')}
          isDisabled={('welcome' === navigation) && !hasNewReport}
          isSelected={('files' === navigation)}
          onClick={() => handleNavigation('files')} />

      </AppNav> */}
    </header>
  )
}