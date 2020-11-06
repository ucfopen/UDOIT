import React from 'react';
import Logo from '../../mediaAssets/logo_salmon.png';
import Classes from '../../css/header.scss';
import { View } from '@instructure/ui-view';

class Header extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {}
  }

  render() {
    return (
      <View as="div">
          <img className={`${Classes.logo}`} src={Logo}></img>
      </View>
    )
  }
}

export default Header;