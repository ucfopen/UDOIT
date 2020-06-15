import React from 'react';
import Logo from '../../udoit_logo.png';
import classes from '../../css/header.scss';

class Header extends React.Component {
  render() {
    return (
      <div className={`${classes.headerContainer}`}>
        <img className={`${classes.logo}`} src={Logo}></img>
      </div>
    )
  }
}

export default Header;