import React from 'react';
import { Heading } from '@instructure/ui-heading'
import classes from '../../css/welcomePage.scss';
import { ProgressCircle } from '@instructure/ui-progress'

class WelcomePage extends React.Component {
  render() {
    return (
      <div>
        <div className={`${classes.welcomeContainer}`}>
          <div className={`${classes.paragraph}`}>
          <Heading><b>Welcome to UDOIT</b></Heading>
          <br></br>
          The Universal Design Online content Inspection Tool (UDOIT) will scan your course content, generate a report and provide instructions
          on how to correct accessibility issues. <b>This content should be customizable by the institution.</b>
          <br></br><br></br>
          <a href="">What does UDOIT Look For?</a>
          </div>

          <div className={`${classes.paragraph}`}>
          <b>Please Note!</b><br></br><br></br>This tool is meant to be used as a guide, not a certification. It only checks for common accessibility issues, and
          is not comprehensive; a clean report in UDOIT does not necessarily mean that your course is fully accessible. Likewise, the tool may
          indicate a possible accessibility issue where one does not exist.
          </div>
        </div>

        <hr></hr>
      </div>
    )
  }
}

export default WelcomePage;