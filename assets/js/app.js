import React from 'react'
import ReactDOM from 'react-dom'
import WelcomePage from './Components/WelcomePage'
import Header from './Components/Header'
import Issue from './Components/Issue'
import ScanCheckbox from './Components/ScanCheckbox'
import ContentPiece from './Components/ContentPiece'
import classes from '../css/app.scss';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      "items": []
    }
  }
  render() {
    const items = [];

    loadIssues()

    return (
      <div className={`${classes.app}`}>
        {/* <Header/>
        <WelcomePage/>
        <Issue
          issueTitle = "test"
          severity = "warning"
          description = "test"
          url = "test.test"
          sectionTitle = "test"
        />
        <ScanCheckbox></ScanCheckbox> */}
        <ContentPiece/>
      </div>
    )
  }
}

ReactDOM.render(<App/>, document.getElementById('root'));