import React from 'react';
import Logo from '../../mediaAssets/udoit_logo.png';
import classes from '../../css/header.scss';

class Header extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {}
  }

  render() {
    return (
      <div>
        <div className={`${classes.headerContainer}`}>
          <img className={`${classes.logo}`} src={Logo}></img>
        </div>
        <hr></hr>
      </div>
    )
  }
}

export default Header;