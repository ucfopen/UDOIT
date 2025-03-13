import React from 'react'
import Logo from '../../mediaAssets/udoit_logo.svg'
import Classes from '../../css/header.css'
import { View } from '@instructure/ui-view'
import { IconButton } from '@instructure/ui-buttons'
import { IconMoreSolid } from '@instructure/ui-icons'
import { Menu } from '@instructure/ui-menu'
import { AppNav } from '@instructure/ui-navigation'
import Api from '../Services/Api'

class Header extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      showPopover: false
    }

    this.getPdfUrl = this.getPdfUrl.bind(this)
  }

  render() {
    const pdfUrl = this.getPdfUrl()

    return (
      <header role="banner">
        <AppNav
          screenReaderLabel={this.props.t('menu.main')}
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
              trigger={<IconButton withBackground={false} withBorder={false} color="secondary" screenReaderLabel={this.props.t('label.menu')}><IconMoreSolid /></IconButton>}
            >
              <Menu.Item onClick={() => this.props.handleModal('about')}>{this.props.t('menu.about')}</Menu.Item>
              <Menu.Item onClick={() => this.props.handleNavigation('reports')}>{this.props.t('menu.reports')}</Menu.Item>
              {/* <Menu.Item onClick={() => this.handleMoreNav('settings')}>{this.props.t('menu.settings')}</Menu.Item> */}
              <Menu.Separator />
              <Menu.Item onClick={this.props.handleCourseRescan}>{this.props.t('menu.scan_course')}</Menu.Item>
              <Menu.Item onClick={this.props.handleFullCourseRescan}>{this.props.t('menu.full_rescan')}</Menu.Item>
              <Menu.Separator />
              <Menu.Item href={pdfUrl}>{this.props.t('menu.download_pdf')}</Menu.Item>
            </Menu>
          }
          >
          <AppNav.Item
            renderLabel={this.props.t('label.home')}
            isSelected={('summary' === this.props.navigation)}
            onClick={() => this.props.handleNavigation('summary')} />
          <AppNav.Item
            renderLabel={this.props.t('label.ufixit')}
            isSelected={('content' === this.props.navigation)}
            onClick={() => this.props.handleNavigation('content')} />
          <AppNav.Item
            renderLabel={this.props.t('label.review_files')}
            isSelected={('files' === this.props.navigation)}
            onClick={() => this.props.handleNavigation('files')} />

        </AppNav>
      </header>
    )
  }

  getPdfUrl() {
    let api = new Api(this.props.settings)
    return api.getPdfUrl()
  }
}

export default Header
