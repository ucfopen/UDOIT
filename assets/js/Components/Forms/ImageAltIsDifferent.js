import React from 'react'
import { View } from '@instructure/ui-view'
import { Text } from '@instructure/ui-text'
import { TextInput } from '@instructure/ui-text-input'
import { Button } from '@instructure/ui-buttons'
import { ScreenReaderContent } from '@instructure/ui-a11y-content'
import { Alert } from '@instructure/ui-alerts'
import Api from '../../Services/Api';

export default class ImageAltIsDifferent extends React.Component {
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
    return (
        <View display="block" textAlign="start" margin="0 small 0 0">
          <View display="block">
            {this.renderAlert()}
          </View>
          <View display="block">
            <TextInput
              renderLabel="Alternative Text"
              display="block"
              placeholder="New alternative text"
              onChange={this.handleInput}
            />
          </View>
          <View display="block" margin="small 0">
            <Button color="primary" onClick={this.handleButton}>Save Changes</Button>
          </View>
        </View>
    );
  }
}