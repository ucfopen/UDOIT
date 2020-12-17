import React from 'react'
import Logo from '../../mediaAssets/logo_salmon.png'
import Classes from '../../css/header.scss'
import { View } from '@instructure/ui-view'
import { Flex } from '@instructure/ui-flex'
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
      <AppNav
        screenReaderLabel={this.props.t('menu.udoit')}
        margin="small 0"
        renderBeforeItems={
          <View padding="0 medium 0 0">
            <img className={`${Classes.logo}`} src={Logo}></img>
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
            <Menu.Item href={pdfUrl}>{this.props.t('menu.download_pdf')}</Menu.Item>
          </Menu>
        }
        >
        <AppNav.Item
          renderLabel={this.props.t('label.summary')}
          isDisabled={('welcome' === this.props.navigation) && !this.props.hasNewReport}
          isSelected={('summary' === this.props.navigation)}
          onClick={() => this.props.handleNavigation('summary')} />
        <AppNav.Item
          renderLabel={this.props.t('label.content')}
          isDisabled={('welcome' === this.props.navigation) && !this.props.hasNewReport}
          isSelected={('content' === this.props.navigation)}
          onClick={() => this.props.handleNavigation('content')} />
        <AppNav.Item
          renderLabel={this.props.t('label.plural.file')}
          isDisabled={('welcome' === this.props.navigation) && !this.props.hasNewReport}
          isSelected={('files' === this.props.navigation)}
          onClick={() => this.props.handleNavigation('files')} />

      </AppNav>
    )
  }

  getPdfUrl() {
    let api = new Api(this.props.settings)
    return api.getPdfUrl()
  }
}

export default Header