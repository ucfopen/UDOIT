import React, { useState, useEffect } from 'react'
import Logo from '../../mediaAssets/udoit_logo.svg'
import Classes from '../../css/header.css'
import { View } from '@instructure/ui-view'
import { IconButton } from '@instructure/ui-buttons'
import { IconMoreSolid } from '@instructure/ui-icons'
import { Menu } from '@instructure/ui-menu'
import { AppNav } from '@instructure/ui-navigation'
import Api from '../Services/Api'

export default function Header({ t, settings, hasNewReport, navigation, handleNavigation, handleCourseRescan, handleFullCourseRescan, handleModal }) {
  const [pdfUrl, setPdfUrl] = useState('')

  const getPdfUrl = () => {
    let api = new Api(settings)
    return api.getPdfUrl()
  }

  useEffect(() => {
    setPdfUrl(getPdfUrl())
  }, [])

  return (
    <header role="banner">
      <AppNav
        screenReaderLabel={t('menu.main')}
        margin="none"
        renderBeforeItems={
          <View as="h1" margin="0" padding="0 medium 0 0">
            <img className={`${Classes.logo}`} alt="UDOIT" src={Logo}></img>
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
          onClick={() => handleNavigation('fixIssues')} />
        <AppNav.Item
          renderLabel={t('label.review_files')}
          isDisabled={('welcome' === navigation) && !hasNewReport}
          isSelected={('files' === navigation)}
          onClick={() => handleNavigation('files')} />

      </AppNav>
    </header>
  )
}