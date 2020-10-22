import React from 'react';
import Logo from '../../mediaAssets/udoit_logo.png';
import Classes from '../../css/header.scss';
import { View } from '@instructure/ui-view';

class Header extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {}
  }

  render() {
    return (
      <View padding="small 0" as="div">
          <img className={`${Classes.logo}`} src={Logo}></img>
      </View>
    )
  }
}

export default Header;