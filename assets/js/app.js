import React from 'react'
import ReactDOM from 'react-dom'
import WelcomePage from './Components/WelcomePage'
import Header from './Components/Header'
import Issue from './Components/Issue'
import ScanCheckbox from './Components/ScanCheckbox'
import ContentPiece from './Components/ContentPiece'
import classes from '../css/app.scss';

import '@instructure/canvas-theme';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      "items": []
    }
  }

  render() {
    return (
      <div className={`${classes.app}`}>
        <Header/>
        <Display isLoggedIn={false}/>
      </div>
    )
  }
}

const Display = (props) => {
  const isLoggedIn = props.isLoggedIn;

  if(isLoggedIn) {
    // return scan page
  } else {
    return <WelcomePage/>
  }
}

ReactDOM.render(<App/>, document.getElementById('root'));