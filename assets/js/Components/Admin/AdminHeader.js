import React from 'react'
//import Logo from '../../../mediaAssets/logo_salmon.png'
import Logo from '../../../mediaAssets/udoit_logo.svg'
import Classes from '../../../css/header.css'
import { View } from '@instructure/ui-view'
import { Text } from '@instructure/ui-text'
import { AppNav } from '@instructure/ui-navigation'

class AdminHeader extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {}
  }

  render() {
    return (
      <header role="banner">
        <AppNav
          screenReaderLabel={this.props.t('menu.udoit')}
          margin="small 0"
          renderBeforeItems={
            <View padding="0 medium 0 0" margin="0" as="h1">
              <img className={`${Classes.logo}`} alt="UDOIT logo" src={Logo}></img>
              <View display="inline-block" padding="x-small">
                <Text size="large" letterSpacing="expanded">{this.props.t('label.admin.logo')}</Text>
              </View>
            </View>
          }
          visibleItemsCount={3}
          >
          <AppNav.Item
            renderLabel={this.props.t('label.admin.courses')}
            isSelected={('courses' === this.props.navigation)}
            onClick={() => this.props.handleNavigation('courses')} />
          <AppNav.Item
            renderLabel={this.props.t('label.admin.reports')}
            isSelected={('reports' === this.props.navigation)}
            onClick={() => this.props.handleNavigation('reports')} />
          <AppNav.Item
            renderLabel={this.props.t('label.admin.users')}
            isSelected={('users' === this.props.navigation)}
            onClick={() => this.props.handleNavigation('users')} />
          {/* <AppNav.Item
            renderLabel={this.props.t('label.admin.settings')}
            isSelected={('settings' === this.props.navigation)}
            onClick={() => this.props.handleNavigation('settings')} /> */}

        </AppNav>
      </header>
    )
  }
}

export default AdminHeader
