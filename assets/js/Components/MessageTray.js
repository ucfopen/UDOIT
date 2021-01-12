import React from 'react'
import { View } from '@instructure/ui-view'
import { Alert } from '@instructure/ui-alerts'
import { Spinner } from '@instructure/ui-spinner'

class MessageTray extends React.Component {

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.clearMessages()
  }

  render() {
    
    return (
      <View as="div">
        {!this.props.hasNewReport && 
          <Alert variant="info"
            renderCloseButtonLabel={this.props.t('label.close')}
            onDismiss={this.props.clearMessages}
            margin="small large"
            key={`msgContentLoading`}>
            {this.props.t('label.content_loading_msg')}
            <Spinner size="x-small" margin="0 small" renderTitle="Loading" />
          </Alert>
        }
        {this.props.messages.map((msg, i) => 
          <Alert variant={msg.severity} 
            timeout={(msg.timeout) ? msg.timeout : 0} 
            renderCloseButtonLabel={this.props.t('label.close')} 
            onDismiss={this.props.clearMessages}
            margin="small large"
            key={`msg${i}`}>
            {this.props.t(msg.message)}
          </Alert>)}
      </View>
    )
  }
}

export default MessageTray