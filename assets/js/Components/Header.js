import React from 'react';
import Logo from '../../udoit_logo.png';
import classes from '../../css/header.scss';

class Header extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {}
  }

  render() {
    return (
      <div className={`${classes.headerContainer}`}>
        <img className={`${classes.logo}`} src={Logo}></img>
      </div>
    )
  }
}

export default Header;