import React from 'react'
import { View } from '@instructure/ui-view'
import { Alert } from '@instructure/ui-alerts'

class MessageTray extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.clearMessages();
  }

  render() {
    console.log('msgs', this.props.messages);
    return (
      <View as="div">
        {this.props.messages.map((msg, i) => 
          <Alert variant={msg.severity} 
            timeout={msg.timeout} 
            renderCloseButtonLabel={this.props.t('label.close')} 
            onDismiss={this.props.clearMessages}
            margin="small large"
            key={`msg${i}`}>
            {msg.message}
          </Alert>)}
      </View>
    )
  }
}

export default MessageTray