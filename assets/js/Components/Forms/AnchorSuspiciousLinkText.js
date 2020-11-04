import React from 'react'
import { View } from '@instructure/ui-view'
import { Text } from '@instructure/ui-text'
import { TextInput } from '@instructure/ui-text-input'
import { Button } from '@instructure/ui-buttons'
import { ScreenReaderContent } from '@instructure/ui-a11y-content'
import { Alert } from '@instructure/ui-alerts'
import Api from '../../Services/Api';


export default class AnchorSuspiciousLinkText extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      textInputValue: '',
      showSuccessAlert: false,
      showFailureAlert: false
    }

    this.handleButton = this.handleButton.bind(this)
    this.handleInput = this.handleInput.bind(this)
  }

  handleButton() {
    console.log(this.state.textInputValue)
    
    //Submit input value via api call

    // Alert for success
    this.setState({
      showSuccessAlert: true
    })
    
    // Alert for failure

  }

  handleInput(event, value){
    console.log(value)

    this.setState({
      textInputValue: value
    })
  }

  renderAlert(){
    if(this.state.showSuccessAlert) {
      return <Alert
      variant="success"
      renderCloseButtonLabel="Close"
      margin="small"
      transition="none"
    >
      Your changes have been submitted
    </Alert>
    } else if(this.state.showFailureAlert) {

    }
  }

  render() {
    const UFixitApi = new Api()

    return (
      <View as="div" padding="0 small 0 0">
        {this.renderAlert()}
        <TextInput
          renderLabel="Anchor Text"
          display="block"
          placeholder="New anchor text"
          onChange={this.handleInput}
        />
        <View as="div" padding="small 0">
          <Button color="primary" onClick={this.handleButton}>Save Changes</Button>
        </View>
      </View>
  );
  }
}