import React from 'react'
import { Checkbox } from '@instructure/ui-checkbox';
import { View } from '@instructure/ui-view'
import { Text } from '@instructure/ui-text'
import { TextArea } from '@instructure/ui-text-area'
import { Button } from '@instructure/ui-buttons'
import { Spinner } from '@instructure/ui-spinner'
import Html from '../../Services/Html';


export default class AltText extends React.Component {
  constructor(props) {
    super(props)

    this.maxLength = 150

    let altText = Html.getAttribute(this.props.activeIssue.sourceHtml, "alt")
    altText = (typeof altText === 'string') ? altText : ''

    this.state = {
      textInputValue: altText,
      isDecorative: this.elementIsDecorative(this.props.activeIssue.sourceHtml),
      characterCount: altText.length,
      textInputErrors: []
    }

    this.formErrors = []

    this.handleButton = this.handleButton.bind(this)
    this.handleInput = this.handleInput.bind(this)
    this.handleCheckbox = this.handleCheckbox.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.activeIssue !== this.props.activeIssue) {
      const html = (this.props.activeIssue.newHtml) ? this.props.activeIssue.newHtml : this.props.activeIssue.sourceHtml
      let altText = Html.getAttribute(html, 'alt')
      altText = (typeof altText === 'string') ? altText : ''

      this.setState({
        textInputValue: altText,
        isDecorative: this.elementIsDecorative(html),
        characterCount: altText.length,
        textInputErrors: [],
      })
    }
  }

  handleButton() {
    this.formErrors = []

    if (!this.state.isDecorative) {
      this.checkTextNotEmpty()
      this.checkTextLength()
      this.checkForFileExtensions()
      this.checkFileName()
    }

    if (this.formErrors.length > 0) {
      this.setState({ textInputErrors: this.formErrors })
    } else {
      const html = (this.props.activeIssue.newHtml) ? this.props.activeIssue.newHtml : this.props.activeIssue.sourceHtml
      let element = Html.toElement(html)

      if (this.state.isDecorative) {
        element = Html.setAttribute(element, "data-decorative", "true")
        element = Html.setAttribute(element, 'alt', '')
      } else {
        element = Html.removeAttribute(element, "data-decorative")
        element = Html.setAttribute(element, "alt", this.state.textInputValue)
      }
  
      let issue = this.props.activeIssue
      issue.newHtml = Html.toString(element)

      this.props.handleIssueSave(issue)
    }
  }

  handleInput(event) {
    this.setState({
      textInputValue: event.target.value,
      characterCount: event.target.value.length
    })
  }

  handleCheckbox() {
    this.setState({
      isDecorative: !this.state.isDecorative
    })
  }

  checkTextNotEmpty() {
    const text = this.state.textInputValue.trim().toLowerCase()
    if (text === '') {
      this.formErrors.push({ text: this.props.t('form.alt.msg.text_empty'), type: 'error' })
    }
  }

  checkTextLength() {
    const text = this.state.textInputValue.trim().toLowerCase()
    if (text.length > this.maxLength) {
      this.formErrors.push({ text: this.props.t('form.alt.msg.text_too_long'), type: 'error' })
    }
  }

  checkForFileExtensions() {
    let fileRegex = /([a-zA-Z0-9\s_\\.\-\(\):])+(.png|.jpg|.jpeg|.gif)$/i

    if (this.state.textInputValue.match(fileRegex) != null) {
      this.formErrors.push({ text: this.props.t('form.alt.msg.text_has_file_extension'), type: 'error' })
    }
  }

  checkFileName() {
    let fileName = Html.getAttribute(this.props.activeIssue.sourceHtml, "src")

    if (this.state.textInputValue === fileName) {
      this.formErrors.push({ text: this.props.t('form.alt.msg.text_matches_filename'), type: 'error' })
    }
  }

  elementIsDecorative(htmlString) {
    const decorativeAttribute = Html.getAttribute(htmlString, "data-decorative")

    return (decorativeAttribute === 'true')
  }

  render() {
    const pending = (this.props.activeIssue && (this.props.activeIssue.pending == '1'))
    const buttonLabel = (pending) ? 'form.processing' : 'form.submit'

    return (
      <View as="div" padding="x-small">
        <View>
          <TextArea
            label={this.props.t('form.alt.text')}
            display="inline-block"
            width="100%"
            onChange={this.handleInput}
            value={this.state.textInputValue}
            id="textInputValue"
            disabled={this.state.isDecorative}
            messages={this.state.textInputErrors}
          />
        </View>
        <View as="div" textAlign="end" padding="x-small 0 0 0">
          <Text size="small" weight="light">
            {this.state.characterCount} {this.props.t('form.alt.of')} {this.maxLength} {this.props.t('form.alt.chars')}
          </Text>
        </View>
        <View as="div" margin="0 0 small 0">
          <Checkbox label={this.props.t('form.alt.mark_decorative')} 
            checked={this.state.isDecorative} 
            onChange={this.handleCheckbox} />
        </View>
        <View as="div" margin="small 0">
          <Button color="primary" onClick={this.handleButton} interaction={(!pending) ? 'enabled' : 'disabled'}>
            {('1' == pending) && <Spinner size="x-small" renderTitle={this.props.t(buttonLabel)} />}
            {this.props.t(buttonLabel)}
          </Button>
        </View>
      </View>
    );
  }
}