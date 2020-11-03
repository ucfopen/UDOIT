import React from 'react'
import { View } from '@instructure/ui-view'
import { Text } from '@instructure/ui-text'
import { TextArea } from '@instructure/ui-text-area'
import { Flex } from '@instructure/ui-flex'
import { Button } from '@instructure/ui-buttons'
import { ScreenReaderContent } from '@instructure/ui-a11y-content'
import { Alert } from '@instructure/ui-alerts'
import Api from '../../Services/Api';


export default class ContentTooLong extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      textInputValue: this.props.activeIssue.sourceHtml,
      showSuccessAlert: false,
      showFailureAlert: false,
      characterCount:  0
    }
    

    this.handleButton = this.handleButton.bind(this)
    this.handleInput = this.handleInput.bind(this)
  }

  componentDidMount(){
    this.setState({
      characterCount: this.state.textInputValue.length
    });
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

  handleInput(event){
    console.log(event.target.value)

    this.setState({
      textInputValue: event.target.value,
      characterCount: event.target.value.length
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
            <Text weight="bold">Shortened Content</Text>
          </Flex.Item>
          <Flex.Item margin="small">
            <TextArea
              renderLabel={<ScreenReaderContent>Shortened Content</ScreenReaderContent>}
              display="inline-block"
              value={this.state.textInputValue}
              width="25rem"
              onChange={this.handleInput}
            />
          </Flex.Item>
          <Flex.Item margin="small">
            <Text>Current character count: {this.state.characterCount}</Text>
          </Flex.Item>
          <Flex.Item margin="small">
            <Button color="primary" onClick={this.handleButton}>Save Changes</Button>
          </Flex.Item>
        </Flex>
      </View>
    );
  }
}