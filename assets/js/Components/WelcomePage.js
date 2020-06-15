import React from 'react';
import { Heading } from '@instructure/ui-elements'

class WelcomePage extends React.Component {
  render() {
    return (
      <div>
        <Heading>Welcome to UDOIT</Heading>

        <p>
        The Universal Design Online content Inspection Tool (UDOIT) will scan your course content, generate a report and provide instructions
        on how to correct accessibility issues. <b>This content should be customizable by the institution.</b>
        </p>

        <p>
        <b>Please Note:</b> This tool is meant to be used as a guide, not a certification. It only cehcks for common accessibility issues, and
        is not comprehensive; a ckean report in UDOIT does not necessarily mean that your course is fully accessible. Likewise, the tool may
        indicate a possible accessibility issue where one does not exist.
        </p>
      </div>
    )
  }
}

export default WelcomePage;