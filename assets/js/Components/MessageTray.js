import React from 'react'
import { Alert } from '@instructure/ui-alerts'
import { Spinner } from '@instructure/ui-spinner'

import Classes from '../../css/app.css'

class MessageTray extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.clearMessages()
  }

  render() {
    return (
      <div className={Classes.messagesTray}>
        {!this.props.hasNewReport && (
          <Alert
            variant="info"
            renderCloseButtonLabel={this.props.t('label.close')}
            onDismiss={this.props.clearMessages}
            margin="small large"
            liveRegion={() => document.getElementsByClassName(Classes.messagesTray)[0]}
          >
            {this.props.t('label.content_loading_msg')}
            <Spinner size="x-small" margin="0 small" renderTitle="Loading" />
          </Alert>
        )}
        {this.props.messages.map((msg, i) => (
          <Alert
            variant={msg.severity}
            timeout={msg.timeout ? msg.timeout : 0}
            renderCloseButtonLabel={this.props.t('label.close')}
            onDismiss={this.props.clearMessages}
            margin="small large"
            key={`msg${i}`}
          >
            {this.props.t(msg.message)}
          </Alert>
        ))}
      </div>
    )
  }
}

export default MessageTray
