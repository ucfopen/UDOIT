import React from 'react'
import { View } from '@instructure/ui-view'
import { Text } from '@instructure/ui-text'
import { TextInput } from '@instructure/ui-text-input'
import { Flex } from '@instructure/ui-flex'
import { Button } from '@instructure/ui-buttons'
import { ScreenReaderContent } from '@instructure/ui-a11y-content'
import { Alert } from '@instructure/ui-alerts'
import Api from '../../Services/Api';


export default class AnchorMustContainText extends React.Component {
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
      <View>
        {this.renderAlert()}
        <Flex direction="column" justifyItems="start">
          <Flex.Item margin="small">
            <Text weight="bold">Anchor Text</Text>
          </Flex.Item>
          <Flex.Item margin="small">
            <TextInput
              renderLabel={<ScreenReaderContent>Anchor Text</ScreenReaderContent>}
              display="inline-block"
              placeholder="New anchor text"
              width="25rem"
              onChange={this.handleInput}
            />
          </Flex.Item>
          <Flex.Item margin="small">
            <Button color="primary" onClick={this.handleButton}>Save Changes</Button>
          </Flex.Item>
        </Flex>
      </View>
    );
  }
}