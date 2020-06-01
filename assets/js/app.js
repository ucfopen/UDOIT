import React from 'react';
import ReactDOM from 'react-dom'
import WelcomePage from './Components/WelcomePage';
import Issue from './Components/Issue';
import SummaryPage from './Components/SummaryPage';
import UFIXIT from './Components/UFIXIT';
import Analytics from './Components/Analytics';

class App extends React.Component {
  render() {
    return (
      <div>
        <WelcomePage/>
        <Issue/>
        <SummaryPage/>
        <UFIXIT/>
        <Analytics/>
      </div>
    )
  }
}

ReactDOM.render(<App/>, document.getElementById('root'));