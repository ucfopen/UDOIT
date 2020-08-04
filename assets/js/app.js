import React from 'react'
import ReactDOM from 'react-dom'
import WelcomePage from './Components/WelcomePage'
import Header from './Components/Header'
import HeaderTabs from './Components/HeaderTabs'
import classes from '../css/app.scss';
import { Button } from '@instructure/ui-buttons'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import '@instructure/canvas-theme';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      "items": [],
      "isLoggedIn": false
    }

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(state => ({
      isLoggedIn: !state.isLoggedIn
    }));
  }

  render() {
    return (
      <div className={`${classes.app}`}>
        <Header/>
        <Display isLoggedIn={this.state.isLoggedIn} action={this.handleClick}/>
      </div>
    )
  }
}

const Display = (props) => {
  const isLoggedIn = props.isLoggedIn;

  if(isLoggedIn) {
    return <HeaderTabs/>
  } else {
    return [<div>
      <WelcomePage/>
      <div className={`${classes.buttonContainer}`}>
          <Button onClick={props.action} color="primary" margin="small" textAlign="center">Scan Course</Button>
      </div>
    </div>];
  }
}

ReactDOM.render(<App/>, document.getElementById('root'));