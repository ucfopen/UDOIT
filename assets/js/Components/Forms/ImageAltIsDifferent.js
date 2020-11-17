import React from 'react'
import { Checkbox } from '@instructure/ui-checkbox';
import { View } from '@instructure/ui-view'
import { Text } from '@instructure/ui-text'
import { TextArea } from '@instructure/ui-text-area'
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
      showFailureAlert: false,
      isDecorative: this.elementIsDecorative(this.props.activeIssue.sourceHtml),
      characterCount:  0,
      sourceHtml: this.props.activeIssue.sourceHtml,
      showCharacterWarning: false,
      showFileExtensionWarning: false,
    }

    this.handleButton = this.handleButton.bind(this)
    this.handleInput = this.handleInput.bind(this)
    this.handleCheckbox = this.handleCheckbox.bind(this)
    this.resetAlertState = this.resetAlertState.bind(this)
  }

  handleButton() {

    if(this.state.showCharacterWarning || this.state.showFileExtensionWarning){
      this.setState({
        showFailureAlert: true,
        showSuccessAlert: false
      })
    } else {
      // Alert for success
      this.setState({
        showSuccessAlert: true,
        showFailureAlert: false
      })

      let element = this.createElementFromHTML(this.state.sourceHtml)
      element.setAttribute("alt", this.state.textInputValue);

      let htmlString = this.createStringFromHtml(element)
      let newIssue = Object.assign({}, this.props.activeIssue)

      newIssue.sourceHtml = htmlString
      newIssue.status = "fixed"

      this.props.handleIssueSave(newIssue)

      this.setState({
        sourceHtml: htmlString
      })
    }
    
  }

  handleInput(event){
    let fileRegex = /([a-zA-Z0-9\s_\\.\-\(\):])+(.png|.jpg|.jpeg)$/i

    console.log(event.target.value)
    console.log(event.target.value.match(fileRegex))

    this.setState({
      textInputValue: event.target.value,
      characterCount: event.target.value.length,
      showCharacterWarning: (event.target.value.length > 120) ? true : false,
      showFileExtensionWarning: event.target.value.match(fileRegex) != null,
    })


  }

  handleCheckbox(){

    let element = this.createElementFromHTML(this.state.sourceHtml)

    if(this.state.isDecorative) {
      element.setAttribute("decorative", "false")
    } else {
      element.setAttribute("decorative", "true")
    }

    let htmlString = this.createStringFromHtml(element);

    this.setState({
      sourceHtml: htmlString,
      isDecorative: !this.state.isDecorative
    })
  }

  getAltText(element) {
    if(element) {
      return element.getAttribute("alt");
    } else {
      return "Add alt text here"
    }
  }

  elementIsDecorative(htmlString) {
    let element = this.createElementFromHTML(htmlString)
    let decorativeAttribute = element.getAttribute("decorative")

    console.log(decorativeAttribute)
    if(decorativeAttribute === null) {
      return false
    } else if(decorativeAttribute === "true") {
      return true
    } else if(decorativeAttribute === "false") {
      return false
    }

    return false
  }

  createElementFromHTML(htmlString) {
    var div = document.createElement('div')
    div.innerHTML = htmlString.trim()
  
    return div.firstChild 
  }

  createStringFromHtml(element) {
    console.log(element.outerHTML)
    return element.outerHTML
  }

  resetAlertState() {
    this.setState({
      showFailureAlert: false,
      showSuccessAlert: false
    })
  }

  renderAlert(){
    if(this.state.showSuccessAlert) {
      return <Alert
      variant="success"
      renderCloseButtonLabel="Close"
      margin="small"
      transition="none"
      onDismiss={this.resetAlertState}
      >
        Your changes have been submitted
      </Alert>
    } else if(this.state.showFailureAlert) {
      return <Alert
      variant="error"
      renderCloseButtonLabel="Close"
      margin="small"
      transition="none"
      onDismiss={this.resetAlertState}
    >
      Please fix warnings before submitting changes
    </Alert>
    }
  }

  renderCharacterWarning(){
    if(this.state.showCharacterWarning) {
      return <Alert variant="warning" margin="small">
        Max character count exceeeded 
      </Alert>
    }
  }

  renderFileExtensionWarning(){
    if(this.state.showFileExtensionWarning) {
      return <Alert variant="warning" margin="small">
        Alt text cannot have file extensions (.jpg, .png, etc)
      </Alert>
    }
  }

  render() {
    const UFixitApi = new Api()
    const htmlElement = this.createElementFromHTML(this.state.sourceHtml)

    return (
        <View textAlign="start">
          <View display="block" margin="medium">
            {this.renderAlert()}
          </View>
          <View display="block" margin="medium">
            <Text weight="bold">Alternative Text</Text>
          </View>
          <View display="block" margin="medium">
          
            <TextArea
              renderLabel={<ScreenReaderContent>Shortened Alternative Text</ScreenReaderContent>}
              display="inline-block"
              width="25rem"
              onChange={this.handleInput}
              defaultValue={this.getAltText(htmlElement)}
            />  
          </View>
          <View display="inline-block" margin="medium">
            <Text>Current character count: {this.state.characterCount}</Text>
          </View>
          <View display="inline-block">
            <Checkbox label="Mark as Decorative" value="medium" checked={this.state.isDecorative} onChange={this.handleCheckbox}/>
          </View>
          <View display="block" margin="medium">
            <Button color="primary" onClick={this.handleButton}>Save Changes</Button>
          </View>
          <View display="inline-block">
            {this.renderCharacterWarning()}
            {this.renderFileExtensionWarning()}
          </View>
        </View>
    );
  }
}