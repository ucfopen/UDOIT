import React from 'react'
import { Checkbox } from '@instructure/ui-checkbox';
import { View } from '@instructure/ui-view'
import { Text } from '@instructure/ui-text'
import { TextArea } from '@instructure/ui-text-area'
import { Button } from '@instructure/ui-buttons'
import { Alert } from '@instructure/ui-alerts'
import Html from '../../Services/Html';


export default class ImageAltIsDifferent extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      textInputValue: Html.getAltText(Html.toElement(this.props.activeIssue.sourceHtml)),
      showSuccessAlert: false,
      showFailureAlert: false,
      isDecorative: this.elementIsDecorative(this.props.activeIssue.sourceHtml),
      characterCount: Html.getAltText(Html.toElement(this.props.activeIssue.sourceHtml)).length,
      sourceHtml: this.props.activeIssue.sourceHtml,
      textInputErrors: []
    }

    this.formErrors = []

    this.handleButton = this.handleButton.bind(this)
    this.handleInput = this.handleInput.bind(this)
    this.handleCheckbox = this.handleCheckbox.bind(this)
    this.resetAlertState = this.resetAlertState.bind(this)
  }

  handleButton() {

    this.formErrors = []

    if(!this.state.isDecorative) {
        this.checkTextNotEmpty()
        this.checkTextLength()
        this.checkForFileExtensions()
        this.checkFileName()
    }

    if (this.formErrors.length > 0) {
        this.setState({ textInputErrors: this.formErrors })
    } else {
        let element = Html.toElement(this.state.sourceHtml)
        element.setAttribute("alt", this.state.textInputValue);

        let htmlString = Html.toString(element)

        let issue = this.props.activeIssue
        issue.newHtml = htmlString

        this.setState({
            sourceHtml: htmlString,
            showSuccessAlert: true,
            textInputErrors: this.formErrors
        })

        this.props.handleIssueSave(issue)
    }
  }

  handleInput(event){

    this.setState({
      textInputValue: event.target.value,
      characterCount: event.target.value.length,
    })


  }

  handleCheckbox(){

    let element = Html.toElement(this.state.sourceHtml)

    if(this.state.isDecorative) {
      element.setAttribute("decorative", "false")
    } else {
      element.setAttribute("decorative", "true")
    }

    let htmlString = Html.toString(element);

    this.setState({
      sourceHtml: htmlString,
      isDecorative: !this.state.isDecorative
    })
  }

  checkTextNotEmpty() {
    const text = this.state.textInputValue.trim().toLowerCase()
    if (text === '') {
      this.formErrors.push({text: this.props.t('form.alt.msg.text_empty'), type: 'error'})
    }
  }

  checkTextLength() {
    const text = this.state.textInputValue.trim().toLowerCase()
    if (text.length > 120) {
        this.formErrors.push({text: this.props.t('form.alt.msg.text_too_long'), type: 'error'})
    }
  }

  checkForFileExtensions() {
    let fileRegex = /([a-zA-Z0-9\s_\\.\-\(\):])+(.png|.jpg|.jpeg)$/i

    if (this.state.textInputValue.match(fileRegex) != null) {
        this.formErrors.push({text: this.props.t('form.alt.msg.text_has_file_extension'), type: 'error'})
    }
  }

  checkFileName() {
      let fileName = Html.getAttribute(Html.toElement(this.state.sourceHtml), "src")

      if (this.state.textInputValue === fileName) {
        this.formErrors.push({text: this.props.t('form.alt.msg.text_matches_filename'), type: 'error'})
      }
  }

  elementIsDecorative(htmlString) {
    let element = Html.toElement(htmlString)
    let decorativeAttribute = element.getAttribute("decorative")

    if(decorativeAttribute === null) {
      return false
    } else if(decorativeAttribute === "true") {
      return true
    } else if(decorativeAttribute === "false") {
      return false
    }

    return false
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

  render() {
    const htmlElement = Html.toElement(this.state.sourceHtml)

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
              renderLabel={this.props.t('form.alt.text')}
              display="inline-block"
              width="25rem"
              onChange={this.handleInput}
              defaultValue={Html.getAltText(htmlElement)}
              id="textInputValue"
              messages={this.state.textInputErrors}
            />  
          </View>
          <View display="inline-block" margin="medium">
            <Text>Current character count: {this.state.characterCount}</Text>
          </View>
          <View display="inline-block">
            <Checkbox label={this.props.t('form.alt.mark_decorative')} value="medium" checked={this.state.isDecorative} onChange={this.handleCheckbox}/>
          </View>
          <View display="block" margin="medium">
            <Button color="primary" onClick={this.handleButton}>Save Changes</Button>
          </View>
        </View>
    );
  }
}