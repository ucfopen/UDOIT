import React from 'react'
import { View } from '@instructure/ui-view'
import { Text } from '@instructure/ui-text'
import { TextArea } from '@instructure/ui-text-area'
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
    //Submit input value via api call

    // Alert for success
    this.setState({
      showSuccessAlert: true
    })
    
    // Alert for failure

  }

  handleInput(event){
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
      {this.props.t('content_length_too_long.changes.submitted')}
    </Alert>
    } else if(this.state.showFailureAlert) {

    }
  }

  render() {
    const UFixitApi = new Api()

    return (
      <View display="block" textAlign="start">
        <View display="block" margin="medium">
          {this.renderAlert()}
        </View>
        <View display="block" margin="medium">
          <Text weight="bold">Shortened Content</Text>
        </View>
        <View display="block" margin="medium">
          <TextArea
            renderLabel={<ScreenReaderContent>{this.props.t('content_length_too_long.shortened_content')}</ScreenReaderContent>}
            display="inline-block"
            value={this.state.textInputValue}
            width="25rem"
            onChange={this.handleInput}
          />  
        </View>
        <View display="block" margin="medium">
          <Text>{this.props.t('content_length_too_long.current_char_count')} {this.state.characterCount}</Text>
        </View>
        <View display="block" margin="medium">
          <Button color="primary" onClick={this.handleButton}>{this.props.t('button.save.changes')}</Button>
        </View>
      </View>
  );
  }
}